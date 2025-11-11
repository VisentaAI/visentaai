import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PresenceContextType {
  onlineUserIds: Set<string>;
  activeUsers: number;
}

const PresenceContext = createContext<PresenceContextType>({
  onlineUserIds: new Set(),
  activeUsers: 0,
});

export const usePresence = () => useContext(PresenceContext);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [activeUsers, setActiveUsers] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

    const channel = supabase.channel("global-presence");

    const updatePresenceState = () => {
      const state = channel.presenceState();
      const userIds = new Set<string>();
      Object.values(state).forEach((presences: any) => {
        presences.forEach((presence: any) => {
          if (presence.user_id) {
            userIds.add(presence.user_id);
          }
        });
      });
      setActiveUsers(userIds.size);
      setOnlineUserIds(userIds);
    };

    channel
      .on("presence", { event: "sync" }, updatePresenceState)
      .on("presence", { event: "join" }, updatePresenceState)
      .on("presence", { event: "leave" }, updatePresenceState)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return (
    <PresenceContext.Provider value={{ onlineUserIds, activeUsers }}>
      {children}
    </PresenceContext.Provider>
  );
};
