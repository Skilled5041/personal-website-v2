import { Sql } from "postgres";

export const getRateLimitQuery = `-- name: GetRateLimit :one
SELECT count, window_start
FROM rate_limits
WHERE key = $1 AND window_start > $2`;

export interface GetRateLimitArgs {
    key: string;
    windowStart: Date | null;
}

export interface GetRateLimitRow {
    count: number;
    windowStart: Date | null;
}

export async function getRateLimit(sql: Sql, args: GetRateLimitArgs): Promise<GetRateLimitRow | null> {
    const rows = await sql.unsafe(getRateLimitQuery, [args.key, args.windowStart]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        count: row[0],
        windowStart: row[1]
    };
}

export const upsertRateLimitQuery = `-- name: UpsertRateLimit :exec
INSERT INTO rate_limits (key, count, window_start)
VALUES ($1, 1, $2)
ON CONFLICT (key) DO UPDATE SET count = 1, window_start = $2`;

export interface UpsertRateLimitArgs {
    key: string;
    windowStart: Date | null;
}

export async function upsertRateLimit(sql: Sql, args: UpsertRateLimitArgs): Promise<void> {
    await sql.unsafe(upsertRateLimitQuery, [args.key, args.windowStart]);
}

export const incrementRateLimitQuery = `-- name: IncrementRateLimit :exec
UPDATE rate_limits
SET count = count + 1
WHERE key = $1`;

export interface IncrementRateLimitArgs {
    key: string;
}

export async function incrementRateLimit(sql: Sql, args: IncrementRateLimitArgs): Promise<void> {
    await sql.unsafe(incrementRateLimitQuery, [args.key]);
}

export const cleanupExpiredRateLimitsQuery = `-- name: CleanupExpiredRateLimits :exec
DELETE FROM rate_limits WHERE window_start < $1`;

export interface CleanupExpiredRateLimitsArgs {
    windowStart: Date | null;
}

export async function cleanupExpiredRateLimits(sql: Sql, args: CleanupExpiredRateLimitsArgs): Promise<void> {
    await sql.unsafe(cleanupExpiredRateLimitsQuery, [args.windowStart]);
}

