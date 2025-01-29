import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import QrDisplay from "./QrDisplay";
import Link from "next/link";
import LoginButton from "@/components/LoginButton";
import ImageGrid from "@/components/ImageGrid";
import { R2_API } from "@/lib/s3";

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

    const s3_path = R2_API!;

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
            set_id: Number(set.id)
        }
    })

    return (
        <>
            <header className="flex justify-between p-4">
                <Link href="/">
                    <h1 className="text-xl font-semibold">ImgShare</h1>
                </Link>
                <LoginButton />
            </header>
            <div className="flex flex-col w-full min-h-screen p-4 pt-20 sm:px-10">
                <div className="flex flex-col justify-between sm:flex-row sm:items-center h-32">
                    <h1 className="text-4xl font-bold mb-2">{set.name}</h1>
                    <QrDisplay set={set} />
                </div>
            </div>
            <ImageGrid s3_path={s3_path} set={set} images={images} />
        </>
    )
}