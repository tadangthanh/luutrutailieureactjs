import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Asterisk, Home, Share2, Trash2, Menu } from "lucide-react";
import { JSX } from "react";
interface SidebarProps {
    setActiveMenu: (menu: string) => void;
}
export const Sidebar: React.FC<SidebarProps> = ({ setActiveMenu }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeLink, setActiveLink] = useState<string>("");
    const location = useLocation();

    const currentPath = location.pathname;
    return (
        <>
            {/* Toggle Button - hiển thị chỉ trên mobile */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-neutral-dark p-2 rounded-md shadow-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Menu size={24} className="text-primary-dark dark:text-primary-light" />
            </button>

            {/* Sidebar */}
            <aside
                className={`bg-white dark:bg-neutral-dark border-r border-gray-200 dark:border-gray-700 h-screen transition-all duration-300 ease-in-out flex flex-col fixed top-0 left-0 z-40 ${isOpen ? "w-64" : "w-0 overflow-hidden"
                    } md:static md:w-64`}
            >
                {/* Title */}
                <div className="p-4 hidden md:flex items-center justify-start text-primary-dark dark:text-primary-light font-bold text-xl">
                    Drive
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2 p-2 md:p-4 text-gray-700 dark:text-gray-300 text-xs md:text-base">
                    <NavItem
                        to="/"
                        icon={<Home size={20} />}
                        label="Tài liệu của tôi"
                        active={currentPath === "/"}
                        onClick={() => setActiveLink("/")}
                        setActiveMenu={setActiveMenu}
                    />
                    <NavItem
                        to="/shared"
                        icon={<Share2 size={20} />}
                        label="Đã chia sẻ"
                        active={activeLink === "/shared"}
                        onClick={() => setActiveLink("/shared")}
                        setActiveMenu={setActiveMenu}
                    />
                    <NavItem
                        to="/trash"
                        icon={<Trash2 size={20} />}
                        label="Thùng rác"
                        active={activeLink === "/trash"}
                        onClick={() => setActiveLink("/trash")}
                        setActiveMenu={setActiveMenu}
                    />
                    <NavItem
                        to="/document-assistant"
                        icon={<Asterisk size={20} />}
                        label="Trợ lý tài liệu"
                        active={activeLink === "/document-assistant"}
                        onClick={() => setActiveLink("/document-assistant")}
                        setActiveMenu={setActiveMenu} // Truyền setActiveMenu vào NavItem
                    />
                </nav>
            </aside>

            {/* Overlay để đóng khi click ra ngoài - chỉ hiển thị ở mobile khi mở menu */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};
const NavItem = ({
    to,
    icon,
    label,
    active,
    onClick,
    setActiveMenu,
}: {
    to: string;
    icon: JSX.Element;
    label: string;
    active: boolean;
    onClick: () => void;
    setActiveMenu: (menuName: string) => void;
}) => (
    <Link
        to={to}
        onClick={
            () => {
                onClick();
                setActiveMenu(label);
            }
        }
        className={`flex items-center gap-2 px-2 py-2 rounded-md transition-colors
            ${active ?
                "bg-primary-light text-white dark:bg-primary-dark dark:text-white border-l-4 border-primary-dark shadow-lg" // Active state
                :
                "text-gray-700 dark:text-gray-300 hover:bg-primary-light/10" // Normal state
            }`}
    >
        <div className={`min-w-[20px] text-primary ${active ? "text-secondary" : "text-gray-500 dark:text-gray-400"}`}>
            {icon}
        </div>
        <span className="hidden md:inline">{label}</span>
    </Link>
);
