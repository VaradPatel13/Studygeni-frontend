
export default function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
    // Sizes for the container and dots
    const sizes = {
        sm: { dot: "w-1.5 h-1.5", gap: "gap-1" },
        md: { dot: "w-2 h-2", gap: "gap-1.5" },
        lg: { dot: "w-3 h-3", gap: "gap-2" },
    };

    const { dot, gap } = sizes[size];

    return (
        <div className={`flex items-center ${gap} ${className}`} aria-label="StudyMate Logo">
            <div className={`${dot} rounded-full bg-[var(--color-brand-blue)]`}></div>
            <div className={`${dot} rounded-full bg-[var(--color-brand-red)]`}></div>
            <div className={`${dot} rounded-full bg-[var(--color-brand-yellow)]`}></div>
            <div className={`${dot} rounded-full bg-[var(--color-brand-green)]`}></div>
        </div>
    );
}
