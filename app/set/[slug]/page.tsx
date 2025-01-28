"use server"
import { verifySession } from "@/app/lib/dal";
import { Image as tImage, getImagesInSet, getSetMetadata, getUser } from "@/app/lib/queries";
import { generatePresignedGetUrl } from "@/app/lib/s3";
import { redirect } from "next/navigation";
import ImageGrid from "./ImageGrid";

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

    return (
        <div className="container m-auto py-2">
            {/* Title and Uploader Info */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold">{set.name}</h1>
                <p className="text-sm text-gray-600">Uploaded by: {uploader.email}</p>
            </div>

            <ImageGrid images={presignedUrls}/>
        </div>
    );
}