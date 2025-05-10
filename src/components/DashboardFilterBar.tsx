import { LayoutGrid, List } from "lucide-react";
import { DashboardDropdown } from "./DashboarDropdown";
import { useEffect, useState } from "react";
import UserDropdown from "./UserDropdown";
import { getEmailsShared } from "../services/ItemApi";
import { PageResponse } from "../types/PageResponse";
import { toast } from "sonner";
import { DashboardDateRangeDropdown } from "./DashboardDateRangeDropdown";
import { useLocation } from "react-router-dom";

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
        setTypeOptions(() => {
            const map = new Map<string, string>();
            map.set("Tất cả", "ALL");
            map.set("Tài liệu", "DOCUMENT");
            map.set("Thư mục", "FOLDER");
            return map;
        });
    }, [])

    const [updateAtOptions, setUpdateAtOptions] = useState(new Map());
    useEffect(() => {
        setUpdateAtOptions(() => {
            const map = new Map<string, Date | null>();
            map.set("Tất cả", null);
            map.set("Hôm nay", new Date(Date.now() - 24 * 60 * 60 * 1000));
            map.set("7 ngày qua", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
            map.set("30 ngày qua", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
            map.set("Ngày tùy chỉnh", null);
            return map;
        });
    }, [])

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
        const fieldSearch = `createdBy~${email}`;
        setItems((prev: string[]) => {
            const filteredItems = prev.filter(item => !item.startsWith("createdBy~"));
            return [...filteredItems, fieldSearch];
        });
    };

    const handleOnChangeType = (type: string) => {
        setItems((prev: string[]) => {
            if (type === "ALL") {
                return prev.filter(item => !item.startsWith("itemType:"));
            }
            const filteredItems = prev.filter(item => !item.startsWith("itemType:"));
            return [...filteredItems, `itemType:${type}`];
        });
    };

    const handleChangeUpdateAt = (fromDate: Date | null, toDate: Date | null = new Date()) => {
        setItems((prev: string[]) => {
            const filteredItems = prev.filter(item => !item.startsWith("updatedAt:"));
            if (!fromDate || !toDate) return filteredItems;

            const formatDate = (d: Date) => d.toISOString().split("T")[0];
            const from = formatDate(fromDate);
            const to = formatDate(toDate);

            return [...filteredItems, `updatedAt:${from}..${to}`];
        });
    };
    const location = useLocation();
    useEffect(() => {
        console.log("url", location.pathname);
    }, [location.pathname])
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center text-sm">
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
                <DashboardDateRangeDropdown
                    id={3}
                    onChange={handleChangeUpdateAt}
                    label="Sửa đổi gần đây"
                    options={updateAtOptions}
                    isOpen={openDropdownId === 3}
                    setOpenId={setOpenDropdownId}
                />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex gap-2">
                    <button
                        onClick={() => setLayout("grid")}
                        className={`p-2.5 rounded-xl transition-all duration-200 ${layout === "grid"
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            }`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setLayout("list")}
                        className={`p-2.5 rounded-xl transition-all duration-200 ${layout === "list"
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            }`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardFilterBar;
