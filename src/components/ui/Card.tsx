import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
    active?: boolean; // For selection states
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, hoverable, active, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all",
                hoverable && "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 cursor-pointer",
                active && "ring-2 ring-blue-500", // Example active state
                className
            )}
            {...props}
        />
    );
});

Card.displayName = "Card";

export { Card };
