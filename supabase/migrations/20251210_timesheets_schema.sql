
-- 1. Nettoyage (si besoin de repartir à zéro, décommentez les lignes suivantes)
DROP TABLE IF EXISTS public.sni_timesheets;
DROP TABLE IF EXISTS public.sni_missions;

-- 2. Création de la table des missions
CREATE TABLE public.sni_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  "nomMission" text,
  "codeMission" text,
  "prestataireNomEntreprise" text,   -- Prestataire
  "prestataireVille" text,
  "prestataireNom" text,
  "prestatairePrenom" text,
  "ssiNomEntreprise" text,   -- SSII / Portage
  "ssiVille" text,
  "ssiNomResponsable" text,
  "ssiPrenomResponsable" text, 
  "clientNomEntreprise" text,   -- Client Final
  "clientVille" text,
  "clientNomResponsable" text,
  "clientPrenomResponsable" text
);

-- 3. Création de la table des feuilles de temps (CRA)
CREATE TABLE public.sni_timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
  "missionId" uuid REFERENCES public.sni_missions(id) ON DELETE CASCADE,     -- Foreign Key vers la mission
  "month" integer NOT NULL,
  "year" integer NOT NULL,  
  "days" jsonb DEFAULT '{}'::jsonb,   -- Stockage des données journalières au format JSON (ActivityType, duration, isTelework)  
  CONSTRAINT timesheet_unique_month UNIQUE("missionId", "month", "year")  -- Unicité : Une seule feuille de temps par mission par mois/année
);

-- 4. Activation de la sécurité (Row Level Security - RLS)
ALTER TABLE public.sni_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sni_timesheets ENABLE ROW LEVEL SECURITY;

-- 5. Création des politiques d'accès (Policies)
-- Seul l'utilisateur propriétaire peut voir/modifier ses données

-- Politiques pour sni_missions
CREATE POLICY "Users can view own missions" 
ON public.sni_missions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions" 
ON public.sni_missions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions" 
ON public.sni_missions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own missions" 
ON public.sni_missions FOR DELETE 
USING (auth.uid() = user_id);

-- Politiques pour sni_timesheets
CREATE POLICY "Users can view own timesheets" 
ON public.sni_timesheets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timesheets" 
ON public.sni_timesheets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timesheets" 
ON public.sni_timesheets FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timesheets" 
ON public.sni_timesheets FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Triggers pour updated_at
CREATE OR REPLACE FUNCTION sni_handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_sni_missions_updated BEFORE UPDATE
  ON public.sni_missions FOR EACH ROW
  EXECUTE PROCEDURE sni_handle_updated_at();

CREATE TRIGGER on_sni_timesheets_updated BEFORE UPDATE
  ON public.sni_timesheets FOR EACH ROW
  EXECUTE PROCEDURE sni_handle_updated_at();