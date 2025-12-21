export const prerender = false;

import { getGuestbookEntriesPaginated } from "@/lib/sqlc/guestbook_sql";
import type { APIRoute } from "astro";
import { db } from "@/lib/database";

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    let page = parseInt(url.searchParams.get("page") || "1");

    // Show the first page if invalid page number is provided
    if (isNaN(page) || page < 1) {
        page = 1;
    }

    try {
        const entries = await getGuestbookEntriesPaginated(db, {
            offset: ((page - 1) * 10).toString(),
        });

        return new Response(JSON.stringify({ entries }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
