interface OptionProps {
    label: string;
    icon: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
}
export const Option: React.FC<OptionProps> = ({ label, icon, onClick }) => {
    return (
        <li
            key={label}
            onClick={onClick}
            className="flex items-center px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
        >
            {icon}
            <span className="ml-2">{label}</span>
        </li>
    )
}
