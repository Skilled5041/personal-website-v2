import { Sql } from "postgres";

export const incrementVisitsCountQuery = `-- name: IncrementVisitsCount :one
update public.counter
set count_value = count_value + 1
where name = 'visits'
returning id, name, count_value`;

export interface IncrementVisitsCountRow {
    id: number;
    name: string;
    countValue: number;
}

export async function incrementVisitsCount(sql: Sql): Promise<IncrementVisitsCountRow | null> {
    const rows = await sql.unsafe(incrementVisitsCountQuery, []).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        name: row[1],
        countValue: row[2]
    };
}

