"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ImageLoader from "@/components/image_loader";

export type ImageGridProps = {
    images: { id: string, url: string }[];
}

export default function ImageGrid(props: ImageGridProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const images = props.images;

    const handleImageClick = (src: string) => {
        setSelectedImage(src);
    }

    const handleClose = () => {
        setSelectedImage(null);
    }

    const handleSave = () => {
        if (selectedImage) {
            const link = document.createElement("a");
            link.href = selectedImage;
    
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
                {images.map(({ id, url }) => (
                    <div key={id} className="image-item overflow-hidden rounded-lg shadow-lg relative" onClick={() => handleImageClick(url)}>
                        <ImageLoader
                            src={url}
                            alt={`Image ${id}`}
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
                        <img 
                            src={selectedImage || "/placeholder.svg"} 
                            alt="Preview" 
                            className="max-w-full max-h-[60vh] object-contain mx-auto" 
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