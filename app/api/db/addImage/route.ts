"use server"

import { decrypt } from "@/app/lib/session";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);
    if (!session?.userId) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    const body = await req.json();
    const { setId, fileName } = body;

    if (!setId || !fileName) {
        return NextResponse.json(
            { error: "Set name or filename is missing." },
            { status: 400 }
        );
    }

    const sql = neon(`${process.env.DB_DATABASE_URL}`);
    const insert_query = "INSERT INTO images (set_id, filename, uploader) VALUES ($1, $2, $3) RETURNING id";
    const response = await sql(insert_query, [setId, fileName, session.userId])

    const id = response[0]?.id
    if (id) {
        return NextResponse.json({ success: true, imageId: String(id) });
    } else {
        return NextResponse.json(
            { error: "An error occurred adding the image to the set." },
            { status: 500 }
        );
    }
}