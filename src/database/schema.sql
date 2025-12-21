create table if not exists public.counter (
                                              id serial primary key,
                                              name text unique not null,
                                              count_value integer not null
);

create table if not exists public.guestbook_entries (
                                                id serial primary key,
                                                name text not null,
                                                message text not null,
                                                created_at timestamp with time zone default current_timestamp
);

create table if not exists public.rate_limits (
    id serial primary key,
    key text unique not null,
    count integer not null default 1,
    window_start timestamp with time zone default current_timestamp
);

-- Index for faster lookups and cleanup
create index if not exists idx_rate_limits_key on public.rate_limits(key);
create index if not exists idx_rate_limits_window_start on public.rate_limits(window_start);
