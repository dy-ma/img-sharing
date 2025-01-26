"use server"

import { decrypt } from "@/app/lib/session";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const insert_query = `
INSERT INTO sets (name, uploader) 
VALUES ($1, $2)
RETURNING id`


export async function POST(req: NextRequest) {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);
    if (!session?.userId) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    const body = await req.json();
    const { set_name } = body;

    if (!set_name) {
        return NextResponse.json(
            { error: "Set name is required." },
            { status: 400 }
        );
    }

    const sql = neon(`${process.env.DB_DATABASE_URL}`);

    const response = await sql("INSERT INTO sets (name, uploader) VALUES ($1, $2) RETURNING id", [set_name, session.userId]);
    
    const id = response[0]?.id;

    if (id) {
        return NextResponse.json({ success: true, setId: String(id) });
    } else {
        return NextResponse.json(
            { error: "An error occurred creating the set." },
            { status: 500 }
        );
    }
}