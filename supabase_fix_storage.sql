-- Create buckets if they don't exist (this is trickier in SQL alone as insert might fail if exists, but we can try insert on conflict do nothing)
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop', 'shop', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('premium-covers', 'premium-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies for 'shop' bucket
DROP POLICY IF EXISTS "Public Access Shop" ON storage.objects;
CREATE POLICY "Public Access Shop" ON storage.objects
    FOR SELECT USING (bucket_id = 'shop');

DROP POLICY IF EXISTS "Authenticated Upload Shop" ON storage.objects;
CREATE POLICY "Authenticated Upload Shop" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'shop' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Update Shop" ON storage.objects;
CREATE POLICY "Authenticated Update Shop" ON storage.objects
    FOR UPDATE USING (bucket_id = 'shop' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Delete Shop" ON storage.objects;
CREATE POLICY "Authenticated Delete Shop" ON storage.objects
    FOR DELETE USING (bucket_id = 'shop' AND auth.role() = 'authenticated');

-- Policies for 'premium-covers' bucket
DROP POLICY IF EXISTS "Public Access Premium" ON storage.objects;
CREATE POLICY "Public Access Premium" ON storage.objects
    FOR SELECT USING (bucket_id = 'premium-covers');

DROP POLICY IF EXISTS "Authenticated Upload Premium" ON storage.objects;
CREATE POLICY "Authenticated Upload Premium" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'premium-covers' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Update Premium" ON storage.objects;
CREATE POLICY "Authenticated Update Premium" ON storage.objects
    FOR UPDATE USING (bucket_id = 'premium-covers' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Delete Premium" ON storage.objects;
CREATE POLICY "Authenticated Delete Premium" ON storage.objects
    FOR DELETE USING (bucket_id = 'premium-covers' AND auth.role() = 'authenticated');
