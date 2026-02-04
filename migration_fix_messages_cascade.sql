-- Migration to fix constraint violations on 'messages' table
-- Issue: Deleting a user fails because of foreign keys in the 'messages' table.
-- Fix: Re-create foreign keys with ON DELETE CASCADE.

BEGIN;

-- Ensure 'messages' table exists/foreign key exists before dropping.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        
        -- 1. Receiver (The one causing the current error)
        ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
        
        ALTER TABLE public.messages 
        ADD CONSTRAINT messages_receiver_id_fkey 
        FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) 
        ON DELETE CASCADE;

        -- 2. Sender (Likely also needs fix)
        -- Check if column exists first or just try to drop constraint if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id') THEN
             ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
             
             ALTER TABLE public.messages 
             ADD CONSTRAINT messages_sender_id_fkey 
             FOREIGN KEY (sender_id) REFERENCES public.profiles(id) 
             ON DELETE CASCADE;
        END IF;

    END IF;
END $$;

COMMIT;
