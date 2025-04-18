const FileCard = ({ name }: { name: string }) => {
    return (
        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 w-full max-w-[200px] shadow hover:shadow-md cursor-pointer">
            <div className="text-gray-800 dark:text-white">📄 {name}</div>
        </div>
    );
};

export default FileCard;