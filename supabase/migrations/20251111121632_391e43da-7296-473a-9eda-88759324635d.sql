-- Fix search_path for update_conversation_timestamp function
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Fix search_path for get_admin_stats function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_conversations', (SELECT COUNT(*) FROM chat_conversations),
    'total_messages', (SELECT COUNT(*) FROM chat_messages),
    'conversations_today', (
      SELECT COUNT(*) 
      FROM chat_conversations 
      WHERE created_at >= CURRENT_DATE
    ),
    'messages_today', (
      SELECT COUNT(*) 
      FROM chat_messages 
      WHERE created_at >= CURRENT_DATE
    ),
    'active_users_today', (
      SELECT COUNT(DISTINCT user_id) 
      FROM chat_conversations 
      WHERE updated_at >= CURRENT_DATE
    )
  )
$$;