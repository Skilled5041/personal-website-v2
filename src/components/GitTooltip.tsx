import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import type {ReactNode} from "react"

export default function GitTooltip({children, commitDate}: { children: ReactNode, commitDate: string }) {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span>{children}</span>
                </TooltipTrigger>
                <TooltipContent>
                    {`Last updated on ${new Date(commitDate).toLocaleDateString()}`}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}