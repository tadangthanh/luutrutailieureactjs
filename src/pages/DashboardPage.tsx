import { useEffect, useState } from "react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import DashboardListView from "../components/DashboardListView";
import DashboardGridView from "../components/DashboardGridView";
import { PageResponse } from "../types/PageResponse";
import { FolderResponse } from "../types/FolderResponse";
import { getFolderPage } from "../services/FolderApi";
import { toast } from "sonner";
import FullScreenLoader from "../components/FullScreenLoader";
import OnlyOfficeEditor from "../components/OnlyOfficeEditor";

const DashboardPage = () => {
    const [layout, setLayout] = useState<"grid" | "list">("list");
    const [isLoading, setIsLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [folderPageNo, setFolderPageNo] = useState<number>(0);
    const [folderPageSize, setFolderPageSize] = useState<number>(10);
    const [folderPageResponse, setFolderPageResponse] = useState<PageResponse<FolderResponse>>({
        pageNo: 0,
        pageSize: 10,
        totalPage: 0,
        hasNext: false,
        totalItems: 0,
        items: [],
    });

    useEffect(() => {
        setIsLoading(true);
        try {
            getFolderPage(folderPageNo, folderPageSize, []).then((response) => {
                if (response.status === 200) {
                    setFolderPageResponse(response.data);
                } else {
                    toast.error(response.message);
                }
            })
        } catch (error) {
            toast.error("Failed to fetch folder");
        } finally {
            setIsLoading(false);
        }
    }, [folderPageNo, folderPageSize]);
    const fileUrl = "https://tathanhmycv.blob.core.windows.net/luu-tru-tai-lieu/3f19387a-c017-45ac-bf91-d89e657ca14a_motadetai.docx?sp=r&st=2025-04-24T01:09:49Z&se=2025-05-10T09:09:49Z&sv=2024-11-04&sr=b&sig=rYZObMUkkiQj3VahYwLiewgt9YCIHfF43wYfgNYJskE%3D";
    // Hàm tạo chuỗi ngẫu nhiên
    const generateRandomString = (length = 10) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    return (
        <div className="relative">
            {isLoading && <FullScreenLoader />}
            <DashboardFilterBar
                layout={layout}
                setLayout={setLayout}
                openDropdownId={openDropdownId}
                setOpenDropdownId={setOpenDropdownId}
            />

            {layout === "list" ? (
                <DashboardListView
                    openMenuId={openMenuId}
                    folders={folderPageResponse.items}
                    setOpenMenuId={setOpenMenuId}
                />
            ) : (
                <DashboardGridView
                    layout={layout}
                    folders={folderPageResponse.items}
                />
            )}
            <div className="fixed inset-0 z-50 bg-white">
                <OnlyOfficeEditor
                    documentUrl={fileUrl}
                    documentKey={generateRandomString(10)}
                    documentTitle="Mo ta de tai.docx"
                    user={{ id: "user-id-abc", name: "Tạ Thành" }}
                />
            </div>
        </div>
    );
};

export default DashboardPage;
