"use server"

import { getSets } from "@/app/lib/queries";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);
    if (!session?.userId) {
        return NextResponse.redirect(new URL("/login"));
    }

    try {
        const sets = await getSets();
        return NextResponse.json({ sets });
    } catch {
        return NextResponse.json({ error: "Error getting sets."}, { status: 500 });
    }
}