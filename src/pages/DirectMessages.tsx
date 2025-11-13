import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePresence } from "@/contexts/PresenceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Send, ArrowLeft, Plus, Search as SearchIcon, Smile, Trash2, Pencil, X, Check, ChevronDown, Check as CheckIcon, CheckCheck } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from "date-fns";
import { ProfileCard } from "@/components/ProfileCard";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { MessageReactions } from "@/components/MessageReactions";
import { z } from "zod";

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  updated_at: string;
  other_user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    is_public: boolean | null;
  };
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  updated_at?: string;
}

const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(2000, { message: "Message must be less than 2000 characters" })
});

interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  is_public: boolean | null;
}

export default function DirectMessages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { onlineUserIds } = usePresence();
  const { markDirectAsRead } = useUnreadCounts();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUsers, setSearchUsers] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { typingUsers, setTyping } = useTypingIndicator(
    activeConversation ? `dm-typing-${activeConversation}` : 'dm-typing-none',
    currentUserId
  );

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
      setupConversationsSubscription();
    }
  }, [currentUserId]);

  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId && currentUserId) {
      // Auto-start conversation with user
      startConversation(userId);
    } else {
      const conversationId = searchParams.get("conversation");
      if (conversationId && currentUserId) {
        setActiveConversation(conversationId);
      }
    }
  }, [searchParams, currentUserId]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages();
      setupMessagesSubscription();
      markMessagesAsRead();
      markDirectAsRead(activeConversation);
    }
    return () => {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
      }
    };
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  };

  const handleScroll = (e: any) => {
    const element = e.target;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentGroup: { date: string; messages: Message[] } | null = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.created_at);
      const dateStr = format(messageDate, 'yyyy-MM-dd');

      if (!currentGroup || currentGroup.date !== dateStr) {
        currentGroup = { date: dateStr, messages: [message] };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(session.user.id);
    
    // Load user profile for display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', session.user.id)
      .single();
    
    setUserDisplayName(profile?.full_name || profile?.email || 'You');
  };

  const loadConversations = async () => {
    try {
      const { data: conversationsData, error } = await supabase
        .from("direct_conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Load other user profiles and last messages
      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherUserId = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;
          
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, email, is_public")
            .eq("id", otherUserId)
            .maybeSingle();

          const { data: lastMsg } = await supabase
            .from("direct_messages")
            .select("content")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from("direct_messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("read", false)
            .neq("sender_id", currentUserId);

          return {
            ...conv,
            other_user: profile,
            last_message: lastMsg?.content,
            unread_count: unreadCount || 0,
          };
        })
      );

      // Filter out conversations where the other user no longer exists (deleted account)
      const validConversations = enrichedConversations.filter(conv => conv.other_user !== null);
      setConversations(validConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const setupConversationsSubscription = () => {
    const channel = supabase
      .channel("direct-conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_conversations",
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadMessages = async () => {
    if (!activeConversation) return;

    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("conversation_id", activeConversation)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const setupMessagesSubscription = () => {
    if (!activeConversation) return;

    const channel = supabase
      .channel(`direct-messages-${activeConversation}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${activeConversation}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          if (payload.new.sender_id !== currentUserId) {
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    messagesChannelRef.current = channel;
  };

  const markMessagesAsRead = async () => {
    if (!activeConversation || !currentUserId) return;

    try {
      await supabase
        .from("direct_messages")
        .update({ read: true })
        .eq("conversation_id", activeConversation)
        .eq("read", false)
        .neq("sender_id", currentUserId);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !currentUserId) return;

    // Validate message
    const validation = messageSchema.safeParse({ content: newMessage.trim() });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: activeConversation,
        sender_id: currentUserId,
        content: validation.data.content,
      });

      if (error) throw error;
      setNewMessage("");
      setTyping(false, userDisplayName);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const searchAvailableUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email, is_public")
        .neq("id", currentUserId)
        .ilike("full_name", `%${query}%`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const startConversation = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc("get_or_create_conversation", {
        other_user_id: userId,
      });

      if (error) throw error;

      setShowNewChat(false);
      setSearchUsers("");
      setUsers([]);
      setActiveConversation(data);
      await loadConversations();
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this conversation? This will delete all messages.");
    if (!confirmed) return;

    try {
      // First delete all messages in the conversation
      await supabase
        .from("direct_messages")
        .delete()
        .eq("conversation_id", conversationId);

      // Then delete the conversation
      const { error } = await supabase
        .from("direct_conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }
      
      toast.success("Conversation deleted");
      await loadConversations();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleTyping = () => {
    setTyping(true, userDisplayName);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false, userDisplayName);
    }, 3000);
  };

  const filteredMessages = messages.filter((msg) =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    // Validate message
    const validation = messageSchema.safeParse({ content: editingContent.trim() });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    const { error } = await supabase
      .from("direct_messages")
      .update({ 
        content: validation.data.content,
        updated_at: new Date().toISOString()
      })
      .eq("id", messageId);

    if (error) {
      toast.error("Failed to update message");
    } else {
      toast.success("Message updated");
      cancelEditing();
    }
  };

  const activeConversationData = conversations.find((c) => c.id === activeConversation);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(filteredMessages);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 -z-10" />
      <div className="absolute inset-0 ai-grid opacity-20 -z-10" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000 -z-10" />
      
      <div className="container max-w-7xl mx-auto h-screen flex flex-col p-4 relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">{t("dm.title")}</h1>
          </div>
          <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("dm.newChat")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("dm.startNewChat")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("dm.searchUsers")}
                    value={searchUsers}
                    onChange={(e) => {
                      setSearchUsers(e.target.value);
                      searchAvailableUsers(e.target.value);
                    }}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                     {users.map((user) => {
                       const isPublic = user.is_public ?? true;
                       const displayName = isPublic ? (user.full_name || user.email || "Anonymous") : "Anonymous";
                       const displayAvatar = isPublic ? (user.avatar_url || "") : "";
                       const avatarFallback = isPublic ? (user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "A") : "A";
                       
                       return (
                         <button
                           key={user.id}
                           onClick={() => startConversation(user.id)}
                           className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                         >
                           <Avatar className="h-10 w-10">
                             <AvatarImage src={displayAvatar} />
                             <AvatarFallback>{avatarFallback}</AvatarFallback>
                           </Avatar>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-foreground">{displayName}</p>
                            </div>
                         </button>
                       );
                     })}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
          <Card className="md:col-span-1 flex flex-col border border-border/50 shadow-2xl backdrop-blur-sm bg-card/95 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                 {conversations.map((conv) => {
                   const isPublic = conv.other_user?.is_public ?? true;
                   const displayName = isPublic ? (conv.other_user?.full_name || conv.other_user?.email || "Anonymous") : "Anonymous";
                   const displayAvatar = isPublic ? (conv.other_user?.avatar_url || "") : "";
                   const avatarFallback = isPublic 
                     ? (conv.other_user?.full_name?.[0]?.toUpperCase() || conv.other_user?.email?.[0]?.toUpperCase() || "U")
                     : "A";
                   const isOnline = onlineUserIds.has(conv.other_user?.id || "");
                   
                    return (
                      <div key={conv.id} className="relative group">
                        <button
                          onClick={() => setActiveConversation(conv.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                            activeConversation === conv.id
                              ? "bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg scale-[1.02]"
                              : "hover:bg-muted/50 hover:shadow-md"
                          }`}
                        >
                       <div className="relative">
                         <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                           <AvatarImage src={displayAvatar} />
                           <AvatarFallback className="text-lg font-semibold">{avatarFallback}</AvatarFallback>
                         </Avatar>
                         {isOnline && (
                           <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500 animate-pulse" />
                         )}
                       </div>
                       <div className="flex-1 text-left min-w-0">
                         <div className="flex items-center justify-between mb-1">
                           <p className="font-semibold truncate text-base">{displayName}</p>
                           {conv.unread_count! > 0 && (
                             <span className="bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground text-xs font-bold rounded-full px-2.5 py-1 min-w-[24px] text-center shadow-md animate-pulse">
                               {conv.unread_count}
                             </span>
                           )}
                         </div>
                         <p className="text-sm text-muted-foreground truncate opacity-80">{conv.last_message || "Start a conversation..."}</p>
                        </div>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                {conversations.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>{t("dm.noConversations")}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          <Card className="md:col-span-2 flex flex-col border border-border/50 shadow-2xl backdrop-blur-sm bg-card/95 overflow-hidden">
            {activeConversation ? (
              <>
                 <div className="border-b border-border/50 p-5 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 backdrop-blur-sm">
                   <div className="flex items-center gap-4">
                     <button
                       onClick={() => {
                         if (activeConversationData?.other_user?.id) {
                           setSelectedProfileUserId(activeConversationData.other_user.id);
                           setShowProfileCard(true);
                         }
                       }}
                       className="relative hover:scale-110 transition-transform duration-200 cursor-pointer group"
                     >
                       <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-primary/30 group-hover:ring-primary/60 transition-all">
                         <AvatarImage src={
                           (activeConversationData?.other_user?.is_public ?? true)
                             ? (activeConversationData?.other_user?.avatar_url || "")
                             : ""
                         } />
                         <AvatarFallback className="text-lg font-bold">
                           {(activeConversationData?.other_user?.is_public ?? true)
                             ? (activeConversationData?.other_user?.full_name?.[0]?.toUpperCase() ||
                                activeConversationData?.other_user?.email?.[0]?.toUpperCase() ||
                                "U")
                             : "A"}
                         </AvatarFallback>
                       </Avatar>
                       {onlineUserIds.has(activeConversationData?.other_user?.id || "") && (
                         <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500 animate-pulse shadow-lg" />
                       )}
                     </button>
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-lg text-foreground truncate">
                         {(activeConversationData?.other_user?.is_public ?? true)
                           ? (activeConversationData?.other_user?.full_name ||
                              activeConversationData?.other_user?.email ||
                              "Anonymous")
                           : "Anonymous"}
                       </p>
                       <p className="text-sm text-muted-foreground">
                         {onlineUserIds.has(activeConversationData?.other_user?.id || "") ? (
                           <span className="text-green-500 font-medium flex items-center gap-1">
                             <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                             Active now
                           </span>
                         ) : 'Offline'}
                       </p>
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                 <ScrollArea className="flex-1 p-6 relative" ref={scrollRef} onScrollCapture={handleScroll}>
                   <div className="space-y-6">
                     {groupedMessages.map((group) => {
                       const groupDate = new Date(group.date);
                       const dateLabel = isToday(groupDate) 
                         ? "Today" 
                         : isYesterday(groupDate) 
                         ? "Yesterday" 
                         : format(groupDate, 'MMMM d, yyyy');

                       return (
                         <div key={group.date} className="space-y-4">
                           <div className="flex items-center justify-center">
                             <div className="bg-muted/60 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-muted-foreground shadow-sm">
                               {dateLabel}
                             </div>
                           </div>
                           {group.messages.map((message) => {
                             const isOwn = message.sender_id === currentUserId;
                             return (
                               <div
                                 key={message.id}
                                 className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                               >
                               {editingMessageId === message.id && isOwn ? (
                                 <div className="flex items-center gap-2 max-w-[75%] w-full">
                                   <Input
                                     value={editingContent}
                                     onChange={(e) => setEditingContent(e.target.value)}
                                     className="flex-1 bg-background/50 backdrop-blur-sm"
                                     autoFocus
                                     onKeyDown={(e) => {
                                       if (e.key === 'Enter' && !e.shiftKey) {
                                         e.preventDefault();
                                         handleEditMessage(message.id);
                                       } else if (e.key === 'Escape') {
                                         cancelEditing();
                                       }
                                     }}
                                   />
                                   <Button
                                     variant="ghost"
                                     size="icon"
                                     className="h-9 w-9 hover:bg-green-500/20 hover:text-green-500 transition-colors"
                                     onClick={() => handleEditMessage(message.id)}
                                   >
                                     <Check className="h-4 w-4" />
                                   </Button>
                                   <Button
                                     variant="ghost"
                                     size="icon"
                                     className="h-9 w-9 hover:bg-destructive/20 hover:text-destructive transition-colors"
                                     onClick={cancelEditing}
                                   >
                                     <X className="h-4 w-4" />
                                   </Button>
                                 </div>
                               ) : (
                                 <>
                                   <div className="flex items-end gap-2 max-w-[75%] group/message">
                                     {!isOwn && (
                                       <Avatar className="h-8 w-8 mb-1 ring-2 ring-border/20">
                                         <AvatarImage src={
                                           (activeConversationData?.other_user?.is_public ?? true)
                                             ? (activeConversationData?.other_user?.avatar_url || "")
                                             : ""
                                         } />
                                         <AvatarFallback className="text-xs">
                                           {(activeConversationData?.other_user?.is_public ?? true)
                                             ? (activeConversationData?.other_user?.full_name?.[0]?.toUpperCase() || "U")
                                             : "A"}
                                         </AvatarFallback>
                                       </Avatar>
                                     )}
                                     <div className="flex flex-col gap-1 flex-1">
                                       <div
                                         className={`rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl ${
                                           isOwn
                                             ? "bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground ml-auto"
                                             : "bg-gradient-to-br from-card to-card/80 text-foreground border border-border/30"
                                         }`}
                                       >
                                         <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
                                         <div className={`flex items-center gap-2 mt-1.5 text-xs ${isOwn ? 'opacity-80' : 'opacity-60'}`}>
                                           <span>{formatMessageDate(new Date(message.created_at))}</span>
                                           {message.updated_at && message.updated_at !== message.created_at && (
                                             <span className="italic">(edited)</span>
                                           )}
                                           {isOwn && (
                                             <span className="ml-auto">
                                               {message.read ? (
                                                 <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                                               ) : (
                                                 <CheckIcon className="h-3.5 w-3.5" />
                                               )}
                                             </span>
                                           )}
                                         </div>
                                       </div>
                                       <MessageReactions 
                                         messageId={message.id} 
                                         currentUserId={currentUserId} 
                                         type="direct"
                                       />
                                     </div>
                                     {isOwn && (
                                       <Button
                                         variant="ghost"
                                         size="icon"
                                         className="h-8 w-8 opacity-0 group-hover/message:opacity-100 transition-opacity hover:bg-primary/10 mb-1"
                                         onClick={() => startEditing(message.id, message.content)}
                                       >
                                         <Pencil className="h-3.5 w-3.5" />
                                       </Button>
                                     )}
                                   </div>
                                 </>
                               )}
                             </div>
                           );
                         })}
                         </div>
                       );
                     })}
                   </div>

                   {showScrollButton && (
                     <Button
                       variant="secondary"
                       size="icon"
                       className="absolute bottom-4 right-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 h-12 w-12 z-10 animate-in fade-in slide-in-from-bottom-2"
                       onClick={() => scrollToBottom(true)}
                     >
                       <ChevronDown className="h-5 w-5" />
                     </Button>
                   )}
                 </ScrollArea>

                 {typingUsers.length > 0 && (
                   <div className="px-6 py-3 text-sm text-muted-foreground border-t border-border/50 bg-muted/30 backdrop-blur-sm">
                     <div className="flex items-center gap-2">
                       <div className="flex gap-1">
                         <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                         <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                         <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                       </div>
                       <span className="font-medium">
                         {typingUsers.map(u => u.displayName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                       </span>
                     </div>
                   </div>
                 )}

                <form onSubmit={handleSendMessage} className="border-t border-border/50 p-5 bg-gradient-to-r from-background/50 via-muted/10 to-background/50 backdrop-blur-sm">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        placeholder={t("dm.typePlaceholder")}
                        disabled={sending}
                        className="pr-12 h-12 rounded-full border-2 focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm transition-all duration-200"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full hover:bg-muted/80 transition-colors"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={sending || !newMessage.trim()}
                      className="h-12 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:scale-105 disabled:hover:scale-100"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Send</span>
                    </Button>
                  </div>
                  {showEmojiPicker && (
                    <div className="absolute bottom-20 right-4 z-50">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>{t("dm.selectConversation")}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {selectedProfileUserId && (
        <ProfileCard
          userId={selectedProfileUserId}
          open={showProfileCard}
          onOpenChange={setShowProfileCard}
        />
      )}
    </div>
  );
}
