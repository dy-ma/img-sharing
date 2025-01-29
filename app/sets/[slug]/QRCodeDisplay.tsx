"use client"

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export default function QRCodeDisplay({
    set_name,
    token
}: {
    set_name: string,
    token: string
}) {
    // const shareUrl = `${window.location.origin}/set/${set_name}?token=${token}`;
    const [shareUrl, setShareUrl] = useState<string | null>(null);

    useEffect(() => {
      // Ensure this code runs only in the browser
      if (typeof window !== "undefined") {
        setShareUrl(`${window.location.origin}/set/${set_name}?token=${token}`);
      }
    }, [set_name, token]);
  
    if (!shareUrl) return null; // Avoid rendering until the share URL is defined

    return (
        <div className="border-primary rounded-lg p-2 shadow-md bg-white w-fit h-fit">
            {/* Adjust size to make the QR code smaller */}
            <QRCodeSVG value={shareUrl} size={128} className="" level="H" />

        </div>
    )
}