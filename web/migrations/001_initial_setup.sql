create type service_status as ENUM ('operational',
'degraded',
'partial_outage',
'major_outage',
'maintenance');

create table users(
    id uuid primary key,
    fullname text not null,
    email text not null unique,
    password_hash text not null,
    avatar_url text
);

create table sessions(
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    session_auth_hash text not null unique,
    created_at timestamp not null default now(),
    expires_at timestamp not null
);

create table organizations(
    id uuid primary key,
    name text not null,
    slug text not null unique,
    created_by uuid not null references users(id)
);

create table organization_members(
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    organization_id uuid not null references organizations(id) on delete cascade,
    joined_at timestamp not null default now(),
    unique(organization_id,user_id)
);

create table environments(
    id uuid primary key,
    name text not null,
    organization_id uuid not null references organizations(id) on delete cascade,
    created_at timestamp not null default now(),
    unique(organization_id,name)
);

create table services(
    id uuid primary key,
    environment_id uuid not null references environments(id) on delete cascade,
    name text not null,
    description text not null,
    service_status service_status not null,
    created_at timestamp not null default now()
);