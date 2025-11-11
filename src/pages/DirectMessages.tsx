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
import { Send, ArrowLeft, Plus, Search as SearchIcon, Smile, Trash2, Pencil, X, Check } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { formatDistanceToNow } from "date-fns";
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
            .single();

          const { data: lastMsg } = await supabase
            .from("direct_messages")
            .select("content")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

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

      setConversations(enrichedConversations);
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
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto h-screen flex flex-col p-4">
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
                             {isPublic && user.full_name && <p className="text-sm text-muted-foreground">{user.email}</p>}
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
          <Card className="md:col-span-1 flex flex-col border-2 border-primary/20 shadow-lg bg-gradient-to-b from-background to-muted/20">
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
                      <div className="relative group">
                        <button
                          key={conv.id}
                          onClick={() => setActiveConversation(conv.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            activeConversation === conv.id
                              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md"
                              : "hover:bg-muted hover:shadow-sm"
                          }`}
                        >
                       <div className="relative">
                         <Avatar className="h-12 w-12 flex-shrink-0">
                           <AvatarImage src={displayAvatar} />
                           <AvatarFallback>{avatarFallback}</AvatarFallback>
                         </Avatar>
                         <span 
                           className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                             isOnline ? 'bg-green-500' : 'bg-muted'
                           }`}
                         />
                       </div>
                       <div className="flex-1 text-left min-w-0">
                         <div className="flex items-center justify-between mb-1">
                           <p className="font-medium truncate">{displayName}</p>
                           {conv.unread_count! > 0 && (
                             <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                               {conv.unread_count}
                             </span>
                           )}
                         </div>
                         <p className="text-sm text-muted-foreground truncate">{conv.last_message || "No messages yet"}</p>
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

          <Card className="md:col-span-2 flex flex-col border-2 border-primary/20 shadow-lg">
            {activeConversation ? (
              <>
                 <div className="border-b border-border p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                   <div className="flex items-center gap-3">
                     <button
                       onClick={() => {
                         if (activeConversationData?.other_user?.id) {
                           setSelectedProfileUserId(activeConversationData.other_user.id);
                           setShowProfileCard(true);
                         }
                       }}
                       className="relative hover:opacity-80 transition-opacity cursor-pointer"
                     >
                       <Avatar className="h-10 w-10">
                         <AvatarImage src={
                           (activeConversationData?.other_user?.is_public ?? true)
                             ? (activeConversationData?.other_user?.avatar_url || "")
                             : ""
                         } />
                         <AvatarFallback>
                           {(activeConversationData?.other_user?.is_public ?? true)
                             ? (activeConversationData?.other_user?.full_name?.[0]?.toUpperCase() ||
                                activeConversationData?.other_user?.email?.[0]?.toUpperCase() ||
                                "U")
                             : "A"}
                         </AvatarFallback>
                       </Avatar>
                       <span 
                         className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                           onlineUserIds.has(activeConversationData?.other_user?.id || "") ? 'bg-green-500' : 'bg-muted'
                         }`}
                       />
                     </button>
                     <div>
                       <p className="font-medium text-foreground">
                         {(activeConversationData?.other_user?.is_public ?? true)
                           ? (activeConversationData?.other_user?.full_name ||
                              activeConversationData?.other_user?.email ||
                              "Anonymous")
                           : "Anonymous"}
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

                 <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                   <div className="space-y-4">
                     {filteredMessages.map((message) => {
                       const isOwn = message.sender_id === currentUserId;
                       return (
                         <div
                           key={message.id}
                           className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                         >
                           {editingMessageId === message.id && isOwn ? (
                             <div className="flex items-center gap-2 max-w-[70%] w-full">
                               <Input
                                 value={editingContent}
                                 onChange={(e) => setEditingContent(e.target.value)}
                                 className="flex-1"
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
                                 className="h-8 w-8 hover:bg-green-500/10 hover:text-green-500"
                                 onClick={() => handleEditMessage(message.id)}
                               >
                                 <Check className="h-4 w-4" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-8 w-8"
                                 onClick={cancelEditing}
                               >
                                 <X className="h-4 w-4" />
                               </Button>
                             </div>
                           ) : (
                             <>
                               <div className="flex items-start gap-2">
                                 <div
                                   className={`max-w-[70%] rounded-lg px-4 py-2 shadow-md transition-all hover:shadow-lg ${
                                     isOwn
                                       ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border border-primary/50"
                                       : "bg-gradient-to-br from-muted to-muted/50 text-foreground border border-border/50"
                                   }`}
                                 >
                                   <p className="text-sm break-words">{message.content}</p>
                                   <p className="text-xs opacity-70 mt-1">
                                     {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                     {message.updated_at && message.updated_at !== message.created_at && (
                                       <span className="italic ml-1">(edited)</span>
                                     )}
                                   </p>
                                 </div>
                                 {isOwn && (
                                   <div className="flex flex-col gap-1">
                                     <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-8 w-8 hover:bg-primary/10"
                                       onClick={() => startEditing(message.id, message.content)}
                                     >
                                       <Pencil className="h-4 w-4" />
                                     </Button>
                                   </div>
                                 )}
                               </div>
                               <MessageReactions 
                                 messageId={message.id} 
                                 currentUserId={currentUserId} 
                                 type="direct"
                               />
                             </>
                           )}
                         </div>
                       );
                     })}
                   </div>
                 </ScrollArea>

                 {typingUsers.length > 0 && (
                   <div className="px-4 py-2 text-sm text-muted-foreground italic border-t">
                     {typingUsers.map(u => u.displayName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                   </div>
                 )}

                <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-gradient-to-r from-background via-muted/20 to-background">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        placeholder={t("dm.typePlaceholder")}
                        disabled={sending}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={sending || !newMessage.trim()}
                      className="h-10 px-6"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
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
