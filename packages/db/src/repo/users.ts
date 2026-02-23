import { eq } from "drizzle-orm";

import { db } from "../index";
import { usersTable } from "../schema/scheme";

export async function getUserById(userId: string) {
    const query = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (query.length == 0) {
        return null;
    }
    return query[0];
}