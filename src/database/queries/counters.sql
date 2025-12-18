-- name: IncrementVisitsCount :one
update public.counter
set count_value = count_value + 1
where name = 'visits'
returning *;