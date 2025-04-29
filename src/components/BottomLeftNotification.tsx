import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BottomLeftNotificationProps {
    message: string;
    onCancel: () => void;
}

const BottomLeftNotification: React.FC<BottomLeftNotificationProps> = ({
    message,
    onCancel,
}) => {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-md rounded-lg px-4 py-3 flex items-center space-x-4"
                    initial={{ opacity: 0, y: 20 }} // initial state when appearing
                    animate={{ opacity: 1, y: 0 }} // final state when appearing
                    exit={{ opacity: 0, y: 20 }} // final state when disappearing
                    transition={{ duration: 0.3 }} // duration of the animation
                >
                    <span className="text-sm text-gray-800 dark:text-gray-100 flex-1">
                        {message}
                    </span>

                    <button
                        onClick={() => {
                            onCancel();
                            setVisible(false);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={() => setVisible(false)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <X size={16} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BottomLeftNotification;
