-- Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Receiver
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Sender (who performed the action)
    action TEXT NOT NULL, -- 'curtiu seu post', 'comentou', 'começou a seguir'
    target TEXT, -- Short snippet of content (e.g. post caption start)
    target_id TEXT, -- ID of the related object (post_id, comment_id, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies (Drop first to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_notification()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
    sender_id UUID;
    action_text TEXT;
    target_text TEXT;
    target_ref_id TEXT;
    post_content TEXT;
BEGIN
    sender_id := auth.uid();
    
    -- 1. LIKE on Post
    IF (TG_TABLE_NAME = 'likes') THEN
        -- Get post owner
        SELECT user_id, content INTO recipient_id, post_content FROM public.posts WHERE id = NEW.post_id;
        
        -- Don't notify self-likes
        IF recipient_id = sender_id THEN
            RETURN NEW;
        END IF;

        action_text := 'curtiu sua publicação';
        target_text := COALESCE(substring(post_content from 1 for 20) || '...', 'uma imagem');
        target_ref_id := NEW.post_id::TEXT;
        
        -- Insert
        INSERT INTO public.notifications (user_id, actor_id, action, target, target_id)
        VALUES (recipient_id, sender_id, action_text, target_text, target_ref_id);
    
    -- 2. COMMENT on Post
    ELSIF (TG_TABLE_NAME = 'comments') THEN
        -- Get post owner
        SELECT user_id, content INTO recipient_id, post_content FROM public.posts WHERE id = NEW.post_id;
        
        -- Don't notify self-comments
        IF recipient_id = sender_id THEN
            RETURN NEW;
        END IF;

        action_text := 'comentou na sua publicação';
        target_text := COALESCE(substring(NEW.text from 1 for 20) || '...', '...');
        target_ref_id := NEW.post_id::TEXT;

        INSERT INTO public.notifications (user_id, actor_id, action, target, target_id)
        VALUES (recipient_id, sender_id, action_text, target_text, target_ref_id);

    -- 3. CONNECTION (Follow)
    ELSIF (TG_TABLE_NAME = 'connections') THEN
        -- Only notify on INSERT (Follow), mainly if status is 'active'
        -- 'user_id' in connections table is the ONE FOLLOWING (Me). 'friend_id' is the TARGET (Them).
        -- So recipient is NEW.friend_id
        
        recipient_id := NEW.friend_id;
        sender_id := NEW.user_id; -- The one who connected associated with the insert

        -- Avoid self-notification (unlikely but safe)
        IF recipient_id = sender_id THEN
             RETURN NEW;
        END IF;

        -- Check if it is a 'follow' action (status active)
        IF NEW.status = 'active' THEN
            action_text := 'começou a seguir você';
            target_text := NULL;
            target_ref_id := sender_id::TEXT;

            -- Avoid duplicate notifications if they reconnect rapidly? 
            -- For simplicity, we just insert.
            INSERT INTO public.notifications (user_id, actor_id, action, target, target_id)
            VALUES (recipient_id, sender_id, action_text, target_text, target_ref_id);
        END IF;

    -- 4. TESTIMONIAL
    ELSIF (TG_TABLE_NAME = 'testimonials') THEN
        recipient_id := NEW.receiver_id;
        sender_id := NEW.sender_id;

        IF recipient_id = sender_id THEN
            RETURN NEW;
        END IF;

        action_text := 'escreveu um depoimento para você';
        target_text := substring(NEW.message from 1 for 20) || '...';
        target_ref_id := NEW.id::TEXT;

        INSERT INTO public.notifications (user_id, actor_id, action, target, target_id)
        VALUES (recipient_id, sender_id, action_text, target_text, target_ref_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Triggers (Drop if exists to ensure clean state)

-- Likes
DROP TRIGGER IF EXISTS on_like_created ON public.likes;
CREATE TRIGGER on_like_created
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.handle_new_notification();

-- Comments
DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.handle_new_notification();

-- Connections
DROP TRIGGER IF EXISTS on_connection_created ON public.connections;
CREATE TRIGGER on_connection_created
AFTER INSERT ON public.connections
FOR EACH ROW EXECUTE FUNCTION public.handle_new_notification();

-- Testimonials
DROP TRIGGER IF EXISTS on_testimonial_created ON public.testimonials;
CREATE TRIGGER on_testimonial_created
AFTER INSERT ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.handle_new_notification();
