import { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import type { Set, Image } from '@prisma/client';

interface ImageLoaderProps {
    s3_path: string,
    set: Set,
    image: Image,
    width: string,
    height: string,
}

export default function ImageLoader({ s3_path, set, image, width, height }: ImageLoaderProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const path = `${s3_path}/${set.id}/${image.filename}`;
    console.log(path)

    return (
        <div className="relative w-full h-full">
            {!isLoaded && (
                <Skeleton />
            )}

            <img
                src={path}
                alt={image.filename}
                className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ease-in-out`}
                loading="lazy"
                onLoad={() => setIsLoaded(true)} // Once the image loads, set it to visible
                style={{ width, height }}
            />
        </div>
    );
}