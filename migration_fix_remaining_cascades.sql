-- Migration to fix remaining constraint violations on user deletion
-- Issue: Deleting a user might still fail if they have reports or testimonials.
-- Fix: Re-create foreign keys with ON DELETE CASCADE for these tables.

BEGIN;

-- 1. Reports (reporter_id)
-- Ensure 'reports' table exists/foreign key exists before dropping.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;
        
        ALTER TABLE public.reports 
        ADD CONSTRAINT reports_reporter_id_fkey 
        FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Testimonials (sender_id, receiver_id)
-- Ensure 'testimonials' table exists/foreign key exists before dropping.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        -- Sender
        ALTER TABLE public.testimonials DROP CONSTRAINT IF EXISTS testimonials_sender_id_fkey;
        
        ALTER TABLE public.testimonials 
        ADD CONSTRAINT testimonials_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES public.profiles(id) 
        ON DELETE CASCADE;

        -- Receiver
        ALTER TABLE public.testimonials DROP CONSTRAINT IF EXISTS testimonials_receiver_id_fkey;
        
        ALTER TABLE public.testimonials 
        ADD CONSTRAINT testimonials_receiver_id_fkey 
        FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

COMMIT;
