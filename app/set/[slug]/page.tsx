import { getImagesInSet, getSetMetadata } from "@/app/lib/queries";

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string}>
}) {
    const set_name = (await params).slug;
    const set = await getSetMetadata(set_name);
    const images = await getImagesInSet(set.id);

    return (
        <div className="container m-auto">
            <ul>
                <li>
                    Photo Set: {set_name}
                </li>
                <li>{set.id}</li>
                <li>{set.created_at.getTime()}</li>
                <li>{set.uploader}</li>
            </ul>
            <ol>
                {images.map((file, i) => <li key={i}>{file.filename}</li>)}
            </ol>
        </div>
    )
}