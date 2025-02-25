import clsx from "clsx";
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
            className={clsx(
                "inline-flex items-center rounded-full bg-gray-900 px-2 py-1 text-sm font-medium text-gray-100 dark:bg-gray-100 dark:text-gray-800",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
