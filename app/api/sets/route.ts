import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Create a new set
export async function POST(req: NextRequest) {
    // Only verified users can upload sets
    const session = await verifySession();
    if (!session.isAuth) {
        return new NextResponse(null, { status: 401 })
    }

    // Parse set name
    const { name } = await req.json();
    if (!name) {
        return new NextResponse(null, { status: 400 })
    }

    // Check if name is available
    const set_exists_with_name = await prisma.set.findUnique({
        where: {
            name
        }
    })

    if (set_exists_with_name) {
        return NextResponse.json(
            { error: "Set with this name already exists." },
            { status: 409 })
    }

    // Add set
    const uploader_id = Number(session.userId);
    const new_set = await prisma.set.create({
        data: {
            name,
            uploader_id,
        }
    })

    return NextResponse.json(new_set, { status: 201 })
}

