import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PageResponse } from "../types/PageResponse";

interface UserDropdownProps {
    emailPage: PageResponse<string>
    onSelect: (email: string) => void;
    setPageNoEmail: React.Dispatch<React.SetStateAction<number>>;
    onSearch(keyword: string): void;
}

const MAX_VISIBLE = 5;

const UserDropdown: React.FC<UserDropdownProps> = ({ emailPage, setPageNoEmail: setPageEmail, onSelect, onSearch }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState("");
    const [filteredEmails, setFilteredEmails] = useState<string[]>(emailPage.items);
    const [visibleCount, setVisibleCount] = useState(MAX_VISIBLE);
    const [selectedEmail, setSelectedEmail] = useState<string>(""); // Lưu trữ email đã chọn
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const filtered = filter.trim() === ""
            ? emailPage.items
            : emailPage.items.filter(email => email.toLowerCase().includes(filter.toLowerCase()));
        setFilteredEmails(filtered);
        setVisibleCount(MAX_VISIBLE); // reset khi filter đổi
    }, [filter, emailPage.items]);

    const handleClickOutside = (event: MouseEvent) => {
        if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelectEmail = (email: string) => {
        setSelectedEmail(email);
        onSelect(email);
        setIsOpen(false);
        setFilter(""); // Xóa filter khi chọn email
    };

    const visibleEmails = filteredEmails.slice(0, visibleCount);
    const canLoadMore = visibleCount < filteredEmails.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200 transition-all duration-200 shadow-sm"
            >
                {selectedEmail || "Người"} <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg w-72 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                        <input
                            type="text"
                            placeholder="Tìm email..."
                            value={filter}
                            onChange={(e) => {
                                setFilter(e.target.value);
                                if (e.target.value.trim() === "") {
                                    onSearch(filter.trim());
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    onSearch(filter.trim());
                                }
                            }}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                        <li
                            onClick={() => {
                                setSelectedEmail("");
                                onSelect("");
                                setIsOpen(false);
                                setFilter("");
                            }}
                            className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200"
                        >
                            Tất cả
                        </li>
                        {visibleEmails.length > 0 ? (
                            visibleEmails.map((email) => (
                                <li
                                    key={email}
                                    onClick={() => handleSelectEmail(email)}
                                    className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200"
                                >
                                    {email}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                                Không tìm thấy email
                            </li>
                        )}
                    </ul>

                    {emailPage.hasNext && (
                        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => setPageEmail(prev => prev + 1)}
                                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                            >
                                Xem thêm
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
