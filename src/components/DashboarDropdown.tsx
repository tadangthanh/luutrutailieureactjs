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
                className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                {displayLabel} <ChevronDown size={16} />
            </button>

            {isOpen && (
                <ul className="absolute bg-white dark:bg-neutral-dark border dark:border-gray-700 rounded shadow-md w-40 z-50">
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
            )}
        </div>
    );
};
