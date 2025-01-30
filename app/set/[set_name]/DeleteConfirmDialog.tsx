"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Set } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteConfirmDialog({
    set,
}: {
    set: Set,
}) {

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const router = useRouter();

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await fetch(`/api/set/${set.id}`, { method: "DELETE" });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to delete set:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog>
            < DialogTrigger asChild >
                <Button variant="destructive" className="fixed bottom-0 right-0 m-4">Delete Set</Button>
            </DialogTrigger >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your photos. Make sure you&apos;ve copied them somewhere.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >Yes I&apos;m Sure</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}