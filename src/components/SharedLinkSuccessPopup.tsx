import React from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { SharedLinkResponse } from '../types/SharedLinkResponse';
import { AnimatePresence, motion } from 'framer-motion';

interface SharedLinkSuccessPopupProps {
    link: SharedLinkResponse;
    onCopy: () => void;
    onClose: () => void;
}

const SharedLinkSuccessPopup: React.FC<SharedLinkSuccessPopupProps> = ({ link, onCopy, onClose }) => {
    const shareUrl = `${window.location.origin}/shared/${link.accessToken}`;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <CheckCircle2 className="text-green-500" size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Link chia sẻ đã được tạo
                            </h3>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">
                                    {shareUrl}
                                </p>
                                <button
                                    onClick={onCopy}
                                    className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SharedLinkSuccessPopup; 