import { Folder, FolderPlus, Upload } from "lucide-react";

import { Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useItemContext } from "../contexts/ItemContext";

const AddButton = () => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { openCreateFolderModal, triggerFileUpload, triggerFolderUpload } = useItemContext();
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-white font-medium shadow-md hover:shadow-lg hover:bg-primary-dark transition-all duration-200"
            >
                <Plus size={18} className="text-white" />
                <span className="text-sm">Tạo mới</span>
            </button>

            {open && (
                <div className="absolute left-0 mt-3 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                    <button
                        onClick={() => {
                            openCreateFolderModal();
                            setOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                        <Folder size={18} className="text-yellow-500" />
                        Tạo thư mục
                    </button>
                    <button
                        onClick={() => {
                            triggerFileUpload();
                            setOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                        <Upload size={18} className="text-blue-500" />
                        Tải tài liệu lên
                    </button>
                    <button
                        onClick={() => {
                            triggerFolderUpload();
                            setOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                        <FolderPlus size={18} className="text-blue-500" />
                        Tải thư mục lên
                    </button>
                </div>
            )}
        </div>
    );
};


export default AddButton;
