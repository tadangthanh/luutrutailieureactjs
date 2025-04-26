import { LayoutGrid, List, Search } from "lucide-react";
import { DashboardDropdown } from "./DashboarDropdown";
import { on } from "events";
import { useEffect, useState } from "react";
import { m } from "framer-motion";
import UserDropdown from "./UserDropdown";
import { getEmailsShared } from "../services/ItemApi";
import { PageResponse } from "../types/PageResponse";
import { toast } from "sonner";

interface DashboardFilterBarProps {
    layout: "grid" | "list";
    setLayout: (layout: "grid" | "list") => void;
    openDropdownId: number | null;
    setItems: React.Dispatch<React.SetStateAction<string[]>>;
    setOpenDropdownId: (id: number | null) => void;
}

const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
    layout,
    setItems,
    setLayout,
    openDropdownId,
    setOpenDropdownId,
}) => {
    const [typeOptions, setTypeOptions] = useState(new Map());
    useEffect(() => {
        setTypeOptions(() => {
            const map = new Map<string, string>();
            map.set("Tất cả", "ALL");
            map.set("Tài liệu", "DOCUMENT");
            map.set("Thư mục", "FOLDER");
            return map;
        });
    }, [])
    const [pageNoEmail, setPageNoEmail] = useState<number>(0);
    const [emailPage, setEmailPage] = useState<PageResponse<string>>({
        pageNo: 0,
        pageSize: 10,
        totalPage: 0,
        hasNext: false,
        totalItems: 0,
        items: [],
    })
    const [keyword, setKeyword] = useState<string>("");
    useEffect(() => {
        getEmailsShared(pageNoEmail, 10, keyword).then((response) => {
            if (response.status === 200) {
                setEmailPage((prev) => {
                    const existingEmails = new Set(prev.items);
                    const newItems = response.data.items.filter((email: string) => !existingEmails.has(email));

                    return {
                        ...response.data,
                        items: [...prev.items, ...newItems],
                    };
                });

            } else {
                toast.error(response.message);
            }
        })
    }, [pageNoEmail, keyword])
    const handleOnSearchEmail = (keyword: string) => {
        setKeyword(keyword);
    }
    const handleSelectEmail = (email: string) => {
        console.log(email);
        const fieldSearch = `createdBy~${email}`;

        setItems((prev: string[]) => {
            // Nếu đã có một `createdBy~email` thì giữ lại giá trị mới, loại bỏ tất cả các giá trị `createdBy~`
            const filteredItems = prev.filter(item => !item.startsWith("createdBy~"));

            // Thêm giá trị mới vào
            return [...filteredItems, fieldSearch];
        });
    };
    const handleOnChangeType = (type: string) => {
        setItems((prev: string[]) => {
            // Nếu type là "ALL", loại bỏ phần tử "itemType" trong mảng (nếu có)
            if (type === "ALL") {
                return prev.filter(item => !item.startsWith("itemType:"));
            }
            // Nếu có "itemType" trong mảng, thay thế phần tử cũ, nếu không có thì thêm mới
            const filteredItems = prev.filter(item => !item.startsWith("itemType:"));

            return [...filteredItems, `itemType:${type}`];
        });
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2 items-center text-sm text-gray-800 dark:text-gray-200">
                <DashboardDropdown
                    id={1}
                    label="Loại"
                    onChange={handleOnChangeType}
                    options={typeOptions}
                    isOpen={openDropdownId === 1}
                    setOpenId={setOpenDropdownId}
                />
                <UserDropdown
                    setPageNoEmail={setPageNoEmail}
                    onSearch={handleOnSearchEmail}
                    emailPage={emailPage}
                    onSelect={handleSelectEmail}
                />
                <DashboardDropdown
                    id={3}
                    onChange={handleOnChangeType}
                    label="Sửa đổi"
                    options={typeOptions}
                    isOpen={openDropdownId === 3}
                    setOpenId={setOpenDropdownId}
                />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-gray-400">
                        <Search size={16} />
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài liệu..."
                        className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-dark text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={() => setLayout("grid")}
                        className={`p-2 rounded transition-colors duration-200 ${layout === "grid"
                            ? "bg-primary-light text-primary-dark"
                            : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setLayout("list")}
                        className={`p-2 rounded transition-colors duration-200 ${layout === "list"
                            ? "bg-primary-light text-primary-dark"
                            : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardFilterBar;
