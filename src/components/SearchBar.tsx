import { Search, FileText, Folder, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {  searchDocuments } from "../services/DocumentApi";
import { useNavigate } from "react-router-dom";
import { ItemIndexResponse } from "../types/ItemIndexResponse";
import { ItemIndex } from "../types/ItemIndex";

interface SearchBarProps {
    placeholder?: string;
    className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Tìm kiếm tài liệu...",
    className = "w-full md:w-72"
}) => {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<ItemIndexResponse[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchResultsRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [isSearchResultsVisible, setIsSearchResultsVisible] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(searchInput.trim());
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (!debouncedKeyword) return;

        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const res = await searchDocuments(debouncedKeyword);
                if (res.status === 200) {
                    setSearchResults(res.data);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error("Lỗi tìm kiếm tài liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [debouncedKeyword]);

    const handleItemClick = (item: ItemIndex) => {
        if (item.itemType === "DOCUMENT") {
            window.open(`/editor?docId=${item.itemId}`, '_blank');
            setIsSearchResultsVisible(false);
            setSearchInput("");
            setDebouncedKeyword("");
        } else if (item.itemType === "FOLDER") {
            navigate(`/folders/${item.itemId}`);
            setIsSearchResultsVisible(false);
            setSearchInput("");
            setDebouncedKeyword("");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchInputRef.current && !searchInputRef.current.contains(event.target as Node) &&
                searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)
            ) {
                setIsSearchResultsVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={`relative ${className}`}>
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-gray-400">
                <Search size={18} />
            </span>
            <input
                onFocus={() => setIsSearchResultsVisible(true)}
                ref={searchInputRef}
                type="text"
                placeholder={placeholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />
            {searchInput && (
                <button
                    onClick={() => {
                        setSearchInput("");
                        setDebouncedKeyword("");
                        setIsSearchResultsVisible(false);
                    }}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X size={16} />
                </button>
            )}

            {debouncedKeyword && isSearchResultsVisible && searchResults.length > 0 && (
                <div ref={searchResultsRef} className="absolute z-50 left-0 mt-2 w-[50vw] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-80 overflow-auto custom-scrollbar">
                    {searchResults.map((result, index) => (
                        <button
                            key={index}
                            onClick={() => handleItemClick(result.item)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                            <div className="flex items-center gap-2">
                                {result.item?.itemType === 'FOLDER' ? (
                                    <Folder className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <FileText className="w-5 h-5 text-blue-500" />
                                )}
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                                        {result.item.itemType === "DOCUMENT" && (result.item?.name || "Không có tên")}
                                    </div>
                                    {result.highlights &&
                                        Object.entries(result.highlights).map(([field, highlights]) => (
                                            <div key={field} className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {highlights.map((text: string, idx: number) => (
                                                    <span key={idx} dangerouslySetInnerHTML={{ __html: text }} className="block" />
                                                ))}
                                            </div>
                                        ))}
                                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                        {result.item?.createdBy || "Không xác định"}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {loading && searchInput && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-6 h-6">
                    <div className="spinner-border animate-spin inline-block w-6 h-6 border-4 border-solid border-blue-500 border-t-transparent rounded-full" role="status">
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar; 