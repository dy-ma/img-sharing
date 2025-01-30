"use client"

import type { Set } from "@prisma/client"
import { QRCodeSVG } from "qrcode.react"
import { useEffect, useState } from "react";

export default function QrDisplay({ set }: { set: Set }) {
    const [baseUrl, setBaseUrl] = useState<string>("");
    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, [])

    return (
        // Add a border
        <div className="border-primary rounded-lg p-2 shadow-md bg-white border-4 m-1">
            <QRCodeSVG value={`${baseUrl}/set/${set.name}`} className="w-full h-auto" />
        </div>
    )
}