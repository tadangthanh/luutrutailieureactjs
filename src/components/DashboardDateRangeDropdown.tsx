import { Check, ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface DashboardDateRangeDropdownProps {
    id: number;
    label: string;
    options: Map<string, Date | null>;
    isOpen: boolean;
    setOpenId: (id: number | null) => void;
    onChange(fromDate: Date | null, toDate?: Date | null): void;
}

export const DashboardDateRangeDropdown: React.FC<DashboardDateRangeDropdownProps> = ({
    id,
    label,
    onChange,
    options,
    isOpen,
    setOpenId,
}) => {
    const [selectedKey, setSelectedKey] = useState<string>("Tất cả");
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSelect = (key: string) => {
        setSelectedKey(key);
        if (key === "Ngày tùy chỉnh") return;

        const value = options.get(key) || null;
        onChange(value, new Date()); // toDate mặc định là hôm nay
        setOpenId(null);
    };

    const handleToggle = () => {
        setOpenId(isOpen ? null : id);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setOpenId(null);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const displayLabel = selectedKey === "Tất cả" ? label : selectedKey;

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={handleToggle}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200 transition-all duration-200 shadow-sm"
            >
                {displayLabel} <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg w-72 z-50 overflow-hidden">
                    <ul>
                        {Array.from(options.entries()).map(([key]) => (
                            <li
                                key={key}
                                onClick={() => handleSelect(key)}
                                className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex justify-between items-center text-gray-700 dark:text-gray-200 transition-colors duration-200"
                            >
                                <span className="text-sm">{key}</span>
                                {selectedKey === key && <Check size={16} className="text-blue-500" />}
                            </li>
                        ))}
                    </ul>

                    {selectedKey === "Ngày tùy chỉnh" && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                            <div>
                                <label className="block mb-2 text-sm text-gray-700 dark:text-gray-200">Từ ngày</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm text-gray-700 dark:text-gray-200">Đến ngày</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <button
                                disabled={!customStartDate || !customEndDate}
                                onClick={() => {
                                    const from = new Date(customStartDate);
                                    const to = new Date(customEndDate);
                                    onChange(from, to);
                                    setOpenId(null);
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                            >
                                Áp dụng
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
