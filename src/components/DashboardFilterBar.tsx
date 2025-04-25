import { LayoutGrid, List, Search } from "lucide-react";
import { DashboardDropdown } from "./DashboarDropdown";
import { on } from "events";
import { useEffect, useState } from "react";
import { m } from "framer-motion";

interface DashboardFilterBarProps {
    layout: "grid" | "list";
    setLayout: (layout: "grid" | "list") => void;
    openDropdownId: number | null;
    onChangeType: (type: string) => void;
    setOpenDropdownId: (id: number | null) => void;
}

const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
    layout,
    setLayout,
    onChangeType,
    openDropdownId,
    setOpenDropdownId,
}) => {
    const [typeOptions, setTypeOptions] = useState(new Map());
    useEffect(() => {
        setTypeOptions(() => {
            const map = new Map<string, string>();
            map.set("Tất cả", "ALL");
            map.set("Tài liệu", "DOCUMENT");
            map.set("Thư mục", "FOLDER");
            return map;
        });
    }, [])
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2 items-center text-sm text-gray-800 dark:text-gray-200">
                <DashboardDropdown
                    id={1}
                    label="Loại"
                    onChange={onChangeType}
                    options={typeOptions}
                    isOpen={openDropdownId === 1}
                    setOpenId={setOpenDropdownId}
                />
                <DashboardDropdown
                    onChange={onChangeType}
                    id={2}
                    label="Người"
                    options={typeOptions}
                    isOpen={openDropdownId === 2}
                    setOpenId={setOpenDropdownId}
                />
                <DashboardDropdown
                    id={3}
                    onChange={onChangeType}
                    label="Sửa đổi"
                    options={typeOptions}
                    isOpen={openDropdownId === 3}
                    setOpenId={setOpenDropdownId}
                />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-gray-400">
                        <Search size={16} />
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài liệu..."
                        className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-dark text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={() => setLayout("grid")}
                        className={`p-2 rounded transition-colors duration-200 ${layout === "grid"
                            ? "bg-primary-light text-primary-dark"
                            : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setLayout("list")}
                        className={`p-2 rounded transition-colors duration-200 ${layout === "list"
                            ? "bg-primary-light text-primary-dark"
                            : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardFilterBar;
