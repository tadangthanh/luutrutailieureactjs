import { ResourceResponse } from "../types/ResourceResponse";
import FileCard from "./FileCard";
import FolderCard from "./FolderCard";

interface DashboardGridViewProps {
    layout: "grid" | "list";
    folders: ResourceResponse[]
}

const DashboardGridView: React.FC<DashboardGridViewProps> = ({ layout ,folders}) => {
    const layoutClass =
        layout === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            : "flex flex-col";

    return (
        <div className={`${layoutClass} gap-4`}>
           {folders.map((folder) => (
                <FolderCard
                    key={folder.id}
                    folder={folder}
                    layout={layout}
                    onActionClick={() => console.log(`Action for ${folder.name}`)}
                />
           ))}
            {/* <FolderCard name="Dự án" layout={layout} /> */}
            {/* <FileCard name="Báo cáo.pdf" layout={layout} />
            <FileCard name="Thiết kế.fig" layout={layout} />
            <FileCard name="Ghi chú.txt" layout={layout} /> */}
        </div>
    );
};

export default DashboardGridView;
