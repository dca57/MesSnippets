-- Migration MesTaches vers Supabase
-- Date: 2025-12-22

-- 1. Table sni_taches_projects
create table if not exists sni_taches_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  name text not null,
  client text,
  status text check (status in ('todo', 'doing', 'done')) default 'todo',
  mode_gestion_charge boolean default true,
  manual_estimated numeric default 0,
  manual_spent numeric default 0,
  
  -- Champ JSONB pour stocker le Wiki du projet (format: { "Section Name": "Content", ... })
  wiki jsonb default '{}'::jsonb
);

alter table sni_taches_projects enable row level security;

create policy "Users can CRUD their own projects"
  on sni_taches_projects
  for all
  using (auth.uid() = user_id);

-- Trigger pour updated_at (suppose que la fonction existe déjà selon la demande)
create trigger handle_updated_at
  before update on sni_taches_projects
  for each row
  execute procedure sni_handle_updated_at();


-- 2. Table sni_taches_tasks
create table if not exists sni_taches_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  project_id uuid references sni_taches_projects(id) on delete cascade not null,

  title text not null,
  status text check (status in ('todo', 'analysis', 'doing', 'blocked', 'review', 'done', 'archived')) default 'todo',
  priority text default 'normal',
  difficulty text default 'medium',
  is_pinned boolean default false,
  order_index numeric default 0,
  
  spent_duration numeric default 0, -- en secondes
  estimated_duration numeric default 0, -- en minutes
  
  notes text,
  
  -- Champ texte pour les "Recettes" / QA Scenarios
  recettes text,
  
  -- Champ JSONB pour les sous-tâches (checklist)
  subtasks jsonb default '[]'::jsonb
);

alter table sni_taches_tasks enable row level security;

create policy "Users can CRUD their own tasks"
  on sni_taches_tasks
  for all
  using (auth.uid() = user_id);

create trigger handle_updated_at
  before update on sni_taches_tasks
  for each row
  execute procedure sni_handle_updated_at();

-- Index pour les performances
create index idx_sni_taches_projects_user on sni_taches_projects(user_id);
create index idx_sni_taches_tasks_user on sni_taches_tasks(user_id);
create index idx_sni_taches_tasks_project on sni_taches_tasks(project_id);
