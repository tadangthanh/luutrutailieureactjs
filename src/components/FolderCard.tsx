const FolderCard = ({ name }: { name: string }) => {
    return (
        <div className="bg-yellow-100 dark:bg-yellow-700 rounded-xl p-4 w-full max-w-[200px] shadow hover:shadow-md cursor-pointer">
            <div className="font-semibold text-gray-800 dark:text-white">📁 {name}</div>
        </div>
    );
};

export default FolderCard;
