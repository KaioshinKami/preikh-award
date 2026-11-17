-- Uploaded pictures live in the database, so the site needs no separate file storage.
-- They are served by GET /api/images/:id and cached by the CDN, so each one is read rarely.
create table images (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  data bytea not null,
  created_at timestamptz not null default now()
);

alter table nominations add column image_url text;
