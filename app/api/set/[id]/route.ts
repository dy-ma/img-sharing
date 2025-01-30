import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { BUCKET_NAME, S3 } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

// Get set metadata
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const set = await prisma.set.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!set) {
        return new NextResponse(`No set found with id: ${id}.`, { status: 404 })
    }

    return NextResponse.json(set, { status: 200 })
}

// Delete a set
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Verify user
    const session = await verifySession();
    if (!session.isAuth || !session.userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract parameters
    const id = (await params).id;

    const set = await prisma.set.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!set) {
        return new NextResponse("Set not found", { status: 404 });
    }

    const imagesToDelete = await prisma.image.findMany({
        where: {
            set_id: set.id,
            uploader_id: Number(session.userId)
        }
    })

    const deletedImages = await prisma.image.deleteMany({
        where: {
            set_id: set.id,
            uploader_id: Number(session.userId)
        }
    })

    if (deletedImages.count === 0) {
        return new NextResponse("Images were not deleted. Ensure you are the set owner", { status: 403 });
    }

    // Issue delete if there's a match
    const deletedSet = await prisma.set.deleteMany({
        where: {
            id: set.id,
            uploader_id: Number(session.userId)
        }
    })

    if (deletedSet.count === 0) {
        return NextResponse.json("Sets can only be deleted by the owner.", { status: 403 });
    }

    await Promise.all(imagesToDelete.map(async image => {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${set.name}/${image.filename}`
        })
        await S3.send(command);
    }))

    // No deletions means this user isn't the set owner
    return NextResponse.json("Set successfully deleted", { status: 200 });
}