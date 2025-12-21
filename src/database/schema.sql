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
)