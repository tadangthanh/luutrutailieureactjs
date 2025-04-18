
import { ReactNode } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;