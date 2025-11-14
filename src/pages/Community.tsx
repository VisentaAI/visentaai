import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, Users, ArrowLeft, Trash2, PanelRightOpen, Smile, Trash, Search, Pencil, X, Check, Lock } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePresence } from "@/contexts/PresenceContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileCard } from "@/components/ProfileCard";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { MessageReactions } from "@/components/MessageReactions";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserBadge } from "@/components/UserBadge";
import { z } from "zod";

interface CommunityMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    is_public: boolean | null;
    badge_type?: 'default' | 'verified' | 'admin';
  };
}

const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(2000, { message: "Message must be less than 2000 characters" })
});

interface OnlineUser {
  user_id: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    is_public: boolean | null;
    badge_type?: 'default' | 'verified' | 'admin';
  };
}

const Community = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { onlineUserIds, activeUsers } = usePresence();
  const { markCommunityAsRead } = useUnreadCounts();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { typingUsers, setTyping } = useTypingIndicator('community-typing', currentUserId);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
    };
    init();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadMessages();
      setupRealtimeSubscription();
      markCommunityAsRead();
    }
  }, [currentUserId]);

  useEffect(() => {
    loadOnlineUsers();
  }, [onlineUserIds]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUserId(session.user.id);
      
      // Load user profile for display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, community_joined_at')
        .eq('id', session.user.id)
        .single();
      
      setUserDisplayName(profile?.full_name || profile?.email || 'You');
      
      // Set community_joined_at if this is their first time in community chat
      if (!profile?.community_joined_at) {
        await supabase
          .from('profiles')
          .update({ community_joined_at: new Date().toISOString() })
          .eq('id', session.user.id);
      }
    }
  };

  const loadMessages = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    // Get user's community join date
    const { data: profile } = await supabase
      .from('profiles')
      .select('community_joined_at')
      .eq('id', currentUserId)
      .single();

    const joinDate = profile?.community_joined_at;

    // Only load messages from after the user joined
    let query = supabase
      .from("community_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);

    if (joinDate) {
      query = query.gte("created_at", joinDate);
    }

    const { data: messagesData, error: messagesError } = await query;

    if (messagesError) {
      console.error("Error loading messages:", messagesError);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
    
    if (userIds.length === 0) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, email, is_public, badge_type")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error loading profiles:", profilesError);
    }

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
    const messagesWithProfiles = messagesData?.map(msg => ({
      ...msg,
      profiles: profilesMap.get(msg.user_id) || null,
    })) || [];

    // Filter out messages from deleted users (where profile is null)
    const validMessages = messagesWithProfiles.filter(msg => msg.profiles !== null);
    setMessages(validMessages as CommunityMessage[]);
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
            .select("full_name, avatar_url, email, is_public, badge_type")
            .eq("id", payload.new.user_id)
            .maybeSingle();

          // Only add message if the profile exists (user not deleted)
          if (profileData) {
            const newMsg = {
              ...payload.new,
              profiles: profileData,
            } as CommunityMessage;

            setMessages((prev) => [...prev, newMsg]);
          }
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
      .select("id, full_name, avatar_url, email, is_public, badge_type")
      .in("id", Array.from(onlineUserIds));

    // Only show users whose profiles exist (filter out deleted accounts)
    const usersWithProfiles: OnlineUser[] = Array.from(onlineUserIds)
      .map(userId => ({
        user_id: userId,
        profile: profilesData?.find(p => p.id === userId) || undefined,
      }))
      .filter(user => user.profile !== undefined);

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

    // Validate message
    const validation = messageSchema.safeParse({ content: newMessage.trim() });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setSending(true);
    const { error } = await supabase.from("community_messages").insert({
      user_id: currentUserId,
      content: validation.data.content,
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
      setTyping(false, userDisplayName);
    }
    setSending(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this message?");
    if (!confirmed) return;

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
      .from("community_messages")
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen relative overflow-hidden w-full flex">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 -z-10" />
        <div className="absolute inset-0 ai-grid opacity-20 -z-10" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000 -z-10" />
        
        <div className="flex-1 flex flex-col relative z-10">
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
                <Button
                  onClick={() => navigate("/private-communities")}
                  className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-lg transition-all hover:scale-105 shadow-md w-full sm:w-auto"
                >
                  <Lock className="h-4 w-4" />
                  Private Communities
                </Button>
              </div>
              <Card className="h-[calc(100vh-16rem)] border-2 border-primary/20 shadow-lg glass">
                <CardHeader className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl sm:text-2xl gradient-text flex items-center gap-2">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                        {t('community.title')}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground bg-background/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="font-medium hidden sm:inline">{activeUsers} {t('community.activeUsers')}</span>
                          <span className="font-medium sm:hidden">{activeUsers}</span>
                        </div>
                        <SidebarTrigger>
                          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                            <PanelRightOpen className="h-4 w-4" />
                          </Button>
                        </SidebarTrigger>
                      </div>
                    </div>
                    {!isMobile && (
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={handleClearAllMessages}
                          className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive h-9 w-9"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
            <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {filteredMessages.map((message) => {
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
                          <span className="text-xs font-medium mb-1 text-foreground flex items-center gap-1">
                            {displayName}
                            <UserBadge badgeType={message.profiles?.badge_type} className="h-3 w-3" />
                          </span>
                          {editingMessageId === message.id ? (
                            <div className="flex items-center gap-2 w-full">
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
                                <Card
                                  className={`p-3 shadow-md transition-all hover:shadow-lg ${
                                    isOwn
                                      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary/50"
                                      : "bg-gradient-to-br from-muted to-muted/50 text-foreground border-border/50"
                                  }`}
                                >
                                  <p className="text-sm break-words">{message.content}</p>
                                  {message.updated_at && message.updated_at !== message.created_at && (
                                    <p className="text-xs opacity-60 mt-1 italic">edited</p>
                                  )}
                                </Card>
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
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => handleDeleteMessage(message.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <MessageReactions 
                                messageId={message.id} 
                                currentUserId={currentUserId} 
                                type="community"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                 </div>
              </ScrollArea>

              {typingUsers.length > 0 && (
                <div className="px-4 py-2 text-sm text-muted-foreground italic">
                  {typingUsers.map(u => u.displayName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-4 border-t bg-gradient-to-r from-background via-muted/20 to-background">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
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
                            <p className="text-sm font-medium text-foreground flex items-center gap-1">
                              {displayName}
                              {!isOwn && <UserBadge badgeType={user.profile?.badge_type} className="h-3 w-3" />}
                            </p>
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
