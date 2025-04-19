import { ReactNode, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Thay useHistory bằng useNavigate

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    align?: "left" | "right";
}

const Dropdown = ({ trigger, children, align = "right" }: DropdownProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const navigate = useNavigate(); // Thay useHistory bằng useNavigate

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        // Xoá token khỏi localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("fullName");
        localStorage.removeItem("email");
        localStorage.removeItem("avatarUrl");

        // Nếu dùng cookie:
        // document.cookie = "accessToken=; path=/; max-age=0";
        // document.cookie = "refreshToken=; path=/; max-age=0";

        // Chuyển hướng về trang login
        navigate("/login"); // Sử dụng navigate để chuyển trang
    };

    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = !!localStorage.getItem("accessToken"); // Hoặc kiểm tra cookie nếu bạn lưu ở đó
    // Lấy tên hoặc email người dùng từ localStorage
    const fullName = localStorage.getItem("fullName");
    const email = localStorage.getItem("email");
    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setOpen(!open)} className="cursor-pointer">
                {trigger}
            </div>
            {open && (
                <div
                    className={`absolute mt-2 min-w-[160px] rounded-xl bg-white dark:bg-gray-800 shadow z-20 ${align === "right" ? "right-0" : "left-0"
                        }`}
                >
                    {isLoggedIn ? (
                        <div>
                            <div className="px-4 py-2 text-gray-700 dark:text-white">
                                {/* Hiển thị tên hoặc email */}
                                {fullName || email}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 dark:text-red-400"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <div>
                            <button
                                onClick={() => navigate("/login")} // Sử dụng navigate để chuyển trang
                                className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 dark:text-blue-400"
                            >
                                Đăng nhập
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
