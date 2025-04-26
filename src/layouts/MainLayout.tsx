import { ReactNode, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";

const MainLayout = ({ children }: { children: ReactNode }) => {
    const [activeMenu, setActiveMenu] = useState<string>("Tài liệu của tôi");

    return (
        <div className="flex h-screen relative">
            <Sidebar setActiveMenu={setActiveMenu} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header activeMenu={activeMenu} />
                <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 relative custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
