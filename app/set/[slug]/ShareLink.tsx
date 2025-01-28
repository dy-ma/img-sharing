"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ClipboardCopy } from "lucide-react";
import { useRef, useState } from "react";


export default function ShareLink({
    set_name,
    token
}: {
    set_name: string,
    token: string
}) {
    const [copied, setCopied] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const shareUrl = `${window.location.origin}/set/${set_name}?token=${token}`;

    const maxWidth = 400;

    const copyToClipboard = async () => {
        try {
          await navigator.clipboard.writeText(shareUrl)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (err) {
          console.error("Failed to copy text: ", err)
        }
      }

      const handleInputClick = () => {
        inputRef.current?.select()
      }

      return (
        <div className="flex items-center space-x-2 bg-secondary rounded-md" style={{ maxWidth }}>
          <Input
            ref={inputRef}
            type="text"
            value={shareUrl}
            readOnly
            className="flex-grow px-3 py-2 bg-transparent border-none focus:ring-0 cursor-text"
            style={{ width: `calc(${maxWidth} - 40px)` }}
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
      )
}