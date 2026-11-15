create table users (
  id serial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table nominations (
  id serial primary key,
  title text not null,
  category text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table nominees (
  id serial primary key,
  nomination_id integer not null references nominations (id) on delete cascade,
  name text not null,
  tagline text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  -- Lets votes reference (nominee, nomination) as a pair, so a vote can't point to a nominee of another nomination.
  unique (id, nomination_id)
);

create table votes (
  id serial primary key,
  user_id integer not null references users (id) on delete cascade,
  nomination_id integer not null references nominations (id) on delete restrict,
  nominee_id integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, nomination_id),
  foreign key (nominee_id, nomination_id) references nominees (id, nomination_id) on delete restrict
);

create index votes_nominee_id_idx on votes (nominee_id);
create index votes_created_at_idx on votes (created_at);

create table applications (
  id serial primary key,
  user_id integer not null references users (id) on delete cascade,
  nomination_id integer not null references nominations (id) on delete cascade,
  nominee_name text not null,
  comment text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index applications_status_idx on applications (status);

create table settings (
  key text primary key,
  value boolean not null
);

insert into settings (key, value) values ('voting_open', true), ('results_published', false);
