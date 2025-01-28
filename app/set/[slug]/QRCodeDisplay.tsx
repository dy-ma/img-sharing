"use client"

import { QRCodeSVG } from "qrcode.react";

export default function QRCodeDisplay({
    set_name,
    token
}: {
    set_name: string,
    token: string
}) {
    const shareUrl = `${window.location.origin}/set/${set_name}?token=${token}`;

    return (
        <div className="border-primary rounded-lg p-2 shadow-md bg-white w-fit h-fit">
            {/* Adjust size to make the QR code smaller */}
            <QRCodeSVG value={shareUrl} size={128} className="" level="H" />
        </div>
    )
}