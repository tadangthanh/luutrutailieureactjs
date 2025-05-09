import { ItemResponse } from "../types/ItemResponse";
import FileCard from "./FileCard";
import FolderCard from "./FolderCard";
import { motion } from "framer-motion";

interface DashboardGridViewProps {
    layout: "grid" | "list";
    items: ItemResponse[];
}

const DashboardGridView: React.FC<DashboardGridViewProps> = ({ layout, items }) => {
    const layoutClass =
        layout === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            : "flex flex-col";

    return (
        <div className={`${layoutClass} gap-4`} >
            {items.length === 0 && (
                <div className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-400">
                    <p className="text-lg">Không có tài liệu nào</p>
                </div>
            )}
            {items.map((item, index) => {
                const delay = index * 0.03;

                const MotionCard = (
                    item.itemType === "FOLDER" ? (
                        <FolderCard
                            key={item.id}
                            folder={item}
                            layout={layout}
                        />
                    ) : (
                        <FileCard
                            key={item.id}
                            doc={item}
                            layout={layout}
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
