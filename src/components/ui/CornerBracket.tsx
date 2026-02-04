import { cn } from "@/lib/utils";

interface CornerBracketProps {
    position: 'tl' | 'tr' | 'bl' | 'br';
}

export function CornerBracket({ position }: CornerBracketProps) {
    // Reduced size from w-24/32 to w-12/16 to fit better as HUD elements
    // Increased z-index to 50 to ensure visibility over canvas
    // Removed global opacity-40 and applied it to fill only
    const baseClasses = "absolute w-24 h-24 md:w-32 md:h-32 pointer-events-none z-50 select-none";
    const positionClasses = {
        tl: "top-0 left-0",
        tr: "top-0 right-0",
        bl: "bottom-0 left-0",
        br: "bottom-0 right-0"
    };

    // Explicit transform styles
    const getRotation = (pos: 'tl' | 'tr' | 'bl' | 'br') => {
        switch (pos) {
            case 'tl': return 'rotate(0deg)';
            case 'tr': return 'rotate(90deg)';
            case 'bl': return 'rotate(-90deg)';
            case 'br': return 'rotate(180deg)';
        }
    };

    return (
        <div className={cn(baseClasses, positionClasses[position])}>
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-[#b87333] drop-shadow-[0_0_2px_rgba(184,115,51,0.5)] transition-all duration-300"
                style={{ transform: getRotation(position) }}
            >
                {/* Outer L-bracket */}
                <path
                    d="M5 5 L35 5 L35 12 L12 12 L12 35 L5 35 Z"
                    fill="currentColor"
                    fillOpacity="0.2"
                    stroke="currentColor"
                    strokeWidth="2"
                />
            </svg>
        </div>
    );
}
