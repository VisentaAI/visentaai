import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Send, ArrowLeft, Plus, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
}

interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

export default function DirectMessages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesChannelRef = useRef<any>(null);

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
            .select("id, full_name, avatar_url, email")
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

    setSending(true);
    try {
      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: activeConversation,
        sender_id: currentUserId,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
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
        .select("id, full_name, avatar_url, email")
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
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => startConversation(user.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback>
                            {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">
                            {user.full_name || user.email || "Anonymous"}
                          </p>
                          {user.full_name && <p className="text-sm text-muted-foreground">{user.email}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
          <Card className="md:col-span-1 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      activeConversation === conv.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={conv.other_user?.avatar_url || ""} />
                      <AvatarFallback>
                        {conv.other_user?.full_name?.[0]?.toUpperCase() ||
                          conv.other_user?.email?.[0]?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">
                          {conv.other_user?.full_name || conv.other_user?.email || "Anonymous"}
                        </p>
                        {conv.unread_count! > 0 && (
                          <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.last_message || "No messages yet"}</p>
                    </div>
                  </button>
                ))}
                {conversations.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>{t("dm.noConversations")}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          <Card className="md:col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                <div className="border-b border-border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activeConversationData?.other_user?.avatar_url || ""} />
                      <AvatarFallback>
                        {activeConversationData?.other_user?.full_name?.[0]?.toUpperCase() ||
                          activeConversationData?.other_user?.email?.[0]?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {activeConversationData?.other_user?.full_name ||
                          activeConversationData?.other_user?.email ||
                          "Anonymous"}
                      </p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="border-t border-border p-4 flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t("dm.typePlaceholder")}
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
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
    </div>
  );
}
