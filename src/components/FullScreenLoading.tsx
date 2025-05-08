import React from 'react';

const FullScreenLoading: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">Đang tải...</p>
            </div>
        </div>
    );
};

export default FullScreenLoading; 