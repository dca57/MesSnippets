-- Consolidated Schema Migration
-- Created: 2025-12-15
-- Replaces:
-- 1. 20251128105243_initial_schema.sql
-- 2. 20251205_snippets_schema.sql
-- 3. 20251206_add_compatibility_flag.sql
-- 4. 20251206_add_snippet_order.sql
-- 5. 20251207_add_coloration_flag.sql
-- 6. 20251210_timesheets_schema.sql

-- ==========================================
-- 0. SETUP & EXTENSIONS
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. SHARED UTILITIES & FUNCTIONS
-- ==========================================

-- Generic Updated At Trigger Function (Used by Admin Settings)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- SNI Namespaced Updated At Trigger Function (Used by Snippets & Timesheets)
CREATE OR REPLACE FUNCTION public.sni_handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Profile Creation Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, created_at, last_login_at)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.created_at, new.last_sign_in_at);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. CORE SYSTEM TABLES
-- ==========================================

-- 2.1 PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2.2 ADMIN SETTINGS
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id TEXT PRIMARY KEY, -- e.g., 'global_config'
    data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read admin settings" ON public.admin_settings
    FOR SELECT TO authenticated USING (true);

DROP TRIGGER IF EXISTS on_admin_settings_updated ON public.admin_settings;
CREATE TRIGGER on_admin_settings_updated
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==========================================
-- 3. SNIPPETS MODULE
-- ==========================================

-- Drop existing generic tables to ensure clean slate if running on dirty DB
DROP TABLE IF EXISTS public.sni_snippets CASCADE;
DROP TABLE IF EXISTS public.sni_categories CASCADE;
DROP TABLE IF EXISTS public.sni_collections CASCADE;

-- 3.1 COLLECTIONS
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

CREATE INDEX idx_sni_collections_user_id ON public.sni_collections(user_id);
CREATE INDEX idx_sni_collections_order ON public.sni_collections("order");

ALTER TABLE public.sni_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collections" ON public.sni_collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own collections" ON public.sni_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collections" ON public.sni_collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own collections" ON public.sni_collections FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER on_sni_collections_updated BEFORE UPDATE ON public.sni_collections
  FOR EACH ROW EXECUTE PROCEDURE sni_handle_updated_at();

-- 3.2 CATEGORIES
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

CREATE INDEX idx_sni_categories_user_id ON public.sni_categories(user_id);
CREATE INDEX idx_sni_categories_collection_id ON public.sni_categories(collection_id);
CREATE INDEX idx_sni_categories_order ON public.sni_categories("order");

ALTER TABLE public.sni_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories" ON public.sni_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON public.sni_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.sni_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.sni_categories FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER on_sni_categories_updated BEFORE UPDATE ON public.sni_categories
  FOR EACH ROW EXECUTE PROCEDURE sni_handle_updated_at();

-- 3.3 SNIPPETS
CREATE TABLE public.sni_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.sni_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  "order" INTEGER DEFAULT 0,                 -- From 20251206_add_snippet_order.sql
  is_admin_compatible BOOLEAN DEFAULT TRUE,      -- From 20251206_add_compatibility_flag.sql
  is_coloration_compatible BOOLEAN DEFAULT TRUE, -- From 20251207_add_coloration_flag.sql
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sni_snippets_user_id ON public.sni_snippets(user_id);
CREATE INDEX idx_sni_snippets_category_id ON public.sni_snippets(category_id);
CREATE INDEX idx_sni_snippets_tags ON public.sni_snippets USING gin(tags);
CREATE INDEX idx_sni_snippets_dependencies ON public.sni_snippets USING gin(dependencies);

ALTER TABLE public.sni_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own snippets" ON public.sni_snippets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own snippets" ON public.sni_snippets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own snippets" ON public.sni_snippets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own snippets" ON public.sni_snippets FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER on_sni_snippets_updated BEFORE UPDATE ON public.sni_snippets
  FOR EACH ROW EXECUTE PROCEDURE sni_handle_updated_at();

-- Comments
COMMENT ON TABLE public.sni_collections IS 'User collections/programming languages';
COMMENT ON TABLE public.sni_categories IS 'Categories within collections';
COMMENT ON TABLE public.sni_snippets IS 'Code snippets within categories';
COMMENT ON COLUMN public.sni_snippets.dependencies IS 'Array of snippet IDs that this snippet depends on';

-- ==========================================
-- 4. TIMESHEETS MODULE
-- ==========================================

-- Drop existing tables to ensure clean slate
DROP TABLE IF EXISTS public.sni_timesheets;
DROP TABLE IF EXISTS public.sni_missions;

-- 4.1 MISSIONS
CREATE TABLE public.sni_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  "nomMission" text,
  "codeMission" text,
  "prestataireNomEntreprise" text,
  "prestataireVille" text,
  "prestataireNom" text,
  "prestatairePrenom" text,
  "ssiNomEntreprise" text,
  "ssiVille" text,
  "ssiNomResponsable" text,
  "ssiPrenomResponsable" text, 
  "clientNomEntreprise" text,
  "clientVille" text,
  "clientNomResponsable" text,
  "clientPrenomResponsable" text
);

ALTER TABLE public.sni_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own missions" ON public.sni_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own missions" ON public.sni_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own missions" ON public.sni_missions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own missions" ON public.sni_missions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER on_sni_missions_updated BEFORE UPDATE ON public.sni_missions
  FOR EACH ROW EXECUTE PROCEDURE sni_handle_updated_at();

-- 4.2 TIMESHEETS
CREATE TABLE public.sni_timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
  "missionId" uuid REFERENCES public.sni_missions(id) ON DELETE CASCADE,
  "month" integer NOT NULL,
  "year" integer NOT NULL,  
  "days" jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT timesheet_unique_month UNIQUE("missionId", "month", "year")
);

ALTER TABLE public.sni_timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timesheets" ON public.sni_timesheets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own timesheets" ON public.sni_timesheets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own timesheets" ON public.sni_timesheets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own timesheets" ON public.sni_timesheets FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER on_sni_timesheets_updated BEFORE UPDATE ON public.sni_timesheets
  FOR EACH ROW EXECUTE PROCEDURE sni_handle_updated_at();
