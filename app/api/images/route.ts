import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Create a record for an image
export async function POST(req: NextRequest) {
    const session = await verifySession();
    if (!session.isAuth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load params
    // const { images } = await req.json();
    const images = await req.json();
    if (!Array.isArray(images) || images.length === 0) {
        return NextResponse.json(
            { error: "Request body must include an non-empty images array" },
            { status: 400 }
        );
    }

    // Add the uploader id to the images array
    const images_with_uploader = images.map(image => ({
        ...image,
        uploader_id: Number(session.userId),
    }));

    const added_images = await prisma.image.createManyAndReturn({
        data: images_with_uploader,
        skipDuplicates: true,
    })

    return NextResponse.json(added_images, { status: 201 });
}