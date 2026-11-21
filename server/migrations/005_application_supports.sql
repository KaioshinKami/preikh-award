-- Who supports which suggested nominee ("own pick") on a nomination page. The author of a
-- suggestion supports it from the start, so a suggestion's count is the number of people behind it.
create table application_supports (
  application_id integer not null references applications (id) on delete cascade,
  user_id integer not null references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (application_id, user_id)
);

create index application_supports_user_id_idx on application_supports (user_id);

insert into application_supports (application_id, user_id)
select id, user_id from applications;
