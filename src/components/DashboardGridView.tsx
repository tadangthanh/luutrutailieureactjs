import { ItemResponse } from "../types/ItemResponse";
import FileCard from "./FileCard";
import FolderCard from "./FolderCard";

interface DashboardGridViewProps {
    layout: "grid" | "list";
    items: ItemResponse[]
}

const DashboardGridView: React.FC<DashboardGridViewProps> = ({ layout, items }) => {
    const layoutClass =
        layout === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            : "flex flex-col";

    return (
        <div className={`${layoutClass} gap-4`}>
            {items.map((item) => {
                if (item.itemType === "FOLDER") {
                    return <FolderCard
                        key={item.id}
                        folder={item}
                        layout={layout} />;
                } else {
                    return <FileCard key={item.id} doc={item} layout={layout} />;
                }
            })}

        </div>
    );
};

export default DashboardGridView;
