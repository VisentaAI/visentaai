import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, ArrowLeft, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommunityMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

interface ActiveUser {
  user_id: string;
  online_at: string;
}

export default function Community() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadMessages();
      setupRealtimeSubscription();
      setupPresence();
    }
  }, [currentUserId]);

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

  const loadMessages = async () => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from("community_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      // Fetch profiles separately
      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Map profiles to messages
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const messagesWithProfiles = messagesData?.map(msg => ({
        ...msg,
        profiles: profilesMap.get(msg.user_id) || null,
      })) || [];

      setMessages(messagesWithProfiles as CommunityMessage[]);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("community-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_messages",
        },
        async (payload) => {
          // Fetch the profile data for the new message
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, email")
            .eq("id", payload.new.user_id)
            .single();

          const newMsg = {
            ...payload.new,
            profiles: profileData,
          } as CommunityMessage;

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const setupPresence = () => {
    const channel = supabase.channel("online-users");

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setActiveUsers(count);
      })
      .on("presence", { event: "join" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setActiveUsers(count);
      })
      .on("presence", { event: "leave" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setActiveUsers(count);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
      }
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    setSending(true);
    try {
      const { error } = await supabase.from("community_messages").insert({
        user_id: currentUserId,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("community.title")}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {activeUsers} {t("community.activeUsers")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Card className="h-[calc(100vh-12rem)]">
          <CardHeader>
            <CardTitle>{t("community.chat")}</CardTitle>
            <CardDescription>{t("community.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[calc(100%-5rem)]">
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.user_id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <button
                        onClick={() => {
                          if (!isOwn) {
                            navigate(`/messages?user=${message.user_id}`);
                          }
                        }}
                        className={`flex-shrink-0 ${!isOwn ? 'hover:opacity-80 transition-opacity' : ''}`}
                        disabled={isOwn}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.profiles?.avatar_url || ""} />
                          <AvatarFallback>
                            {message.profiles?.full_name?.[0]?.toUpperCase() ||
                              message.profiles?.email?.[0]?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground">
                            {isOwn
                              ? t("community.you")
                              : message.profiles?.full_name || message.profiles?.email || "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t("community.typePlaceholder")}
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
