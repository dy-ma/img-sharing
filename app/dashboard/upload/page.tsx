"use server"
// import { generateAvailableSetName } from "@/app/lib/queries";
import Upload from "./upload";

export default async function UploadPage() {
    // const initialTitle = await generateAvailableSetName();
    const initialTitle = "";

    return (
        <div className="flex flex-col p-5 sm:max-w-xl items-start">
            <Upload initialTitle={initialTitle} />
        </div>
    )
}