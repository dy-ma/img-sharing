"use server"

import { addImageToSet } from "@/app/lib/queries";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);
    if (!session?.userId) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    const { setId, fileName } = await req.json();

    if (!setId || !fileName) {
        return NextResponse.json(
            { error: "Set name or filename is missing." }, { status: 400 }
        );
    }

    const id = await addImageToSet(setId, fileName, session.userId);
    if (id) {
        return NextResponse.json({ success: true, imageId: String(id) });
    } else {
        return NextResponse.json(
            { error: "An error occurred adding the image to the set." }, { status: 500 }
        );
    }
}