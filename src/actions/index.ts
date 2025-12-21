import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";
import { insertGuestbookEntry } from "@/lib/sqlc/guestbook_sql.ts";
import { db } from "@/lib/database.ts";

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
                .max(1024, "Message must be at most 1024 characters.")
        }),
        async handler(input) {
            const { name, message } = input;
            try {
                return await insertGuestbookEntry(db, {
                    name,
                    message
                });
            } catch (error) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "An unexpected error occurred :("
                });
            }
        }
    })
};
