import { useEffect, useState } from "react";

export function useDelayedLoading(isLoading: boolean, delay = 300) {
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | undefined;

        if (isLoading) {
            timeoutId = setTimeout(() => setShowLoading(true), delay);
        } else {
            clearTimeout(timeoutId);
            setShowLoading(false);
        }

        return () => clearTimeout(timeoutId);
    }, [isLoading, delay]);

    return showLoading;
}
