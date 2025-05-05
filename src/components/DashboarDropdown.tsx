import { Check, ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface DashboardDropdownProps {
    id: number;
    label: string;
    options: Map<string, any>;
    isOpen: boolean;
    setOpenId: (id: number | null) => void;
    onChange(value: any): void;
}

export const DashboardDropdown: React.FC<DashboardDropdownProps> = ({
    id,
    label,
    onChange,
    options,
    isOpen,
    setOpenId,
}) => {
    const [selectedKey, setSelectedKey] = useState<string>("all");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSelect = (key: string) => {
        setSelectedKey(key);
        onChange(options.get(key) || "");
        setOpenId(null);
    };

    const handleToggle = () => {
        setOpenId(isOpen ? null : id);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, setOpenId]);

    const displayLabel = selectedKey === "all" ? label : selectedKey;

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={handleToggle}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200 transition-all duration-200 shadow-sm"
            >
                {displayLabel} <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
            </button>

            {isOpen && (
                <ul className="absolute mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg w-48 z-50 overflow-hidden">
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
            )}
        </div>
    );
};
