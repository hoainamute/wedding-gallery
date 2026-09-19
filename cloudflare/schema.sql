create table if not exists photos (
  id text primary key,
  object_key text not null unique,
  guest_name text not null,
  caption text,
  content_type text not null,
  status text not null default 'pending' check(status in ('pending','approved','hidden')),
  created_at text not null default (datetime('now'))
);
create index if not exists photos_status_created on photos(status, created_at desc);
