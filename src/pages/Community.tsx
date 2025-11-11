import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, Users, ArrowLeft, Trash2, PanelRightOpen, Smile, Trash } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePresence } from "@/contexts/PresenceContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileCard } from "@/components/ProfileCard";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";

interface CommunityMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    is_public: boolean | null;
  };
}

interface OnlineUser {
  user_id: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    is_public: boolean | null;
  };
}

const Community = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { onlineUserIds, activeUsers } = usePresence();
  const { markCommunityAsRead } = useUnreadCounts();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      loadMessages();
      setupRealtimeSubscription();
      markCommunityAsRead();
    };
    init();
  }, []);

  useEffect(() => {
    loadOnlineUsers();
  }, [onlineUserIds]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUserId(session.user.id);
    }
  };

  const loadMessages = async () => {
    const { data: messagesData, error: messagesError } = await supabase
      .from("community_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);

    if (messagesError) {
      console.error("Error loading messages:", messagesError);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, email, is_public")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error loading profiles:", profilesError);
    }

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
    const messagesWithProfiles = messagesData?.map(msg => ({
      ...msg,
      profiles: profilesMap.get(msg.user_id) || null,
    })) || [];

    setMessages(messagesWithProfiles as CommunityMessage[]);
    setLoading(false);
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
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, email, is_public")
            .eq("id", payload.new.user_id)
            .single();

          const newMsg = {
            ...payload.new,
            profiles: profileData,
          } as CommunityMessage;

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "community_messages",
        },
        (payload) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadOnlineUsers = async () => {
    if (onlineUserIds.size === 0) {
      setOnlineUsers([]);
      return;
    }

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, email, is_public")
      .in("id", Array.from(onlineUserIds));

    const usersWithProfiles: OnlineUser[] = Array.from(onlineUserIds).map(userId => ({
      user_id: userId,
      profile: profilesData?.find(p => p.id === userId) || undefined,
    }));

    setOnlineUsers(usersWithProfiles);
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    setSending(true);
    const { error } = await supabase.from("community_messages").insert({
      user_id: currentUserId,
      content: newMessage.trim(),
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
    setSending(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from("community_messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleClearAllMessages = async () => {
    if (!currentUserId) return;
    
    const confirmed = window.confirm(t('community.clearAllConfirm') || "Are you sure you want to clear all messages? This action cannot be undone.");
    if (!confirmed) return;

    const { error } = await supabase
      .from("community_messages")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (error) {
      toast.error("Failed to clear messages");
    } else {
      toast.success("All messages cleared");
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full flex">
        <div className="flex-1 flex flex-col">
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-4xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <Card className="h-[calc(100vh-16rem)] border-2 border-primary/20 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl gradient-text flex items-center gap-2">
                      <Users className="h-6 w-6" />
                      {t('community.title')}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-medium">{activeUsers} {t('community.activeUsers')}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleClearAllMessages}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <SidebarTrigger>
                        <Button variant="outline" size="icon">
                          <PanelRightOpen className="h-4 w-4" />
                        </Button>
                      </SidebarTrigger>
                    </div>
                  </div>
                </CardHeader>
            <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.user_id === currentUserId;
                    const isPublic = message.profiles?.is_public ?? true;
                    const displayName = isOwn 
                      ? t('community.you')
                      : (isPublic ? (message.profiles?.full_name || "Anonymous") : "Anonymous");
                    const displayAvatar = isOwn || isPublic ? message.profiles?.avatar_url || "" : "";
                    const avatarFallback = isOwn 
                      ? (message.profiles?.full_name?.[0]?.toUpperCase() ||
                         message.profiles?.email?.[0]?.toUpperCase() ||
                         "U")
                      : (isPublic ? (message.profiles?.full_name?.[0]?.toUpperCase() || "A") : "A");
                    const isOnline = onlineUserIds.has(message.user_id);
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  if (!isOwn) {
                                    setSelectedProfileUserId(message.user_id);
                                    setShowProfileCard(true);
                                  }
                                }}
                                className={`flex-shrink-0 relative ${!isOwn ? 'hover:opacity-80 transition-opacity cursor-pointer' : ''}`}
                                disabled={isOwn}
                              >
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={displayAvatar} />
                                  <AvatarFallback>
                                    {avatarFallback}
                                  </AvatarFallback>
                                </Avatar>
                                <span 
                                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                                    isOnline ? 'bg-green-500' : 'bg-muted'
                                  }`}
                                  aria-label={isOnline ? 'Online' : 'Offline'}
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{displayName}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                          <span className="text-xs font-medium mb-1 text-foreground">
                            {displayName}
                          </span>
                          <div className="flex items-start gap-2">
                            <Card
                              className={`p-3 shadow-md transition-all hover:shadow-lg ${
                                isOwn
                                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary/50"
                                  : "bg-gradient-to-br from-muted to-muted/50 text-foreground border-border/50"
                              }`}
                            >
                              <p className="text-sm break-words">{message.content}</p>
                            </Card>
                            {isOwn && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="p-4 border-t bg-gradient-to-r from-background via-muted/20 to-background">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('community.typePlaceholder')}
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
            </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Sidebar side="right" className="border-l">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-lg font-semibold px-4 py-3">
                {t('community.activeUsers')} ({activeUsers})
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <div className="space-y-2 px-4 py-2">
                    {onlineUsers.map((user) => {
                      const isOwn = user.user_id === currentUserId;
                      const isPublic = user.profile?.is_public ?? true;
                      const displayName = isOwn 
                        ? t('community.you')
                        : (isPublic ? (user.profile?.full_name || "Anonymous") : "Anonymous");
                      const displayAvatar = isOwn || isPublic ? user.profile?.avatar_url || "" : "";
                      const avatarFallback = isOwn 
                        ? (user.profile?.full_name?.[0]?.toUpperCase() ||
                           user.profile?.email?.[0]?.toUpperCase() ||
                           "U")
                        : (isPublic ? (user.profile?.full_name?.[0]?.toUpperCase() || "A") : "A");

                      return (
                        <button
                          key={user.user_id}
                          onClick={() => {
                            if (!isOwn) {
                              setSelectedProfileUserId(user.user_id);
                              setShowProfileCard(true);
                            }
                          }}
                          disabled={isOwn}
                          className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${
                            !isOwn ? 'hover:bg-muted cursor-pointer' : ''
                          }`}
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={displayAvatar} />
                              <AvatarFallback>{avatarFallback}</AvatarFallback>
                            </Avatar>
                            <span 
                              className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500"
                              aria-label="Online"
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-foreground">{displayName}</p>
                            <p className="text-xs text-muted-foreground">Online</p>
                          </div>
                        </button>
                      );
                    })}
                    {onlineUsers.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No users online
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>
      
      {selectedProfileUserId && (
        <ProfileCard
          userId={selectedProfileUserId}
          open={showProfileCard}
          onOpenChange={setShowProfileCard}
        />
      )}
    </SidebarProvider>
  );
};

export default Community;
