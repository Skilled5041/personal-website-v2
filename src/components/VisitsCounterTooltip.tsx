import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

export default function VisitsCounterTooltip({ children }: { children: ReactNode }) {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span>{children}</span>
                </TooltipTrigger>
                <TooltipContent>Total visits</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
