// components/FullScreenLoader.tsx
import { Loader2 } from "lucide-react";

const FullScreenLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
};

export default FullScreenLoader;
