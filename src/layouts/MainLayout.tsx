import { ReactNode, useState, useCallback, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { toast } from "react-toastify";
import api from "../utils/api";

const MainLayout = ({ children }: { children: ReactNode }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer?.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        try {
            const res = await api.post(`/documents`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(res.data);
        } catch (err) {
            toast.error("Tải tệp thất bại.");
            console.error(err);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("dragleave", handleDragLeave);
        window.addEventListener("drop", handleDrop);

        return () => {
            window.removeEventListener("dragover", handleDragOver);
            window.removeEventListener("dragleave", handleDragLeave);
            window.removeEventListener("drop", handleDrop);
        };
    }, [handleDragOver, handleDragLeave, handleDrop]);

    return (
        <div className="flex h-screen relative">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 relative">
                    {children}
                    {isDragging && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center pointer-events-none">
                            <div className="text-white text-2xl font-bold border-4 border-dashed p-10 rounded-lg">
                                Thả tệp vào đây để tải lên
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
