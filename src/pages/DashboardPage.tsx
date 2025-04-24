import { useEffect, useState } from "react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import DashboardListView from "../components/DashboardListView";
import DashboardGridView from "../components/DashboardGridView";
import { PageResponse } from "../types/PageResponse";
import { FolderResponse } from "../types/FolderResponse";
import { getFolderPage } from "../services/FolderApi";
import { toast } from "sonner";
import FullScreenLoader from "../components/FullScreenLoader";
import { DocumentResponse } from "../types/DocumentResponse";
import { getDocumentPage } from "../services/DocumentApi";

const DashboardPage = () => {
    const [layout, setLayout] = useState<"grid" | "list">("list");
    const [isLoading, setIsLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [pageNo, setPageNo] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [folderPageResponse, setFolderPageResponse] = useState<PageResponse<FolderResponse>>({
        pageNo: 0,
        pageSize: 10,
        totalPage: 0,
        hasNext: false,
        totalItems: 0,
        items: [],
    });
    const [documentPageResponse, setDocumentPageResponse] = useState<PageResponse<DocumentResponse>>({
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
            getFolderPage(pageNo, pageSize, []).then((response) => {
                if (response.status === 200) {
                    setFolderPageResponse(response.data);
                } else {
                    toast.error(response.message);
                }
            })
            getDocumentPage(pageNo, pageSize, []).then((response) => {
                if (response.status === 200) {
                    setDocumentPageResponse(response.data);
                } else {
                    toast.error(response.message);
                }
            })
        } catch (error) {
            toast.error("Failed to fetch folder");
        } finally {
            setIsLoading(false);
        }
    }, [pageNo, pageSize]);

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
                    documents={documentPageResponse.items}
                    openMenuId={openMenuId}
                    folders={folderPageResponse.items}
                    setOpenMenuId={setOpenMenuId}
                />
            ) : (
                <DashboardGridView
                    documents={documentPageResponse.items}
                    layout={layout}
                    folders={folderPageResponse.items}
                />
            )}
        </div>
    );
};

export default DashboardPage;
