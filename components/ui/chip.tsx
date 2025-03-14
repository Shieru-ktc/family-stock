import { cn } from "@/lib/utils";
import { JSX } from "react";

export default function Chip({
    children,
    className,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
} & React.HTMLAttributes<HTMLDivElement>): JSX.Element {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-md bg-gray-900 px-2 py-1 text-sm font-medium text-gray-100 dark:bg-gray-100 dark:text-gray-800",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
