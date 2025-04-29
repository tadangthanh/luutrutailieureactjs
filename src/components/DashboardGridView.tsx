import { ItemResponse } from "../types/ItemResponse";
import FileCard from "./FileCard";
import FolderCard from "./FolderCard";

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
            {items.map((item) => {
                if (item.itemType === "FOLDER") {
                    return <FolderCard
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
                    />;
                } else {
                    return <FileCard
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
                    />;
                }
            })}

        </div>
    );
};

export default DashboardGridView;
