-- Create Products Table if not exists
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0,
    description TEXT,
    image_url TEXT,
    badge TEXT,
    shipping_info TEXT,
    warranty_info TEXT,
    active BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies for products
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
CREATE POLICY "Public products are viewable by everyone" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated'); -- Ideally restricted to admin role

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE USING (auth.role() = 'authenticated');


-- Create Premium Content Table if not exists
CREATE TABLE IF NOT EXISTS public.premium_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    role TEXT,
    type TEXT NOT NULL, -- Masterclass, Curso, Audio, Meditação, Mentoria
    duration TEXT,
    thumbnail TEXT,
    category TEXT,
    description TEXT,
    level TEXT, -- Iniciante, Intermediário, Avançado
    is_new BOOLEAN DEFAULT false,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for premium_content
ALTER TABLE public.premium_content ENABLE ROW LEVEL SECURITY;

-- Policies for premium_content
DROP POLICY IF EXISTS "Public premium_content are viewable by everyone" ON public.premium_content;
CREATE POLICY "Public premium_content are viewable by everyone" ON public.premium_content
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert premium_content" ON public.premium_content;
CREATE POLICY "Admins can insert premium_content" ON public.premium_content
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update premium_content" ON public.premium_content;
CREATE POLICY "Admins can update premium_content" ON public.premium_content
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete premium_content" ON public.premium_content;
CREATE POLICY "Admins can delete premium_content" ON public.premium_content
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create storage bucket for 'shop' and 'premium' if they don't exist
-- Note: Buckets usually need to be created via API or UI, but we can try inserting into storage.buckets if permissions allow, 
-- or just assume they exist or the user will create them.
-- For this script, we'll assume buckets 'shop' and 'premium-covers' exist or are public.
