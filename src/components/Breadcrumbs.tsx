import React, { useState } from "react";

interface BreadcrumbsProps {
    initialPath: Array<{ id: number; name: string }>;
    onClick: (id: number) => void; // Callback khi click vào link
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ initialPath, onClick }) => {
    const [path, setPath] = useState(initialPath);

    const handleClick = (index: number) => {
        // Cắt bớt danh sách path từ index trở đi
        setPath(path.slice(0, index + 1)); // Sửa lại để giữ lại từ index đến cuối
        onClick(path[index].id); // Gọi callback khi click vào link
    };

    return (
        <nav className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            <ol className="flex items-center space-x-2">
                {path.map((folder, index) => {
                    const isLast = index === path.length - 1;

                    return (
                        <React.Fragment key={folder.id}>
                            {isLast ? (
                                <span className="text-gray-500">{folder.name}</span> // Nếu là phần tử cuối, không phải link
                            ) : (
                                <span
                                    className="text-primary hover:underline cursor-pointer transition-all duration-300 ease-in-out"
                                    onClick={() => handleClick(index)} // Gọi callback khi click vào link
                                >
                                    {folder.name}
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
