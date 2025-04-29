import { ItemResponse } from "../types/ItemResponse";
import FileCard from "./FileCard";
import FolderCard from "./FolderCard";
import { motion } from "framer-motion";
interface DashboardGridViewProps {
    layout: "grid" | "list";
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

const DashboardGridView: React.FC<DashboardGridViewProps> = ({ layout, items, handleOpen,
    handleRename,
    handleDownload,
    handleShare,
    handleInfo,
    handleCopy,
    onClick,
    handleMoveToTrash }) => {
    const layoutClass =
        layout === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            : "flex flex-col";

    return (
        <div className={`${layoutClass} gap-4`} >
            {items.map((item, index) => {
                const delay = index * 0.03;

                const MotionCard = (
                    item.itemType === "FOLDER" ? (
                        <FolderCard
                            onClick={onClick}
                            key={item.id}
                            folder={item}
                            layout={layout}
                            handleDownload={handleDownload}
                            handleInfo={handleInfo}
                            handleMoveToTrash={handleMoveToTrash}
                            handleOpen={handleOpen}
                            handleRename={handleRename}
                            handleShare={handleShare}
                        />
                    ) : (
                        <FileCard
                            onClick={onClick}
                            key={item.id}
                            doc={item}
                            layout={layout}
                            handleCopy={handleCopy}
                            handleDownload={handleDownload}
                            handleInfo={handleInfo}
                            handleMoveToTrash={handleMoveToTrash}
                            handleOpen={handleOpen}
                            handleRename={handleRename}
                            handleShare={handleShare}
                        />
                    )
                );

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay }}
                    >
                        {MotionCard}
                    </motion.div>
                );
            })}


        </div>
    );
};

export default DashboardGridView;
