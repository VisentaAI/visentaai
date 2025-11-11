import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: "community" | "direct";
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  conversationId?: string;
  timestamp: string;
}

interface NotificationContextType {
  notifications: Notification[];
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  dismissNotification: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Notification sound
  const playNotificationSound = () => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    // Subscribe to community messages
    const communityChannel = supabase
      .channel("community-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_messages",
        },
        async (payload) => {
          // Don't show notification if user sent the message or is on community page
          if (payload.new.user_id === currentUserId || location.pathname === "/community") {
            return;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, is_public")
            .eq("id", payload.new.user_id)
            .single();

          const isPublic = profile?.is_public ?? true;
          const notification: Notification = {
            id: `community-${payload.new.id}`,
            type: "community",
            content: payload.new.content,
            senderId: payload.new.user_id,
            senderName: isPublic ? (profile?.full_name || "Anonymous") : "Anonymous",
            senderAvatar: isPublic ? profile?.avatar_url : null,
            timestamp: payload.new.created_at,
          };

          setNotifications((prev) => [...prev, notification]);
          playNotificationSound();

          // Auto dismiss after 5 seconds
          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
          }, 5000);
        }
      )
      .subscribe();

    // Subscribe to direct messages
    const directChannel = supabase
      .channel("direct-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        async (payload) => {
          // Don't show notification if user sent the message or is on messages page
          if (payload.new.sender_id === currentUserId || location.pathname === "/messages") {
            return;
          }

          // Check if this message is for current user
          const { data: conversation } = await supabase
            .from("direct_conversations")
            .select("*")
            .eq("id", payload.new.conversation_id)
            .single();

          if (!conversation || 
              (conversation.user1_id !== currentUserId && conversation.user2_id !== currentUserId)) {
            return;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, is_public")
            .eq("id", payload.new.sender_id)
            .single();

          const isPublic = profile?.is_public ?? true;
          const notification: Notification = {
            id: `direct-${payload.new.id}`,
            type: "direct",
            content: payload.new.content,
            senderId: payload.new.sender_id,
            senderName: isPublic ? (profile?.full_name || "Anonymous") : "Anonymous",
            senderAvatar: isPublic ? profile?.avatar_url : null,
            conversationId: payload.new.conversation_id,
            timestamp: payload.new.created_at,
          };

          setNotifications((prev) => [...prev, notification]);
          playNotificationSound();

          // Auto dismiss after 5 seconds
          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(communityChannel);
      supabase.removeChannel(directChannel);
    };
  }, [currentUserId, location.pathname]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === "community") {
      navigate("/community");
    } else {
      navigate(`/messages?conversation=${notification.conversationId}`);
    }
    dismissNotification(notification.id);
  };

  return (
    <NotificationContext.Provider value={{ notifications, dismissNotification }}>
      {children}
      
      {/* Notification Display */}
      <div className="fixed bottom-4 left-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-all bg-background border-primary/20 animate-in slide-in-from-left"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={notification.senderAvatar || ""} />
                <AvatarFallback>
                  {notification.senderName[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-foreground">
                    {notification.type === "community" ? "Community Chat" : "Direct Message"}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notification.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {notification.senderName}
                </p>
                <p className="text-sm text-foreground line-clamp-2">
                  {notification.content}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
