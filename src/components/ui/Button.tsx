import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    disabled,
    ...props
}, ref) => {

    const baseStyles = "inline-flex items-center justify-center gap-2 font-bold border-2 border-black transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:translate-y-[2px] active:shadow-none";

    const variants = {
        primary: "bg-black text-white hover:bg-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        secondary: "bg-white text-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        outline: "bg-transparent border-2 border-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        destructive: "bg-white text-red-500 border-red-500 hover:bg-red-50 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]", // Red shadow
        ghost: "border-transparent shadow-none hover:bg-gray-100 active:translate-y-0"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10 p-0"
    };

    return (
        <button
            ref={ref}
            disabled={isLoading || disabled}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button };
