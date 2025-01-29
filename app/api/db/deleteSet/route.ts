"use server"

import { deleteSet } from "@/lib/queries";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";

export async function POST(req: NextRequest) {
    const session = await verifySession();

    if (!session.isAuth) {
        return NextResponse.json({ error: "User is not signed in." }, { status: 401 });
    }

    const { set_name, set_id, uploader } = await req.json();
    if (!set_name) {
        return NextResponse.json({ error: "Set name is required." }, { status: 400 });
    }

    if (uploader !== session.userId) {
        return NextResponse.json({ error: "Unauthorized: Only set owner can delete a set."}, { status: 401 })
    }

    const result = await deleteSet(set_id);

    if (result) {
        return NextResponse.json({ success: true });
    } 

    return NextResponse.json({ error: "Set Delete Failed"}, { status: 500 });
}