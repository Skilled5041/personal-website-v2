// Database-based rate limiter for serverless environments
import { db } from "@/lib/database";
import {
    getRateLimit,
    upsertRateLimit,
    incrementRateLimit,
    cleanupExpiredRateLimits,
} from "@/lib/sqlc/rate_limits_sql";

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}

export async function checkRateLimit(
    key: string,
    config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 5 },
): Promise<RateLimitResult> {
    const windowStart = new Date(Date.now() - config.windowMs);

    // Clean up old entries occasionally (1% chance per request)
    if (Math.random() < 0.01) {
        await cleanupExpiredRateLimits(db, { windowStart }).catch(() => {});
    }

    // Try to get existing entry
    const existing = await getRateLimit(db, { key, windowStart });

    if (!existing) {
        // No valid entry, create new one
        const now = new Date();
        await upsertRateLimit(db, { key, windowStart: now });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetAt: new Date(now.getTime() + config.windowMs),
        };
    }

    const currentCount = existing.count;
    const entryWindowStart = existing.windowStart!;
    const resetAt = new Date(entryWindowStart.getTime() + config.windowMs);

    if (currentCount >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt,
        };
    }

    // Increment count
    await incrementRateLimit(db, { key });

    return {
        allowed: true,
        remaining: config.maxRequests - currentCount - 1,
        resetAt,
    };
}
