import { useState } from "react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import DashboardListView from "../components/DashboardListView";
import DashboardGridView from "../components/DashboardGridView";

const DashboardPage = () => {
    const [layout, setLayout] = useState<"grid" | "list">("list");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    return (
        <div className="relative">
            <DashboardFilterBar
                layout={layout}
                setLayout={setLayout}
                openDropdownId={openDropdownId}
                setOpenDropdownId={setOpenDropdownId}
            />

            {layout === "list" ? (
                <DashboardListView openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />
            ) : (
                <DashboardGridView layout={layout} />
            )}
        </div>
    );
};

export default DashboardPage;
