-- Create bottle_messages table
DROP TABLE IF EXISTS public.bottle_messages CASCADE;
CREATE TABLE public.bottle_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 100),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bottle_messages ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Users can insert their own messages
DROP POLICY IF EXISTS "Users can insert their own bottle messages" ON public.bottle_messages;
CREATE POLICY "Users can insert their own bottle messages"
ON public.bottle_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- 2. Users can view messages they sent or received
DROP POLICY IF EXISTS "Users can view their sent or received bottles" ON public.bottle_messages;
CREATE POLICY "Users can view their sent or received bottles"
ON public.bottle_messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 3. Users can update messages they received (e.g. mark as read)
DROP POLICY IF EXISTS "Users can update received bottles" ON public.bottle_messages;
CREATE POLICY "Users can update received bottles"
ON public.bottle_messages FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id);

-- RPC to get a random message
CREATE OR REPLACE FUNCTION public.get_random_bottle_message()
RETURNS SETOF public.bottle_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    found_message public.bottle_messages%ROWTYPE;
    current_user_id uuid;
BEGIN
    current_user_id := auth.uid();
    
    -- Safety check
    IF current_user_id IS NULL THEN
        RETURN;
    END IF;

    -- CLEANUP: Delete messages older than 24 hours
    DELETE FROM public.bottle_messages
    WHERE created_at < NOW() - INTERVAL '24 hours';

    -- First, try to find a message already assigned to this user (unread)
    SELECT * INTO found_message
    FROM public.bottle_messages
    WHERE receiver_id = current_user_id
    AND is_read = FALSE
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
        RETURN NEXT found_message;
        RETURN;
    END IF;

    -- If no pending message, try to fish one!
    RETURN QUERY
    UPDATE public.bottle_messages
    SET receiver_id = current_user_id
    WHERE id = (
        SELECT id
        FROM public.bottle_messages
        WHERE sender_id != current_user_id
        AND receiver_id IS NULL
        ORDER BY random()
        LIMIT 1
    )
    RETURNING *;

END;
$$;

-- 4. Admins can view ALL bottles for moderation
DROP POLICY IF EXISTS "Admins can view all bottles" ON public.bottle_messages;
CREATE POLICY "Admins can view all bottles"
ON public.bottle_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND app_role IN ('admin', 'master')
  )
);

-- 5. Admins can delete bottles
DROP POLICY IF EXISTS "Admins can delete known bad bottles" ON public.bottle_messages;
CREATE POLICY "Admins can delete known bad bottles"
ON public.bottle_messages FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND app_role IN ('admin', 'master')
  )
);
