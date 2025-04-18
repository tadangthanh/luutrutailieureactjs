import FolderCard from "../components/FolderCard";
import FileCard from "../components/FileCard";

const DashboardPage = () => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <FolderCard name="Tài liệu học" />
            <FolderCard name="Dự án" />
            <FileCard name="Báo cáo.pdf" />
            <FileCard name="Thiết kế.fig" />
            <FileCard name="Ghi chú.txt" />
        </div>
    );
};

export default DashboardPage;