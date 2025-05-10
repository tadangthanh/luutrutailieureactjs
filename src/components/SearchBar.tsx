import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getOnlyOfficeConfig, searchDocuments } from "../services/DocumentApi";
import { OnlyOfficeConfig } from "../types/OnlyOfficeConfig";
import { useNavigate } from "react-router-dom";

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
    const [searchResults, setSearchResults] = useState<any[]>([]);
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

    const handleSelectDocument = (documentId: number) => {
        getOnlyOfficeConfig(documentId)
            .then((response) => {
                if (response.status === 200) {
                    const config: OnlyOfficeConfig = response.data;
                    const editorUrl = `/editor?config=${encodeURIComponent(JSON.stringify(config))}`;
                    window.open(editorUrl, '_blank');
                } else {
                    toast.error(response.message);
                    navigate("/");
                }
            }).catch((error) => {
                console.error("Lỗi khi lấy cấu hình OnlyOffice:", error);
                toast.error("Lỗi khi lấy cấu hình tài liệu.");
                navigate("/");
            })
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />

            {debouncedKeyword && isSearchResultsVisible && searchResults.length > 0 && (
                <div ref={searchResultsRef} className="absolute z-50 left-0 mt-2 w-[50vw] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-80 overflow-auto custom-scrollbar">
                    {searchResults.map((result, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectDocument(result.document?.id || 0)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                                {result.document?.name || "Không có tên"}
                            </div>
                            {result.highlights &&
                                Object.entries(result.highlights as Record<string, string[]>).map(([field, highlights]) => (
                                    <div key={field} className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {highlights.map((text, idx) => (
                                            <span key={idx} dangerouslySetInnerHTML={{ __html: text }} className="block" />
                                        ))}
                                    </div>
                                ))}
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