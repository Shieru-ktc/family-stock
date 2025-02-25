import { TagColor } from "@prisma/client";
import Chip from "./ui/chip";
import { tagColorToCn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

export default function Tag({
    tag: { name, color, description },
}: {
    tag: { name: string; color: TagColor; description?: string };
}) {
    const component = <Chip className={tagColorToCn(color)}>{name}</Chip>;

    return description ? (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{component}</TooltipTrigger>
                <TooltipContent>
                    <p>{description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ) : (
        component
    );
}
