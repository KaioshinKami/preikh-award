-- Kazakh and English versions of the texts, entered in the admin page:
--   nominations: {"kk": {"title", "category", "description"}, "en": {...}}
--   nominees:    {"kk": {"name", "tagline"}, "en": {...}}
-- Russian stays in the main columns and is shown wherever a translation is missing.
alter table nominations add column translations jsonb not null default '{}';
alter table nominees add column translations jsonb not null default '{}';
