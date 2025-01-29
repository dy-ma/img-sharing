import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";

// Get set metadata
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string}> }
) {
    const id = (await params).id;
    const set = await prisma.set.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!set) {
        return new NextResponse(null, { status: 404 })
    }

    return NextResponse.json(set, { status: 200 })
}

// Delete a set
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string}> }
) {
    // Verify user
    const session = await verifySession();
    if (!session.isAuth) {
        return new NextResponse(null, { status: 401 });
    }

    // Extract parameters
    const id = (await params).id;

    // Issue delete if there's a match
    const deletedSet = await prisma.set.deleteMany({
        where: {
            id: Number(id),
            uploader_id: Number(session.userId)
        }
    })

    // No deletions means this user isn't the set owner
    if (deletedSet.count === 0) {
        return new NextResponse(null, { status: 403 });
    }

    return new NextResponse(null, { status: 200 });
}