
import { cn } from "@/lib/utils";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-[var(--bg-surface-highlight)]", className)}
            {...props}
        />
    );
}

export { Skeleton };
