"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Set, Image } from "@prisma/client";
import ImageLoader from "@/components/ImageLoader";

export type ImageGridProps = {
    s3_path: string
    set: Set
    images: Image[]
}

export default function ImageGrid({ s3_path, set, images }: ImageGridProps) {
    const [selectedImage, setSelectedImage] = useState<Image | null>(null);

    const handleImageClick = (image: Image) => {
        setSelectedImage(image);
    }

    const handleClose = () => {
        setSelectedImage(null);
    }

    const handleSave = () => {
        if (selectedImage) {
            const link = document.createElement("a");
            link.href = selectedImage.filename;

            // Set the download attribute to specify the filename
            link.download = "image.jpg"; // You can set a dynamic name if needed

            // Append the link to the DOM temporarily and trigger a click to initiate the download
            document.body.appendChild(link);
            link.click();

            // Clean up by removing the link after the click
            document.body.removeChild(link);
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                    <div key={image.id} className="image-item overflow-hidden rounded-lg shadow-lg relative" onClick={() => handleImageClick(image)}>
                        <ImageLoader
                            s3_path={s3_path}
                            image={image}
                            set={set}
                            width="100%"
                            height="12rem"
                        />
                    </div>
                ))}
            </div>
            <Dialog open={!!selectedImage} onOpenChange={handleClose}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Image Preview</DialogTitle>
                    </DialogHeader>
                    {selectedImage && (
                        <ImageLoader
                            s3_path={s3_path}
                            set={set}
                            image={selectedImage}
                            width="100%"
                            height="12rem"
                        />
                    )}
                    <DialogFooter>
                        <Button onClick={handleSave}>View full resolution</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}