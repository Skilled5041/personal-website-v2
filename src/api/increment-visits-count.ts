export const prerender = false;

import { incrementVisitsCount } from "@/lib/sqlc/counters_sql.ts";
import { db } from "@/lib/database.ts";

export async function POST() {
    const result = await incrementVisitsCount(db);

    if (!result) {
        return new Response(JSON.stringify({ error: "Failed to increment visits count" }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }

    return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
    });
}
