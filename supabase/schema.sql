create table public.albums (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  access_code_hash text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  storage_path text unique not null,
  caption text,
  submitted_by text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  taken_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.albums enable row level security;
alter table public.photos enable row level security;

-- Only approved photos from public albums are readable anonymously.
create policy "public approved photos" on public.photos for select using (
  status = 'approved' and exists (select 1 from public.albums a where a.id = album_id and a.is_public)
);
-- Create a separate authenticated admin policy after assigning an admin claim.
