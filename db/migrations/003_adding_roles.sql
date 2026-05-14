create type organization_roles as Enum('admin','manager','team_leader','reviewer');

alter table organization_members
add column role organization_roles default 'reviewer';
