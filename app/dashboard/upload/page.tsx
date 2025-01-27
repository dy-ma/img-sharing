"use server"
import { generateAvailableSetName } from "@/app/lib/queries";
import Upload from "./upload";

export default async function UploadPage() {
    const initialTitle = await generateAvailableSetName();

    return (
        <div className="flex flex-col p-5">
            <Upload initialTitle={initialTitle} />
        </div>
    )
}