import { ItemResponse } from "../types/ItemResponse";
import ListRow from "./ListRow";
import { MoreHorizontal } from "lucide-react";

interface DashboardListViewProps {
    openMenuId: number | null;
    setOpenMenuId: (id: number | null) => void;
    items: ItemResponse[];
}

const DashboardListView: React.FC<DashboardListViewProps> = ({
    openMenuId,
    setOpenMenuId,
    items
}) => {

    return (
        <div className="w-full border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="grid grid-cols-5 bg-gray-100 dark:bg-gray-800 px-4 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
                <div>Tên</div>
                <div>Chủ sở hữu</div>
                <div>Sửa đổi gần nhất</div>
                <div>Kích cỡ</div>
                <div className="col-span-1 flex justify-end">
                    <button
                        onClick={() => console.log("Click more options")}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {items.map((item) => (
                <ListRow
                    key={item.id}
                    name={item.name}
                    type={item.itemType}
                    createdBy={item.createdBy}
                    updatedAt={item.updatedAt}
                    ownerEmail={item.ownerEmail}
                    rowId={item.id}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                />
            ))}
        </div>
    );
};

export default DashboardListView;
