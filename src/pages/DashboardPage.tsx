import { useState } from "react";
import FolderCard from "../components/FolderCard";
import FileCard from "../components/FileCard";
import { MoreHorizontal, LayoutGrid, List, Search } from "lucide-react";
import { DashboardDropdown } from "../components/DashboarDropdown";
import ListRow from "../components/ListRow";

const DashboardPage = () => {
    const [layout, setLayout] = useState<"grid" | "list">("list");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const layoutClass =
        layout === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            : "flex flex-col";

    return (
        <div className="relative">
            {/* Layout toggle */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    {/* Bộ lọc dropdown */}
                    <div className="flex flex-wrap gap-2 items-center text-sm text-gray-800 dark:text-gray-200">
                        <DashboardDropdown
                            id={1}
                            label="Loại"
                            options={["Tất cả", "Tài liệu", "Thư mục"]}
                            isOpen={openDropdownId === 1}
                            setOpenId={setOpenDropdownId}
                        />
                        <DashboardDropdown
                            label="Người"
                            options={["Tôi", "Người khác chia sẻ"]}
                            isOpen={openDropdownId === 2}
                            setOpenId={setOpenDropdownId}
                            id={2}
                        />
                        <DashboardDropdown
                            label="Sửa đổi"
                            options={["Gần đây", "Tuần này", "Tháng này"]}
                            isOpen={openDropdownId === 3}
                            setOpenId={setOpenDropdownId}
                            id={3}
                        />
                    </div>

                    {/* Tìm kiếm + nút chuyển layout */}
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
                                className={`p-2 rounded transition-colors duration-200
                    ${layout === "grid"
                                        ? "bg-primary-light text-primary-dark"
                                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setLayout("list")}
                                className={`p-2 rounded transition-colors duration-200
                    ${layout === "list"
                                        ? "bg-primary-light text-primary-dark"
                                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Folder & Files */}
            {layout === "list" ? (
                <div className="w-full border border-gray-200 dark:border-gray-700 rounded-md ">
                    <div
                        className="grid grid-cols-5 bg-gray-100 dark:bg-gray-800 px-4 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        <div>Tên</div>
                        <div>Chủ sở hữu</div>
                        <div>Sửa đổi gần nhất</div>
                        <div>Kích cỡ</div>
                        <div className="col-span-1 flex justify-end">
                            <button
                                onClick={() => {
                                    console.log("Click more options")
                                }
                                }
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                    <ListRow
                        name="Tài liệu học"
                        type="folder"
                        rowId={1}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                    />

                    <ListRow
                        name="Dự án"
                        type="folder"
                        rowId={2}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                    />

                    <ListRow
                        name="Báo cáo.pdf"
                        type="file" size="1.2 MB"
                        rowId={3}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                    />

                    <ListRow
                        name="Thiết kế.fig"
                        type="file" size="4.8 MB"
                        rowId={4}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                    />

                    <ListRow
                        name="Ghi chú.txt"
                        type="file" size="352 KB"
                        rowId={5}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                    />

                </div>
            ) : (
                <div className={`${layoutClass} gap-4`}>
                    <FolderCard name="Tài liệu học" layout={layout} />
                    <FolderCard name="Dự án" layout={layout} />
                    <FileCard name="Báo cáo.pdf" layout={layout} />
                    <FileCard name="Thiết kế.fig" layout={layout} />
                    <FileCard name="Ghi chú.txt" layout={layout} />

                </div>
            )}

        </div>
    );
};

export default DashboardPage;
