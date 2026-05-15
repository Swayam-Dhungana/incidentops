create type method_type as ENUM('GET','POST','PUT','DELETE','PATCH');
create type monitor_status as ENUM('success',
'failure',
'timeout');
create table monitor_config(
    id uuid primary key default gen_random_uuid(),
    service_id uuid not null references services(id),
    method method_type not null default 'GET',
    duration_between_calls int not null,
    failure_threshold int not null,
    timeout_seconds int not null,
    url text not null,
    is_active boolean default true,
    created_at timestamp not null default now() 
);

create table monitor_state(
    id uuid primary key default gen_random_uuid(),
    monitor_id uuid not null unique references monitor_config(id),
    last_checked_at timestamp,
    last_response_time_ms int,
    consecutive_failure_count int not null default 0,
    last_failure_at timestamp,
    last_success_at timestamp
);

create table monitor_history(
    id uuid primary key default gen_random_uuid(),
    monitor_id uuid not null references monitor_config(id),
    checked_at timestamp not null default now(),
    status monitor_status default 'success',
    status_code int,
    response_time_ms int,
    error_message text
);