const Header = () => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow px-4 py-2 flex justify-between items-center">
            <h1 className="text-lg font-semibold">Tài liệu của tôi</h1>
            <div className="flex items-center gap-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">Tải lên</button>
                <button className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600">Tạo thư mục</button>
            </div>
        </header>
    );
};

export default Header;