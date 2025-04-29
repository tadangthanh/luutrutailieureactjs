import { motion } from "framer-motion";
import { ItemResponse } from "../types/ItemResponse";
import ListRow from "./ListRow";
import { MoreHorizontal } from "lucide-react";

interface DashboardListViewProps {
    openMenuId: number | null;
    setOpenMenuId: (id: number | null) => void;
    items: ItemResponse[];
    handleOpen(id: number): void;
    handleRename(id: number): void;
    handleDownload(id: number): void;
    handleShare(id: number): void;
    handleInfo(id: number): void;
    handleCopy(id: number): void;
    handleMoveToTrash(id: number): void;
    onClick: (item: ItemResponse) => void;
}

const DashboardListView: React.FC<DashboardListViewProps> = ({
    openMenuId,
    setOpenMenuId,
    items,
    handleOpen,
    handleRename,
    handleDownload,
    handleShare,
    handleInfo,
    handleCopy,
    handleMoveToTrash,
    onClick
}) => {
    return (
        <div className="w-full border border-gray-200 dark:border-gray-700 rounded-md overflow-visible">
            <div className="grid grid-cols-6 bg-gray-100 dark:bg-gray-800 px-4 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
                <div className="col-span-2">Tên</div>
                <div>Chủ sở hữu</div>
                <div>Sửa đổi gần nhất</div>
                <div>Kích cỡ</div>
                <div className="col-span-1 flex justify-end">
                    <button
                        onClick={() => console.log("Click more options")}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {items.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                    <ListRow
                        onClick={onClick}
                        item={item}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        handleCopy={handleCopy}
                        handleDownload={handleDownload}
                        handleInfo={handleInfo}
                        handleMoveToTrash={handleMoveToTrash}
                        handleOpen={handleOpen}
                        handleRename={handleRename}
                        handleShare={handleShare}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default DashboardListView;
