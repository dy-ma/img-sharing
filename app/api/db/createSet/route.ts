"use server"

import { createSet } from "@/app/lib/queries";
import { decrypt, SessionPayload } from "@/app/lib/session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);
    if (!session?.userId) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }


    const { set_name } = await req.json();
    if (!set_name) {
        return NextResponse.json({ error: "Set name is required." }, { status: 400 });
    }

    const setId = String(await createSet(set_name, session.userId));

    return NextResponse.json({ success: true, setId });
}