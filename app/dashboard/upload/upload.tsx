"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { z } from "zod";

const titleSchema = z.string()
    .min(1, "Set name cannot be empty")
    .max(50, "Set name cannot be longer than 50 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "Set name can only contain letters, numbers, dashes and underscores")

const validateSetName = (setName: string) => {
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

function validateInputs(title: string, files: FileList | null) {
    if (!title) return { valid: false, error: "Provide a title."};
    if (!files) return { valid: false, error: "Select files to upload."};

    const validation = validateSetName(title);
    if (!validation.valid) return { valid: false, error: validation.error };

    return { valid: true };
}

async function createSet(setName: string) {
    const response = await fetch("/api/db/createSet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_name: setName }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create set.");
    }

    const { setId } = await response.json();
    if (!setId) throw new Error("Set ID not returned.");
    return setId;
}

async function getPresignedUrls(setId: string, setName: string, files: FileList) {
    const fileList = Array.from(files).map((file) => ({
        originalName: file.name,
        mimeType: file.type,
    }));

    const response = await fetch("/api/s3/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, setName, files: fileList})
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate presigned URLs.");
    }

    return response.json();
}

async function uploadFilesToS3(urls: any[], files: FileList) {
    const uploadPromises = Array.from(files).map((file, i) => {
        const url = urls[i].presignedUrl;
        return fetch(url, { method: "PUT", body: file }).then((response) => {
            if (!response.ok) throw new Error(`Failed to upload file: ${file.name}`);
        });
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
}

async function addImagesToDb(setId: string, files: FileList) {
    const dbPromises = Array.from(files).map(async (file) => {
        const imageData = { setId, fileName: file.name };

        return fetch("/api/db/addImage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(imageData),
        }).then((response) => {
            if (!response.ok) throw new Error(`Failed to add image: ${file.name}`);
        });
    });

    // Wait for all database entries to complete
    await Promise.all(dbPromises);
}

export default function Upload({ initialTitle }: {initialTitle: string}) {
    const [name, setName] = useState(initialTitle || "");
    const [tags, setTags] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    async function handleUpload() {
        const validation = validateInputs(name, files);
        if (!validation.valid) {
            setError(validation.error || "Input validation error.");
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            const setId = await createSet(name);
            const { urls } = await getPresignedUrls(setId, name, files!);
            await uploadFilesToS3(urls, files!);
            await addImagesToDb(setId, files!);
            alert("Upload successful!");
        } catch (error: any) {
            setError(error.message || "An error occured during upload.");
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
                placeholder={name}
                value={name}
                onChange={e => setName(e.target.value)}
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

            {/* {message && <p>{message}</p>} */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}