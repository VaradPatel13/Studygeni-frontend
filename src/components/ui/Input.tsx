import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, icon: Icon, ...props }, ref) => {
    return (
        <div className="relative w-full">
            {Icon && (
                <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            )}
            <input
                ref={ref}
                className={cn(
                    "w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-3 text-sm font-medium placeholder:text-gray-500 focus:outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                    Icon ? "pl-12 pr-4" : "px-4",
                    className
                )}
                {...props}
            />
        </div>
    );
});

Input.displayName = "Input";

export { Input };
