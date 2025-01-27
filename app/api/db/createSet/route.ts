"use server"

import { createSet } from "@/app/lib/queries";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/app/lib/dal";

export async function POST(req: NextRequest) {
    const session = await verifySession();


    const { set_name } = await req.json();
    if (!set_name) {
        return NextResponse.json({ error: "Set name is required." }, { status: 400 });
    }

    const setId = String(await createSet(set_name, session.userId));

    return NextResponse.json({ success: true, setId });
}