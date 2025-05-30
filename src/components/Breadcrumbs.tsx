import React, { useEffect, useState } from "react";
import { BreadcrumbDto } from "../types/BreadcrumbDto";

interface BreadcrumbsProps {
    initialPath: BreadcrumbDto[];
    onClick: (id: number) => void; // Callback khi click vào link
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ initialPath, onClick }) => {
    const [path, setPath] = useState(initialPath);

    const handleClick = (breadcrumb: BreadcrumbDto) => {
        // Cắt bớt danh sách path từ index trở đi
        setPath(path.slice(0, path.findIndex(b => b.id === breadcrumb.id) + 1)); // Sửa lại để giữ lại từ index đến cuối
        onClick(breadcrumb.id); // Gọi callback khi click vào link
    };
    useEffect(() => {
        setPath(initialPath);
    }, [initialPath]);
    return (
        <nav className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            <ol className="flex items-center space-x-2">
                {path.map((breadcrumb, index) => {
                    const isLast = index === path.length - 1;

                    return (
                        <React.Fragment key={breadcrumb.id}>
                            {isLast ? (
                                <span className="text-gray-500">{breadcrumb.name}</span> // Nếu là phần tử cuối, không phải link
                            ) : (
                                <span
                                    className="text-primary hover:underline cursor-pointer transition-all duration-300 ease-in-out"
                                    onClick={() => handleClick(breadcrumb)} // Gọi callback khi click vào link
                                >
                                    {breadcrumb.name}
                                </span>
                            )}
                            {!isLast && (
                                <span className="text-gray-500 mx-2">/</span> // Dấu phân cách
                            )}
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
