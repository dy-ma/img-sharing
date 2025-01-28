import { verifySession } from "@/app/lib/dal";
import { getImagesInSet, getSetMetadata } from "@/app/lib/queries";
import { redirect } from "next/navigation";
import Image from "next/image";

async function fetchPreviewWithAuth(url: string, authToken: string, width: number) {
    const fullpath = `${process.env.WORKER_ENDPOINT}/${url}`;
    const response = await fetch(fullpath, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ width }),
    })

    if (!response.ok) {
        console.log(response)
        throw new Error("Failed to fetch image");
    }

    return await response.blob();
}

async function PreviewImage({
    imageUrl,
    width,
}: {
    imageUrl: string,
    width: number
}) {
    const authToken = process.env.WORKER_SECRET_KEY;
    if (!authToken) {
        throw new Error("Authorization token missing.");
    }

    const imageBlob = await fetchPreviewWithAuth(imageUrl, authToken, width)
    const imageUrlFromBlob = URL.createObjectURL(imageBlob);
    return <Image src={imageUrlFromBlob} width={width} height={300} alt="Image in Set"/>
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

    return (
        <div className="container m-auto">
            <ul>
                <li>
                    Photo Set: {slug}
                </li>
                <li>{set.id}</li>
                <li>{set.created_at.getTime()}</li>
                <li>{set.uploader}</li>
            </ul>
                {images.map((file, i) => <li key={i}>{file.filename}</li>)}

                {images.map((file, i) => <PreviewImage key={i} imageUrl={file.filename} width={300} />)}
        </div>
    )
}