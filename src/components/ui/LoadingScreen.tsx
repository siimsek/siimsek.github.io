import { useEffect, useState } from 'react';

interface LoadingScreenProps {
    onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const [progress, setProgress] = useState(0);
    const [dots, setDots] = useState('');

    useEffect(() => {
        // Dot animation
        const dotInterval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 400);

        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    clearInterval(dotInterval);
                    setTimeout(onComplete, 300); // Small delay before transition
                    return 100;
                }
                return prev + 4; // Increment by 4% every 50ms = 2.5 seconds total
            });
        }, 50);

        return () => {
            clearInterval(dotInterval);
            clearInterval(progressInterval);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center z-50 transition-opacity duration-300"
            style={{ opacity: progress === 100 ? 0 : 1 }}>
            <div className="text-center">
                {/* Circuit icon animation */}
                <div className="mb-8 relative">
                    <div className="w-24 h-24 mx-auto">
                        {/* Animated circuit board icon */}
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Board outline */}
                            <rect x="10" y="10" width="80" height="80" rx="4"
                                fill="none" stroke="#00ff88" strokeWidth="2" opacity="0.5" />

                            {/* Animated traces */}
                            <line x1="20" y1="50" x2="80" y2="50"
                                stroke="#00ff88" strokeWidth="2" opacity="0.7"
                                strokeDasharray="60" strokeDashoffset={60 - (progress * 0.6)}>
                            </line>
                            <line x1="50" y1="20" x2="50" y2="80"
                                stroke="#00ff88" strokeWidth="2" opacity="0.7"
                                strokeDasharray="60" strokeDashoffset={60 - (progress * 0.6)}>
                            </line>

                            {/* Central component */}
                            <circle cx="50" cy="50" r="8" fill="#00ff88" opacity={progress / 100}>
                                <animate attributeName="opacity"
                                    values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                            </circle>

                            {/* Corner components */}
                            <circle cx="25" cy="25" r="4" fill="#b87333" opacity={Math.min(progress / 50, 1)} />
                            <circle cx="75" cy="25" r="4" fill="#b87333" opacity={Math.min(progress / 50, 1)} />
                            <circle cx="25" cy="75" r="4" fill="#b87333" opacity={Math.min(progress / 50, 1)} />
                            <circle cx="75" cy="75" r="4" fill="#b87333" opacity={Math.min(progress / 50, 1)} />
                        </svg>
                    </div>
                </div>

                {/* Loading text */}
                <div className="text-[#00ff88] font-mono text-lg mb-4">
                    Setting Up Components{dots}
                </div>

                {/* Progress bar */}
                <div className="w-64 h-1 bg-[#1a3d28] rounded-full overflow-hidden mx-auto">
                    <div
                        className="h-full bg-gradient-to-r from-[#00ff88] to-[#b87333] transition-all duration-100 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Progress percentage */}
                <div className="text-[#00ff88] font-mono text-sm mt-2 opacity-50">
                    {progress}%
                </div>
            </div>
        </div>
    );
}
