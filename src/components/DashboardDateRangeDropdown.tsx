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
                className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                {displayLabel} <ChevronDown size={16} />
            </button>

            {isOpen && (
                <div className="absolute bg-white dark:bg-neutral-dark border dark:border-gray-700 rounded shadow-md w-60 z-50">
                    <ul>
                        {Array.from(options.entries()).map(([key]) => (
                            <li
                                key={key}
                                onClick={() => handleSelect(key)}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                            >
                                <span>{key}</span>
                                {selectedKey === key && <Check size={16} className="text-blue-500" />}
                            </li>
                        ))}
                    </ul>

                    {selectedKey === "Ngày tùy chỉnh" && (
                        <div className="p-3 border-t dark:border-gray-600 space-y-2 text-sm">
                            <div>
                                <label className="block mb-1">Từ ngày</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full border p-1 rounded dark:bg-neutral-dark dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Đến ngày</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full border p-1 rounded dark:bg-neutral-dark dark:text-white"
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
                                className="w-full bg-primary-light text-white rounded py-1 mt-1 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
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
