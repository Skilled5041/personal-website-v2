create table if not exists public.counter (
                                              id serial primary key,
                                              name text unique not null,
                                              count_value integer not null
)