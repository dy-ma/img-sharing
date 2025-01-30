import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3, BUCKET_NAME } from "@/lib/s3";
import { verifySession } from "@/lib/dal";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { Image } from "@prisma/client";
import { prisma } from "@/lib/db";

// Get the presigned upload url of a single image
async function presignImage(set_name: string, image: Image) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${set_name}/${image.filename}`,
    });

    const signed_url = await getSignedUrl(S3, command);
    return signed_url;
}

// Get an array of presigned upload urls
export async function POST(req: NextRequest) {
    const session = await verifySession();
    if (!session.isAuth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const images = (await req.json()) as Image[];
    if (!Array.isArray(images) || images.length === 0) {
        return NextResponse.json(
            { error: "Request body must include non-emtpy images array" },
            { status: 400 })
    }


    // Get presigned urls for each image
    try {

        const set = await prisma.set.findFirst({
            where: {
                id: images[0].set_id
            }
        })

        if (!set) {
            return NextResponse.json({ error: "Malformed: Bad Request" }, { status: 400 });
        }

        // const signed_urls = await Promise.all(images.map(presignImage));
        const signed_urls = await Promise.all(images.map(async image => {
            const presigned_url = await presignImage(set.name, image)
            return ({
                ...image,
                presigned_url: presigned_url
            })
        }))
        return NextResponse.json(signed_urls, { status: 200 });
    } catch (error) {
        console.error("Error generating presigned URLS: ", error);
        return NextResponse.json(
            { error: "Failed to generate presigned URLS" },
            { status: 500 }
        );
    }
}