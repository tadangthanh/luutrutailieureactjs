import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface UserDropdownProps {
    emails: string[]; // danh sách tất cả email
    onSelect: (email: string) => void;
}

const MAX_VISIBLE = 5;

const UserDropdown: React.FC<UserDropdownProps> = ({ emails, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState("");
    const [filteredEmails, setFilteredEmails] = useState<string[]>(emails);
    const [visibleCount, setVisibleCount] = useState(MAX_VISIBLE);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const filtered = filter.trim() === ""
            ? emails
            : emails.filter(email => email.toLowerCase().includes(filter.toLowerCase()));
        setFilteredEmails(filtered);
        setVisibleCount(MAX_VISIBLE); // reset khi filter đổi
    }, [filter, emails]);

    const handleClickOutside = (event: MouseEvent) => {
        if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const visibleEmails = filteredEmails.slice(0, visibleCount);
    const canLoadMore = visibleCount < filteredEmails.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                Người <ChevronDown size={16} />
            </button>

            {isOpen && (
                <div className="absolute bg-white dark:bg-neutral-dark border dark:border-gray-700 rounded shadow-md w-64 z-50 p-2">
                    <input
                        type="text"
                        placeholder="Tìm email..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full px-3 py-2 mb-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <ul className="max-h-60 overflow-y-auto">
                        {visibleEmails.length > 0 ? (
                            visibleEmails.map((email) => (
                                <li
                                    key={email}
                                    onClick={() => {
                                        onSelect(email);
                                        setIsOpen(false);
                                        setFilter("");
                                    }}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                >
                                    {email}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                Không tìm thấy email
                            </li>
                        )}
                    </ul>

                    {canLoadMore && (
                        <div className="mt-1 text-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + MAX_VISIBLE)}
                                className="text-primary hover:underline text-sm"
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
