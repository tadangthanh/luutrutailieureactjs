import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Asterisk, Trash2, Menu, Bookmark, X, Users, Folder } from "lucide-react";
import { JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useItemContext } from "../contexts/ItemContext";
import AddButton from "./AddButton";

interface SidebarProps {
    setActiveMenu: (menu: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ setActiveMenu }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { activeLink, setActiveLink } = useItemContext();
    const location = useLocation();
    const currentPath = location.pathname;

    const sidebarVariants = {
        open: { width: "18rem", opacity: 1, transition: { duration: 0.3 } },
        closed: { width: "0", opacity: 0, transition: { duration: 0.3 } }
    };

    const overlayVariants = {
        open: { opacity: 1 },
        closed: { opacity: 0 }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <X size={22} className="text-gray-700 dark:text-gray-200" />
                ) : (
                    <Menu size={22} className="text-gray-700 dark:text-gray-200" />
                )}
            </button>

            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={overlayVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar for mobile (animated) */}
            <motion.aside
                variants={sidebarVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                className="fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 overflow-hidden md:hidden shadow-xl"
            >
                <SidebarContent setActiveMenu={setActiveMenu} setIsOpen={setIsOpen} currentPath={currentPath} setActiveLink={setActiveLink} activeLink={activeLink} />
            </motion.aside>

            {/* Sidebar for desktop (always visible) */}
            <aside className="hidden md:block w-72 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 shadow-lg">
                <SidebarContent setActiveMenu={setActiveMenu} setIsOpen={undefined} currentPath={currentPath} setActiveLink={setActiveLink} activeLink={activeLink} />
            </aside>
        </>
    );
};

function SidebarContent({ setActiveMenu, setIsOpen, currentPath, setActiveLink, activeLink }: {
    setActiveMenu: (menu: string) => void,
    setIsOpen?: (open: boolean) => void,
    currentPath: string,
    setActiveLink: (link: string) => void,
    activeLink: string
}) {
    return (
        <div className="flex flex-col h-full">
            {/* Logo/Title */}
            <div className="p-6  border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300">
                        Drive
                    </div>
                    {setIsOpen && (
                        <button
                            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={20} className="text-gray-700 dark:text-gray-200" />
                        </button>
                    )}
                </div>

                {/* Add Button */}
                <div className="relative">
                    <AddButton />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                <NavItem
                    to="/"
                    icon={<Folder size={20} />}
                    label="Tài liệu của tôi"
                    active={currentPath === "/"}
                    onClick={() => setActiveLink("/")}
                    setActiveMenu={setActiveMenu}
                />
                <NavItem
                    to="/shared-with-me"
                    icon={<Users size={20} />}
                    label="Được chia sẻ với tôi"
                    active={activeLink === "/shared-with-me"}
                    onClick={() => setActiveLink("/shared-with-me")}
                    setActiveMenu={setActiveMenu}
                />
                <NavItem
                    to="/saved"
                    icon={<Bookmark size={20} />}
                    label="Tài liệu đã lưu"
                    active={activeLink === "/saved"}
                    onClick={() => setActiveLink("/saved")}
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
                    label="AI Hỏi đáp"
                    active={activeLink === "/document-assistant"}
                    onClick={() => setActiveLink("/document-assistant")}
                    setActiveMenu={setActiveMenu}
                />
            </nav>
        </div>
    );
}

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
        onClick={() => {
            onClick();
            setActiveMenu(label);
        }}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200
            ${active
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
    >
        <div className={`${active
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-400"}`}>
            {icon}
        </div>
        <span className="font-medium">{label}</span>
    </Link>
);
