export const prerender = false

import {incrementVisitsCount} from "@/lib/sqlc/counters_sql.ts";
import {db} from "@/lib/database.ts";

export async function POST() {
    const result = await incrementVisitsCount(db);
    return new Response(JSON.stringify(result), {
        headers: {"Content-Type": "application/json"}
    });
}