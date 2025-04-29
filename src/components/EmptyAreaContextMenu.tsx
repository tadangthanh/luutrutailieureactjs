import { motion, AnimatePresence } from "framer-motion";

interface EmptyAreaContextMenuProps {
    x: number;
    y: number;
    onSelect: (action: string) => void;
}

export const EmptyAreaContextMenu: React.FC<EmptyAreaContextMenuProps> = ({ x, y, onSelect }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="fixed w-56 bg-white dark:bg-gray-800 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
                style={{ top: y, left: x }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
            >
                <ul className="text-sm text-gray-800 dark:text-gray-200">
                    <li
                        onClick={() => onSelect("newFolder")}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                        📁 Tạo thư mục
                    </li>
                    <li
                        onClick={() => onSelect("uploadFile")}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                        📄 Tải lên tệp
                    </li>
                </ul>
            </motion.div>
        </AnimatePresence>
    );
};
