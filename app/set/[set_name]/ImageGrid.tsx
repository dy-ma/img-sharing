"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface PresignedUrl {
    id: number
    uploader_id: number
    presigned_url: string
    filename: string
    set_id: number
}

interface ImageGridProps {
    presigned_urls: PresignedUrl[]
}

export default function ImageGrid({ presigned_urls }: ImageGridProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const openImage = (url: string) => {
        setSelectedImage(url)
    }

    const closeImage = () => {
        setSelectedImage(null)
    }

    const downloadImage = () => {
        if (selectedImage) {
            const link = document.createElement("a")
            link.href = selectedImage
            link.download = "image.jpg"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {presigned_urls.map((image, index) => (
                    <div
                        key={index}
                        className="aspect-square overflow-hidden rounded-lg cursor-pointer"
                        onClick={() => openImage(image.presigned_url)}
                    >
                        <img
                            src={image.presigned_url || "/placeholder.svg"}
                            alt={`Grid image ${+ 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                    </div>
                ))}
            </div>

            <Dialog open={!!selectedImage} onOpenChange={closeImage}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Image Preview</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <img
                            src={selectedImage || "/placeholder.svg"}
                            alt="Selected image"
                            className="w-full h-auto object-contain max-h-[70vh]"
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={downloadImage}>
                            <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

