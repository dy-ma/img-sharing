import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export const verifySession = cache(async () => {
    const cookie = (await cookies()).get("session")?.value 
    const session = await decrypt(cookie);

    if (!session?.userId) {
        return { isAuth: false, userId: null }
    }

    return { isAuth: true, userId: session.userId }
})