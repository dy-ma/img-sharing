import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Get metadata of the image with id
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const image = await prisma.image.findUnique({
        where: {
            id: Number(id)
        }
    });

    if (!image) {
        return NextResponse.json({ error: `No image found with id: ${id}` }, { status: 404 });
    }
    return NextResponse.json(image, { status: 200 });
}