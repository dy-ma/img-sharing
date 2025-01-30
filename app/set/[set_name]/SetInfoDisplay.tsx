"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { Set } from "@prisma/client"
import { Check, ClipboardCopy } from "lucide-react";
import { useEffect, useRef, useState } from "react"

export default function SetInfoDisplay({ set }: { set: Set }) {
    const [shareUrl, setShareUrl] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setShareUrl(`${window.location.origin}/set/${set.name}?token=${set.token}`)
    }, [set])

    const copyToClipboard = async () => {
        if (shareUrl) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy text: ", err);
            }
        }
    };

    const handleInputClick = () => {
        inputRef.current?.select();
    };


    const expirationDate = new Date(set.created_at.getTime() + 12096e5);
    const timeRemaining = expirationDate.getTime() - Date.now();
    const daysRemaining = Math.round(timeRemaining / (1000 * 60 * 60 * 24));
    const totalDays = 14;

    const progress = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100))

    let statusColor = "text-green-600"
    let progressColor = ""

    if (daysRemaining <= 3) {
        statusColor = "text-red-600"
        progressColor = "bg-red-600"
    } else if (daysRemaining <= 7) {
        statusColor = "text-yellow-600"
        progressColor = "bg-yellow-600"
    }


    return (
        <div className="my-4 flex flex-col m-2">
            <div className="w-full my-4">
                < div className="flex justify-between items-center mb-2" >
                    <span className={`text-sm font-medium ${statusColor}`}>
                        {daysRemaining > 0
                            ? `Expires in ${daysRemaining} day${daysRemaining > 1 ? "s" : ""}`
                            : "This set has expired."}
                    </span>
                    <span className="text-sm font-medium text-gray-500">{Math.round(progress)}%</span>
                </div >
                <Progress value={progress} className={`h-2 ${progressColor}`} />
            </div >
            <Label htmlFor="share" className="mb-2 font-semibold">Copy Sharing URL or Scan QR Code</Label>
            <div className="flex items-center space-x-2 bg-secondary rounded-md">
                <Input
                    id="share"
                    ref={inputRef}
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-grow px-3 py-2 bg-gray-100 text-black border-none focus:ring-0 cursor-text"
                    onClick={handleInputClick}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="flex-shrink-0"
                    aria-label="Copy URL to clipboard"
                >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                </Button>
            </div>
        </div >
    )
}