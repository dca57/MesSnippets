
-- 1. Create table sni_fichiers
CREATE TABLE IF NOT EXISTS public.sni_fichiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    categorie TEXT NOT NULL,
    titre TEXT NOT NULL,
    nom_fichier TEXT NOT NULL,
    extension TEXT,
    taille NUMERIC, -- Size in Mo or Bytes, handled by frontend but stored here
    file_path TEXT NOT NULL -- Path in storage bucket
);

-- 2. Enable RLS
ALTER TABLE public.sni_fichiers ENABLE ROW LEVEL SECURITY;

-- 3. Policies for sni_fichiers
CREATE POLICY "Users can view own files" 
ON public.sni_fichiers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files" 
ON public.sni_fichiers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" 
ON public.sni_fichiers FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" 
ON public.sni_fichiers FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Storage Bucket Setup
-- NOTE: Creating buckets via SQL is possible but sometimes restricted. 
-- Ideally this is done via dashboard, but we try here.
INSERT INTO storage.buckets (id, name, public)
VALUES ('sni_fichiers', 'sni_fichiers', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies
-- Policy to allow users to upload files to their own folder (or just generally authenticated)
-- We'll assume a structure like: user_id/filename or just flat if we rely on table for ownership.
-- Let's use user_id prefix for cleaner structure: {user_id}/{filename}

CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'sni_fichiers' AND auth.uid() = owner );

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'sni_fichiers' AND auth.uid() = owner );

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'sni_fichiers' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'sni_fichiers' AND auth.uid() = owner );
