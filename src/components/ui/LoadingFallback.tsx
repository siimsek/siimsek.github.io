import { Loader2 } from 'lucide-react';

export function LoadingFallback() {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-[#010409]">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-[#00ff88] animate-spin mx-auto mb-4" />
                <p className="text-[#4a8c5d] font-mono text-sm">Loading PCB...</p>
            </div>
        </div>
    );
}
