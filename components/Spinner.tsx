import { Loader } from "lucide-react";

export default function Spinner() {
    return (
        <div className="flex justify-center items-center">
            <Loader className="h-4 w-4 animate-spin" />
        </div>
    )
}