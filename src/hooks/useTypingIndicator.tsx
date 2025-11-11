import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TypingUser {
  userId: string;
  displayName: string;
}

export const useTypingIndicator = (channelName: string, currentUserId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing: TypingUser[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key];
          presences.forEach((presence: any) => {
            if (presence.typing && presence.userId !== currentUserId) {
              typing.push({
                userId: presence.userId,
                displayName: presence.displayName || 'Someone',
              });
            }
          });
        });
        
        setTypingUsers(typing);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, currentUserId]);

  const setTyping = useCallback(async (isTyping: boolean, displayName: string) => {
    if (!currentUserId) return;

    const channel = supabase.channel(channelName);
    await channel.subscribe();
    
    await channel.track({
      userId: currentUserId,
      displayName,
      typing: isTyping,
    });
  }, [channelName, currentUserId]);

  return { typingUsers, setTyping };
};
