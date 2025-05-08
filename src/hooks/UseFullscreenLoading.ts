import { useState } from "react";

export function useFullscreenLoading() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | undefined>(undefined);

    const startLoading = (msg: string) => {
        setMessage(msg);
        setIsLoading(true);
    };

    const stopLoading = () => {
        setIsLoading(false);
        setMessage(undefined);
    };

    return {
        isLoading,
        message,
        startLoading,
        stopLoading,
    };
}
