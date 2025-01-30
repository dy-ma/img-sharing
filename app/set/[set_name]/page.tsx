import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import QrDisplay from "./QrDisplay";
import Link from "next/link";
import LoginButton from "@/components/LoginButton";
import { BUCKET_NAME, S3 } from "@/lib/s3";
import type { Image, Set } from "@prisma/client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ImageGrid from "./ImageGrid";
import SetInfoDisplay from "./SetInfoDisplay";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

async function presignImage(set: Set, image: Image) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${set.name}/${image.filename}`,
    });

    const signed_url = await getSignedUrl(S3, command);
    return {
        ...image,
        presigned_url: signed_url
    };
}

export default async function SetPage({
    params,
    searchParams
}: {
    params: Promise<{ set_name: string }>,
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { set_name } = await params;
    const queryParams = await searchParams;
    const token = await queryParams?.token;

    const session = await verifySession();

    const set = await prisma.set.findUnique({
        where: {
            name: set_name
        }
    })

    if (!set || (!session.isAuth && !token)) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-screen">
                <h1 className="text-4xl">404 - Set not found</h1>
                <div className="flex flex-col justify-start items-start max-w-lg mt-6">
                    <p><span className="font-semibold">If you are the set owner</span>, make sure you are signed in.</p>
                    <p><span className="font-semibold">If you are not the set owner</span>, make sure you are using the proper sharing link provided by the set owner</p>
                </div>
            </div>
        )
    }

    if (Number(session.userId) != set.uploader_id &&
        token === set.token) {
        return (
            <div className="grid place-items-center w-full min-h-screen">
                <h1 className="text-4xl">403 - Forbidden</h1>
            </div>
        )
    }

    const images = await prisma.image.findMany({
        where: {
            set_id: set.id
        }
    })

    if (!images || !Array.isArray(images) || images.length === 0) {
        return (
            <div className="grid place-items-center w-full min-h-screen">
                <h1 className="text-4xl">403 - Forbidden</h1>
            </div>
        )
    }

    const presigned_urls = await Promise.all(images.map(image => presignImage(set, image)))

    return (
        <>
            <header className="flex justify-between p-4">
                <Link href="/">
                    <h1 className="text-xl font-semibold">ImgShare</h1>
                </Link>
                <LoginButton />
            </header>
            <div className="flex flex-col w-full min-h-screen p-4 pt-20 sm:px-10">
                <div className="flex flex-col justify-between md:flex-row sm:items-center">
                    <h1 className="text-4xl font-bold m-4">{set.name}</h1>
                    <div className="sm:flex rounded-md p-4 mb-4 bg-secondary">
                        <QrDisplay set={set} />
                        <SetInfoDisplay set={set} />
                    </div>
                </div>
                <ImageGrid presigned_urls={presigned_urls} />
            </div>
            <DeleteConfirmDialog set={set} />
        </>
    )
}