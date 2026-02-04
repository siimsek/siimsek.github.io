

interface CornerBracketProps {
    position: 'tl' | 'tr' | 'bl' | 'br';
}

export function CornerBracket({ position }: CornerBracketProps) {
    const baseClasses = "absolute w-24 h-24 md:w-32 md:h-32 pointer-events-none z-10";
    const positionClasses = {
        tl: "top-0 left-0",
        tr: "top-0 right-0",
        bl: "bottom-0 left-0",
        br: "bottom-0 right-0"
    };

    // Using explicit transform styles to ensure reliability without relying on specific tailwind config for rotation
    const getRotation = (pos: 'tl' | 'tr' | 'bl' | 'br') => {
        switch (pos) {
            case 'tl': return 'rotate(0deg)';
            case 'tr': return 'rotate(90deg)';
            case 'bl': return 'rotate(-90deg)';
            case 'br': return 'rotate(180deg)';
        }
    };

    return (
        <div className={`${baseClasses} ${positionClasses[position]}`}>
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full opacity-40 transition-transform duration-300"
                style={{ transform: getRotation(position) }}
            >
                {/* Outer L-bracket */}
                <path
                    d="M5 5 L35 5 L35 12 L12 12 L12 35 L5 35 Z"
                    fill="none"
                    stroke="#b87333"
                    strokeWidth="1.5"
                />
                {/* Inner L-bracket */}
                <path
                    d="M5 50 L12 50 L12 88 L35 88 L35 95 L5 95 Z"
                    fill="none"
                    stroke="#b87333"
                    strokeWidth="1.5"
                />
                {/* Corner dot */}
                <circle cx="8" cy="8" r="2" fill="#00ff88" opacity="0.6" />
            </svg>
        </div>
    );
}
