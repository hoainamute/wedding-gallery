-- Wedding wishes: guests can submit; the public can only read approved wishes.
create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(trim(guest_name)) between 2 and 60),
  message text not null check (char_length(trim(message)) between 2 and 280),
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  created_at timestamptz not null default now()
);

alter table public.wishes enable row level security;

create policy "Guests can submit a wish" on public.wishes
  for insert to anon with check (status = 'pending');

create policy "Everyone reads approved wishes" on public.wishes
  for select to anon using (status = 'approved');

-- Realtime needs the table included in the publication.
alter publication supabase_realtime add table public.wishes;

-- Approve/hide wishes in Supabase Table Editor, or add an authenticated admin policy later.
