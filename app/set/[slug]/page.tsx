"use server"

import { verifySession } from "@/app/lib/dal";
import { Image as tImage, getImagesInSet, getSetMetadata, getUser, deleteSet } from "@/app/lib/queries";
import { generatePresignedGetUrl } from "@/app/lib/s3";
import { redirect } from "next/navigation";
import ImageGrid from "./ImageGrid";
import ShareLink from "./ShareLink";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import QRCodeDisplay from "./QRCodeDisplay";

async function getPresigned(images: tImage[]) {
    const presigned = await Promise.all(
        images.map(async (image) => {
            const url = await generatePresignedGetUrl(image.filename);
            return { id: image.id!, url };
        })
    )
    return presigned;
}

export default async function Page({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { slug } = await params;
    const queryParams = await searchParams;
    const token = await queryParams?.token;

    const session = await verifySession();

    // If the user is authenticated (session exists) OR has provided a valid token
    if (!(session.isAuth || token)) {
        return redirect('/login');
    }

    const set = await getSetMetadata(slug);
    const images = await getImagesInSet(set.id);

    // If the user isn't the owner and the token is invalid, deny access
    if (token !== set.token && session.userId !== set.uploader) {
        return redirect('/login');
    }

    const presignedUrls = await getPresigned(images);
    const uploader = await getUser(set.uploader!);

    let isUploader = false;
    if (session.isAuth && session.userId === set.uploader) {
        isUploader = true;
    }

    return (
        <div className="container p-4">
            {isUploader &&
                <Button variant="link" asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            }
            {/* Title and Uploader Info */}
            <div className="flex flex-col sm:flex-row mb-4 justify-between sm:max-w-xl items-center">
                <div className="my-4">
                    <h1 className="text-2xl font-bold">{set.name}</h1>
                    <p className="text-sm text-gray-600">Uploaded by: {uploader.email}</p>
                    <ShareLink set_name={set.name} token={set.token!} />
                </div>

                <QRCodeDisplay set_name={set.name} token={set.token!} />
            </div>

            {/* Images */}
            <ImageGrid images={presignedUrls} />

        </div>
    );
}