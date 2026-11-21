-- The order nominations are listed in, kept apart from the id so a nomination can move without
-- changing its page address (/nominations/<id>). New nominations get the next number, at the end.
create sequence nominations_position_seq;
alter table nominations
  add column position integer not null default nextval('nominations_position_seq');
alter sequence nominations_position_seq owned by nominations.position;

update nominations set position = id;
select setval(
  'nominations_position_seq',
  coalesce((select max(position) from nominations), 0) + 1,
  false
);

-- "Мем года" moves up to 9th place and "NPC года" down to 20th, each with its own nominees.
update nominations moved set position = other.position
from nominations other
where (moved.title, other.title) in (('Мем года', 'NPC года'), ('NPC года', 'Мем года'));
