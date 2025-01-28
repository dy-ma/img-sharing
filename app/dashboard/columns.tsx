"use client"

import { Set } from "@/app/lib/queries";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link";

export const columns: ColumnDef<Set>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({row}) => {
            const set = row.original;
            return (
                <Link 
                    href={`/set/${set.name}`}
                    className="text-decoration-line"
                >
                    {set.name}
                </Link>
            )
        }
    },
    {
        accessorKey: "size",
        header: "Size",
    },
    {
        accessorKey: "created_at",
        header: "Expires in",
        cell: ({ row }) => {
            const set = row.original;

            // Calculate remaining days
            const expirationDate = new Date(set.created_at.getTime() + 12096e5);
            const timeRemaining = expirationDate.getTime() - Date.now();
            const daysRemaining = timeRemaining / (1000 * 60 * 60 * 24)
            return (
                <span>{Math.round(daysRemaining)} days</span>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const set = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(set.id)}
                        >
                            Copy Set ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Action 2
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]