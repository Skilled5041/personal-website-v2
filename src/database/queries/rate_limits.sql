-- name: GetRateLimit :one
SELECT count, window_start
FROM rate_limits
WHERE key = $1 AND window_start > $2;

-- name: UpsertRateLimit :exec
INSERT INTO rate_limits (key, count, window_start)
VALUES ($1, 1, $2)
ON CONFLICT (key) DO UPDATE SET count = 1, window_start = $2;

-- name: IncrementRateLimit :exec
UPDATE rate_limits
SET count = count + 1
WHERE key = $1;

-- name: CleanupExpiredRateLimits :exec
DELETE FROM rate_limits WHERE window_start < $1;

