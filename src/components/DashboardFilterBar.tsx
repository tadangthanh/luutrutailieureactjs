import { LayoutGrid, List, Search } from "lucide-react";
import { DashboardDropdown } from "./DashboarDropdown";
import { useEffect, useState } from "react";
import UserDropdown from "./UserDropdown";
import { getEmailsShared } from "../services/ItemApi";
import { PageResponse } from "../types/PageResponse";
import { toast } from "sonner";
import { DashboardDateRangeDropdown } from "./DashboardDateRangeDropdown";
import { searchDocuments } from "../services/DocumentApi";
import OnlyOfficeEditor from "./OnlyOfficeEditor";
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
    const [searchInput, setSearchInput] = useState(""); // state cho input ngay lập tức
    const [debouncedKeyword, setDebouncedKeyword] = useState(""); // state cho keyword đã debounce
    const [typeOptions, setTypeOptions] = useState(new Map());
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
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
            map.set("Ngày tùy chỉnh", null); // 🔥 Thêm dòng này để hiện option
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

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(searchInput.trim());
        }, 500); // debounce 500ms

        return () => clearTimeout(timer); // clear nếu user tiếp tục gõ
    }, [searchInput]);
    useEffect(() => {
        if (!debouncedKeyword) return;

        const fetchSearchResults = async () => {
            try {
                const res = await searchDocuments(debouncedKeyword); // bạn tự viết service này
                if (res.status === 200) {
                    setSearchResults(res.data); // gán kết quả vào state
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("Lỗi tìm kiếm tài liệu");
            }
        };

        fetchSearchResults();
    }, [debouncedKeyword]);
    const handleSelectDocument = (documentId: number) => {
        // Mở tài liệu trong tab mới bằng URL tương ứng
        window.open(`http://localhost:3000/editor/${documentId}`, "_blank");
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
                <DashboardDateRangeDropdown
                    id={3}
                    onChange={handleChangeUpdateAt}
                    label="Sửa đổi gần đây"
                    options={updateAtOptions}
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
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-dark text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />

                    {debouncedKeyword && searchResults.length > 0 && (
                        <div className="absolute z-50 right-0 mt-1 w-[50vw] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-64 overflow-auto">
                            {searchResults.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectDocument(result.document?.id || 0)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="text-sm font-medium text-primary-dark truncate">
                                        {result.document?.name || "Không có tên"}
                                    </div>
                                    {result.highlights &&
                                        Object.entries(result.highlights as Record<string, string[]>).map(([field, highlights]) => (
                                            <div key={field} className="text-xs text-gray-500 dark:text-gray-400">
                                                {highlights.map((text, idx) => (
                                                    <span
                                                        key={idx}
                                                        dangerouslySetInnerHTML={{ __html: text }}
                                                        className="block"
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                </button>
                            ))}
                        </div>
                    )}
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
