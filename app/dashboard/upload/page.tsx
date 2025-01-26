"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { z } from "zod";

const titleSchema = z.string()
    .min(1, "Set name cannot be empty")
    .max(50, "Set name cannot be longer than 50 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "Set name can only contain letters, numbers, dashes and underscores")

export const validateSetName = (setName: string) => {
    try {
        titleSchema.parse(setName);
        return { valid: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { valid: false, error: error.errors[0].message }
        }
        return { valid: false, error: "Title error" }
    }
};

export default function Upload() {
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Get a random name to set as title
    // useEffect fetch because it's a client component
    useEffect(() => {
        async function fetchRandomName() {
            const res = await fetch("/api/db/getSetName");
            const data = await res.json();

            if (!res.ok) {
                return
            }

            // Soft error. If we're out of names, just leave blank for the user
            setTitle(data.name);
        }
        fetchRandomName();
    }, [])

    async function handleUpload() {
        if (!title || !files) {
            alert("Provide a title and select files.")
            return;
        }


        const validation = validateSetName(title);
        if (!validation.valid) {
            setError(validation.error || "Title error");
            return;
        }

        setIsUploading(true);

        try {
            // Create a new set and get id
            const createSetResponse = await fetch("/api/db/createSet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ set_name: title })
            });

            if (!createSetResponse.ok) {
                const data = await createSetResponse.json();
                setError(data.error || "Failed to create set.");
                setIsUploading(false);
                return;
            }

            const { setId } = await createSetResponse.json();
            if (!setId) {
                setError("Set ID not returned.");
                setIsUploading(false);
                return;
            }

            // Prepare files for request
            const fileList = Array.from(files).map((file) => ({
                originalName: file.name,
                mimeType: file.type,
            }));

            // Send the requst to get presigned urls
            const res = await fetch("/api/s3/presign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    setId: setId,
                    setName: title,
                    files: fileList
                })
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to generate presigned URLs");
                setIsUploading(false);
                return;
            }

            const { urls } = await res.json();
            console.log(urls);

            // Upload
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const url = urls[i].presignedUrl;

                const upload_result = await fetch(url, {
                    method: "PUT",
                    body: file,
                });

                if (!upload_result.ok) {
                    setError("Failed to upload.");
                    break;
                }

                // Populate the images table
                const imageData = {
                    setId: setId,
                    fileName: file.name,
                }

                const addImageResponse = await fetch("/api/db/addImage", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(imageData),
                })
                
                if (!addImageResponse.ok) {
                    setError("Failed to add image for file: " + file.name);
                    break;
                }
            }

        } catch (err) {
            setError("An error occured during the request.");
        } finally {
            setIsUploading(false);
        }

    }

    return (
        <div className="flex flex-col py-5 px-5">
            <Label htmlFor="title">Title</Label>
            <Input
                className="max-w-l"
                id="title"
                placeholder={title}
                value={title}
                onChange={e => setTitle(e.target.value)}
            />

            <div>Tags</div>
            <Input
                className="max-w-l"
                id="tags"
                placeholder="Tags"
                value={tags}
                onChange={e => setTags(e.target.value)}
            />

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="photo_selector">Pictures</Label>
                <Input
                    id="photo_selector"
                    type="file"
                    multiple
                    onChange={e => setFiles(e.target.files)}
                />
            </div>

            <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
            </Button>

            {message && <p>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}