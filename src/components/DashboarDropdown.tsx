import { ChevronDown } from "lucide-react";
import React from "react";

interface DashboardDropdownProps {
    id: number;
    label: string;
    options: string[];
    isOpen: boolean;
    setOpenId: (id: number | null) => void;
}

export const DashboardDropdown: React.FC<DashboardDropdownProps> = ({
    id,
    label,
    options,
    isOpen,
    setOpenId,
}) => {
    const [selectedOption, setSelectedOption] = React.useState<string>(label);

    const handleSelect = (option: string) => {
        setSelectedOption(option);
        setOpenId(null);
    };

    const handleToggle = () => {
        setOpenId(isOpen ? null : id);
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                {selectedOption} <ChevronDown size={16} />
            </button>

            {isOpen && (
                <ul className="absolute bg-white dark:bg-neutral-dark border dark:border-gray-700 rounded shadow-md w-40 z-50">
                    {options.map((opt, idx) => (
                        <li
                            key={idx}
                            onClick={() => handleSelect(opt)}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
