import React from "react";

interface TextInputModalProps {
    title: string;
    inputValue: string;
    setInputValue: (val: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
    confirmText?: string;
    placeholder?: string;
}

const TextInputModal: React.FC<TextInputModalProps> = ({
    title,
    inputValue,
    setInputValue,
    onCancel,
    onConfirm,
    confirmText = "Xác nhận",
    placeholder = "",
}) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[300px]">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:text-white"
                    autoFocus
                    placeholder={placeholder}
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TextInputModal;
