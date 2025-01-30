"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CloudUpload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Set } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

interface FileMeta {
    filename: string,
    preview_url: string,
    size: number,
}

interface PresignedUrl {
    set_name: string,
    filename: string,
    presigned_url: string
}

export default function UploadForm({ set }: { set: Set }) {
    const [files, setFiles] = useState<FileList | null>(null);
    const [fileMetadata, setFileMetadata] = useState<FileMeta[]>([]);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [progress, updateProgress] = useState<number>(0);

    const { toast } = useToast();
    const router = useRouter();

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false); // Reset dragging state when files leave the drop area
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!e.dataTransfer.files) return;

        const dropped_files = Array.from(e.dataTransfer.files);
        // Add files to the list
        setFiles(prevFiles => {
            const combined = prevFiles ? [...Array.from(prevFiles), ...dropped_files] : dropped_files;
            const dataTransfer = new DataTransfer();
            combined.forEach(file => dataTransfer.items.add(file))
            return dataTransfer.files;
        })
        setIsDragging(false);
    }

    const removeFile = (index: number) => {
        // Remove from the files state
        if (files) {
            const updatedFiles = Array.from(files).filter((_, i) => i !== index);

            // To update FileList, create a new FileList-like object (since FileList is not directly mutable)
            const newFileList = new DataTransfer();
            updatedFiles.forEach(file => newFileList.items.add(file));

            // Update the state with the new FileList
            setFiles(newFileList.files);
        }
    }

    const handleUpload = async () => {
        if (!files) {
            return;
        }

        // Format file list
        const filedata = fileMetadata.map((file) => ({
            set_name: set.name,
            filename: file.filename
        }))

        // Send presign requests
        const response = await fetch("/api/images/upload-urls", {
            method: "POST",
            body: JSON.stringify(filedata),
        })

        if (!response.ok) {
            const body = await response.json();
            setError(body.error || "Error uploading files.");
            return;
        }

        const upload_urls = (await response.json()) as PresignedUrl[];
        if (!upload_urls || !Array.isArray(upload_urls)) {
            setError("Error fetching presigned urls.");
        }

        updateProgress(0);
        let num_images_uploaded = 0;
        const num_images_to_upload = upload_urls.length;

        // We upload and update each image as an atomic operation to prevent dangling references
        upload_urls.map(async (image, i) => {
            // Upload to s3
            const target = image.presigned_url;
            const s3_response = await fetch(target, {
                method: "PUT",
                body: files[i]
            });

            if (!s3_response.ok) {
                setError(`Error uploading image ${image.filename}`);
                return;
            }

            // Update metadata
            const meta_response = await fetch("/api/images", {
                method: "POST",
                body: JSON.stringify([{
                    filename: image.filename,
                    set_id: set.id
                }])
            })

            if (meta_response.status !== 201) {
                const { error } = await meta_response.json();
                setError(error);
            }

            // Update counter
            num_images_uploaded++;
            const percent = Math.round((num_images_uploaded / num_images_to_upload) * 100);
            updateProgress(percent);
        })

        // Successful post response
        await new Promise(r => setTimeout(r, 1000));
        router.push(`/set/${set.name}`);
    }

    useEffect(() => {
        if (!files) return;
        // Store Metadata in a separate state
        const files_metadata = Array.from(files).map((file) => ({
            filename: file.name,
            preview_url: URL.createObjectURL(file),
            size: file.size / (1024 * 1024),
        }));
        setFileMetadata(files_metadata);
    }, [files])


    useEffect(() => {
        if (!error) return;
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error
        });
    }, [error, toast])

    return (
        <div>
            <div className="flex flex-col justify-between sm:flex-row sm:items-end">
                <h1 className="text-4xl font-bold mb-2">{set.name}</h1>
                <Button className="font-bold w-full sm:w-fit sm:px-10"
                    disabled={!files}
                    onClick={() => handleUpload()}
                >Upload</Button>
            </div>
            <div className="w-full h-10 mt-3">
                <Progress value={progress} className="w-full" />
            </div>
            <div
                className={`w-full h-48 border-dashed border-2 rounded-lg grid-cols-2 grid mb-8 ${isDragging ? "border-blue-500" : ""}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
            >
                <div className="grid place-items-center">
                    <CloudUpload className="h-20 w-20" />
                </div>
                <div className="flex flex-col justify-center">
                    <h2 className="text-xl font-bold">Your Set is ready to upload.</h2>
                    <p>Drag and drop or&nbsp;
                        <Label htmlFor="photo_selector" className="text-md underline text-blue-500 cursor-pointer">
                            select from your system.
                        </Label>
                    </p>
                    <Input
                        id="photo_selector"
                        type="file"
                        multiple
                        onChange={e => setFiles(e.target.files)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>
            </div>
            <Table>
                <TableCaption>A list of the images you selected.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Filename</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>
                            <div
                                className="hover:opacity-80 hover:underline cursor-pointer"
                                onClick={() => { setFiles(new DataTransfer().files) }}
                            >
                                Clear All
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fileMetadata.map((file, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <a href={file.preview_url} target="__blank__">
                                    <img className="h-8 w-auto" src={file.preview_url} alt={file.filename} />
                                </a>
                            </TableCell>
                            <TableCell>
                                {file.filename}
                            </TableCell>
                            <TableCell>
                                {file.size.toFixed(2)} MB
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="icon" onClick={() => removeFile(index)}>
                                    <X />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}