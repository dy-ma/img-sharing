"use client"

import { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function ImageLoader({ src, alt, width, height }: { src: string, alt: string, width: string, height: string }) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="relative w-full h-full">
            {!isLoaded && (
                <Skeleton />
            )}

            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ease-in-out`}
                loading="lazy"
                onLoad={() => setIsLoaded(true)} // Once the image loads, set it to visible
                style={{ width, height }}
            />
        </div>
    );
}