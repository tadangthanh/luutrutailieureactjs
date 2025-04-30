import React from "react";

interface UploadProgressProps {
    fileName: string;
    percent: number;
    currentChunk: number;
    total: number;
    onCancel: () => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
    fileName,
    percent,
    currentChunk,
    total,
    onCancel,
}) => {
    return (
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50 w-72">
            <p className="text-sm text-primary font-semibold mb-2 truncate">
                Đang upload: {fileName}
            </p>
            <progress className="w-full h-3" value={percent} max={100} />
            <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-secondary">
                    {currentChunk}/{total} chunks ({percent}%)
                </p>
                {percent < 100 && (
                    <button
                        onClick={onCancel}
                        className="text-xs text-red-500 hover:underline"
                    >
                        Hủy
                    </button>
                )}
            </div>
        </div>
    );
};
