"use client"

import type { Set } from "@prisma/client"
import { QRCodeSVG } from "qrcode.react"

export default function QrDisplay({ set }: { set: Set }) {
    const base_url = (typeof window === 'undefined') ? "" : window.location.origin;
    const share_link = `${base_url}/set/${set.name}`;

    return (
        // Add a border
        <div className="border-primary rounded-lg p-2 shadow-md bg-white border-4">
            <QRCodeSVG value={share_link} className="w-full h-auto" />
        </div>
    )
}