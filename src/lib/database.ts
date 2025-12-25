import postgres from "postgres";

export const db = postgres(import.meta.env.DATABASE_URL || "", {
    idle_timeout: 20,
});
