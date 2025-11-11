import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmilePlus } from 'lucide-react';
import { toast } from 'sonner';

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
  count?: number;
  hasReacted?: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  currentUserId: string | null;
  type: 'community' | 'direct';
}

const COMMON_EMOJIS = ['👍', '❤️', '😊', '😂', '🎉', '🔥', '👏', '🙌'];

export const MessageReactions = ({ messageId, currentUserId, type }: MessageReactionsProps) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const tableName = type === 'community' ? 'community_message_reactions' : 'direct_message_reactions';

  useEffect(() => {
    loadReactions();
    setupRealtimeSubscription();
  }, [messageId]);

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('message_id', messageId);

    if (error) {
      console.error('Error loading reactions:', error);
      return;
    }

    // Group reactions by emoji
    const grouped = (data || []).reduce((acc: any, reaction: any) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
          hasReacted: false,
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user_id);
      if (reaction.user_id === currentUserId) {
        acc[reaction.emoji].hasReacted = true;
      }
      return acc;
    }, {});

    setReactions(Object.values(grouped));
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`${tableName}-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `message_id=eq.${messageId}`,
        },
        () => {
          loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addReaction = async (emoji: string) => {
    if (!currentUserId) {
      toast.error('Please login to react');
      return;
    }

    const { error } = await supabase.from(tableName).insert({
      message_id: messageId,
      user_id: currentUserId,
      emoji,
    });

    if (error) {
      if (error.code === '23505') {
        // Already reacted, remove it
        await removeReaction(emoji);
      } else {
        toast.error('Failed to add reaction');
      }
    }
    setShowEmojiPicker(false);
  };

  const removeReaction = async (emoji: string) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', currentUserId)
      .eq('emoji', emoji);

    if (error) {
      toast.error('Failed to remove reaction');
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      {reactions.map((reaction: any) => (
        <Button
          key={reaction.emoji}
          variant="ghost"
          size="sm"
          className={`h-7 px-2 text-xs gap-1 ${
            reaction.hasReacted ? 'bg-primary/20 hover:bg-primary/30' : 'hover:bg-muted'
          }`}
          onClick={() => reaction.hasReacted ? removeReaction(reaction.emoji) : addReaction(reaction.emoji)}
        >
          <span>{reaction.emoji}</span>
          <span className="text-xs">{reaction.count}</span>
        </Button>
      ))}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <SmilePlus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-4 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-10 w-10 text-xl"
                onClick={() => addReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
