"use client"

import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Set } from "@prisma/client";
import { Check, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AddSetButton({ initialSetname }: { initialSetname: string }) {
    const [setname, updateSetName] = useState<string>(initialSetname);
    const [isNameAvailable, setIsNameAvailable] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateSetName(event.target.value)
    }

    const handleClick = async () => {
        if (isLoading) return;
        if (!isNameAvailable) return;

        const response = await fetch("/api/set", {
            method: "POST",
            body: JSON.stringify({ name: setname })
        })

        if (response.status === 409) {
            alert("This set already exists!");
        } else if (response.status === 201) {
            console.log("Set created successfully");
            const set: Set = await response.json();
            router.push(`/upload/${set.name}`);
        }
    }

    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            if (!setname) return
            setIsLoading(true);
            const response = await fetch('/api/set/check-name', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: setname })
            });

            if (response.status === 200) {
                setIsNameAvailable(true);
            } else {
                setIsNameAvailable(false);
            }
            setIsLoading(false);
        }, 1000)

        // Clean up previous timer
        return () => clearTimeout(debounceTimer);
    }, [setname])

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <Plus className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 m-4">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-bold leading-none text-xl">
                            Add a set
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Choose a name for your set. Set names must be globally unique.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center">
                            <div className="flex gap-2 justify-start">
                                <Label htmlFor="name">
                                    Name
                                </Label>
                                {isLoading ? <Spinner /> : isNameAvailable ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </div>
                            <Input
                                id="name"
                                defaultValue={setname}
                                onChange={handleChange}
                                className="col-span-2 h-8"
                            />
                        </div>
                    </div>
                    <Button
                        disabled={isLoading || !isNameAvailable}
                        onClick={handleClick}
                    >Create Set</Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}