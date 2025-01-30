import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { name } = await req.json();
    if (!name) {
        return NextResponse.json({ error: "Request body must include name." }, { status: 400 });
    }

    const set_with_name = await prisma.set.findUnique({
        where: {
            name
        }
    });

    if (set_with_name) {
        return NextResponse.json({ error: "Name exists." }, { status: 409 });
    }
    return NextResponse.json(null, { status: 200 });
}