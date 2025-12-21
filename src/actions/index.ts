import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";
import { insertGuestbookEntry } from "@/lib/sqlc/guestbook_sql.ts";
import { db } from "@/lib/database.ts";
import { checkRateLimit } from "@/lib/rate-limit.ts";

// Rate limit config: 5 submissions per minute
const RATE_LIMIT_CONFIG = {
    windowMs: 30 * 1000, // 30 seconds
    maxRequests: 3,
};

export const server = {
    submitGuestbookEntry: defineAction({
        accept: "form",
        input: z.object({
            name: z
                .string()
                .min(1, "Name is required.")
                .max(32, "Name must be at most 32 characters."),
            message: z
                .string()
                .min(1, "Message is required.")
                .max(1024, "Message must be at most 1024 characters."),
        }),
        async handler(input, context) {
            // Get client IP from request headers
            const forwarded = context.request.headers.get("x-forwarded-for");
            const ip =
                forwarded?.split(",")[0]?.trim() ||
                context.request.headers.get("x-real-ip") ||
                "unknown";

            // Check rate limit
            const rateLimitResult = await checkRateLimit(`guestbook:${ip}`, RATE_LIMIT_CONFIG);

            if (!rateLimitResult.allowed) {
                const resetInSeconds = Math.ceil(
                    (rateLimitResult.resetAt.getTime() - Date.now()) / 1000,
                );
                throw new ActionError({
                    code: "TOO_MANY_REQUESTS",
                    message: `Too many submissions. Please try again in ${resetInSeconds} seconds.`,
                });
            }

            const { name, message } = input;
            try {
                return await insertGuestbookEntry(db, {
                    name,
                    message,
                });
            } catch (error) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "An unexpected error occurred :(",
                });
            }
        },
    }),
};
