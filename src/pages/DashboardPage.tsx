import { useEffect, useState } from "react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import DashboardListView from "../components/DashboardListView";
import DashboardGridView from "../components/DashboardGridView";
import { PageResponse } from "../types/PageResponse";
import { toast } from "sonner";
import FullScreenLoader from "../components/FullScreenLoader";
import { ItemResponse } from "../types/ItemResponse";
import { getItems } from "../services/ItemApi";

const DashboardPage = () => {
    const [layout, setLayout] = useState<"grid" | "list">("list");
    const [isLoading, setIsLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [pageNo, setPageNo] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(1);
    const [items, setItems] = useState<string[]>([]);
    const [itemPage, setItemPage] = useState<PageResponse<ItemResponse>>({
        pageNo: 0,
        pageSize: 10,
        totalPage: 0,
        hasNext: false,
        totalItems: 0,
        items: [],
    });

    const handleLoadMore = () => {
        if (itemPage.hasNext) {
            setPageNo(prev => prev + 1); // Tăng pageNo khi nhấn "Xem thêm"
        }
    };

    useEffect(() => {
        setIsLoading(true);
        getItems(pageNo, pageSize,items)
            .then((response) => {
                if (response.status === 200) {
                    const newItems = response.data.items;
                    setItemPage((prev) => ({
                        ...response.data,
                        items: [...prev.items, ...newItems],
                    }));
                } else {
                    toast.error(response.message);
                }
            })
            .catch(() => toast.error("Lỗi khi lấy dữ liệu"))
            .finally(() => setIsLoading(false));
    }, [pageNo, pageSize,items]);
    useEffect(() => {
        setPageNo(0);
        setItemPage({
            pageNo: 0,
            pageSize: 10,
            totalPage: 0,
            hasNext: false,
            totalItems: 0,
            items: [],
        });
    }, [items]);
    const handleFilter = (type: string) => {
        setPageNo(0);
        if (type === "ALL") {
            setItems([]);
            return;
        }
        setItems([`itemType:${type}`]);
    }
    return (
        <div className="relative">
            {isLoading && <FullScreenLoader />}
            <DashboardFilterBar
                onChangeType={handleFilter}
                layout={layout}
                setLayout={setLayout}
                openDropdownId={openDropdownId}
                setOpenDropdownId={setOpenDropdownId}
            />

            {layout === "list" ? (
                <DashboardListView
                    items={itemPage.items}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                />
            ) : (
                <DashboardGridView
                    items={itemPage.items}
                    layout={layout}
                />
            )}
            {itemPage.hasNext && (
                <div className="bottom-4 left-4">
                    <button
                        onClick={handleLoadMore}
                        className="text-primary hover:underline hover:cursor-pointer font-medium"
                    >
                        Xem thêm
                    </button>
                </div>
            )}

        </div>
    );
};

export default DashboardPage;
