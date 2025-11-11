import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadCounts = () => {
  const [communityUnread, setCommunityUnread] = useState(0);
  const [directUnread, setDirectUnread] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [lastCommunityCheck, setLastCommunityCheck] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
        loadUnreadCounts(session.user.id);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setCurrentUserId(session.user.id);
      } else {
        setCurrentUserId(null);
        setCommunityUnread(0);
        setDirectUnread(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    // Load initial counts
    loadUnreadCounts(currentUserId);

    // Set up realtime subscriptions
    const communityChannel = supabase
      .channel("community-unread")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_messages",
        },
        (payload) => {
          // Don't count user's own messages
          if (payload.new.user_id !== currentUserId) {
            setCommunityUnread((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    const directChannel = supabase
      .channel("direct-unread")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        async (payload) => {
          // Check if this message is for current user
          const { data: conversation } = await supabase
            .from("direct_conversations")
            .select("*")
            .eq("id", payload.new.conversation_id)
            .single();

          if (
            conversation &&
            (conversation.user1_id === currentUserId || conversation.user2_id === currentUserId) &&
            payload.new.sender_id !== currentUserId
          ) {
            setDirectUnread((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(communityChannel);
      supabase.removeChannel(directChannel);
    };
  }, [currentUserId]);

  const loadUnreadCounts = async (userId: string) => {
    // Get last community visit time from localStorage
    const lastVisit = localStorage.getItem(`community_last_visit_${userId}`);
    
    if (lastVisit) {
      const { count } = await supabase
        .from("community_messages")
        .select("*", { count: "exact", head: true })
        .neq("user_id", userId)
        .gt("created_at", lastVisit);

      setCommunityUnread(count || 0);
    } else {
      // If no last visit, count all messages from others
      const { count } = await supabase
        .from("community_messages")
        .select("*", { count: "exact", head: true })
        .neq("user_id", userId);

      setCommunityUnread(count || 0);
    }

    // Count unread direct messages
    const { data: conversations } = await supabase
      .from("direct_conversations")
      .select("id")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (conversations) {
      const conversationIds = conversations.map((c) => c.id);
      
      if (conversationIds.length > 0) {
        const { count } = await supabase
          .from("direct_messages")
          .select("*", { count: "exact", head: true })
          .in("conversation_id", conversationIds)
          .eq("read", false)
          .neq("sender_id", userId);

        setDirectUnread(count || 0);
      }
    }
  };

  const markCommunityAsRead = () => {
    if (currentUserId) {
      localStorage.setItem(`community_last_visit_${currentUserId}`, new Date().toISOString());
      setCommunityUnread(0);
    }
  };

  const markDirectAsRead = async (conversationId: string) => {
    if (!currentUserId) return;

    await supabase
      .from("direct_messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .eq("read", false)
      .neq("sender_id", currentUserId);

    // Reload count
    loadUnreadCounts(currentUserId);
  };

  return {
    communityUnread,
    directUnread,
    markCommunityAsRead,
    markDirectAsRead,
  };
};
