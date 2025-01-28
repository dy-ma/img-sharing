"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Set } from "@/app/lib/queries";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteConfirmDialog({
    set
}: {
    set: Set
}) {

    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const router = useRouter();

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const set_name = set.name;
            const set_id = set.id;
            const uploader = set.uploader;

            const response = await fetch("/api/db/deleteSet", {
                method: "POST", // Specify the HTTP method
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ set_name, set_id, uploader })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json(); // Parse JSON response
            console.log("Delete successful:", data);
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to delete set:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive">Delete Set</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your photos. Make sure you've copied them somewhere.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button 
                        variant="destructive" 
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >Yes I'm Sure</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    );
}