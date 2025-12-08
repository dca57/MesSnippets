-- Add dependencies column and update table names with sni_ prefix
-- Note: This migration assumes tables don't exist yet. Adjust if needed.

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.sni_snippets CASCADE;
DROP TABLE IF EXISTS public.sni_categories CASCADE;
DROP TABLE IF EXISTS public.sni_collections CASCADE;

-- Collections table (with sni_ prefix)
CREATE TABLE public.sni_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'javascript',
  icon TEXT DEFAULT 'FileCode',
  color TEXT DEFAULT 'blue',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories table (with sni_ prefix)
CREATE TABLE public.sni_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.sni_collections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Folder',
  color TEXT DEFAULT 'blue',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Snippets table (with sni_ prefix and dependencies)
CREATE TABLE public.sni_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.sni_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sni_collections_user_id ON public.sni_collections(user_id);
CREATE INDEX idx_sni_collections_order ON public.sni_collections("order");

CREATE INDEX idx_sni_categories_user_id ON public.sni_categories(user_id);
CREATE INDEX idx_sni_categories_collection_id ON public.sni_categories(collection_id);
CREATE INDEX idx_sni_categories_order ON public.sni_categories("order");

CREATE INDEX idx_sni_snippets_user_id ON public.sni_snippets(user_id);
CREATE INDEX idx_sni_snippets_category_id ON public.sni_snippets(category_id);
CREATE INDEX idx_sni_snippets_tags ON public.sni_snippets USING gin(tags);
CREATE INDEX idx_sni_snippets_dependencies ON public.sni_snippets USING gin(dependencies);

-- RLS Policies
ALTER TABLE public.sni_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sni_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sni_snippets ENABLE ROW LEVEL SECURITY;

-- Collections policies
CREATE POLICY "Users can view their own collections"
  ON public.sni_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
  ON public.sni_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.sni_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON public.sni_collections FOR DELETE
  USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can view their own categories"
  ON public.sni_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON public.sni_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.sni_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.sni_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Snippets policies
CREATE POLICY "Users can view their own snippets"
  ON public.sni_snippets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snippets"
  ON public.sni_snippets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snippets"
  ON public.sni_snippets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snippets"
  ON public.sni_snippets FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION sni_handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_sni_collections_updated BEFORE UPDATE
  ON public.sni_collections FOR EACH ROW
  EXECUTE PROCEDURE sni_handle_updated_at();

CREATE TRIGGER on_sni_categories_updated BEFORE UPDATE
  ON public.sni_categories FOR EACH ROW
  EXECUTE PROCEDURE sni_handle_updated_at();

CREATE TRIGGER on_sni_snippets_updated BEFORE UPDATE
  ON public.sni_snippets FOR EACH ROW
  EXECUTE PROCEDURE sni_handle_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.sni_collections IS 'User collections/programming languages';
COMMENT ON TABLE public.sni_categories IS 'Categories within collections';
COMMENT ON TABLE public.sni_snippets IS 'Code snippets within categories';
COMMENT ON COLUMN public.sni_snippets.dependencies IS 'Array of snippet IDs that this snippet depends on';
