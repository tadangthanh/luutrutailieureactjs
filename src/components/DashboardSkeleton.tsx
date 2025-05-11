import React from 'react';
import { motion } from 'framer-motion';

interface DashboardSkeletonProps {
    layout: "grid" | "list";
}

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ layout }) => {
    const skeletonItems = Array.from({ length: 12 });

    if (layout === "list") {
        return (
            <div className="space-y-2">
                {skeletonItems.map((_, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse"
                    >
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
                        </div>
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {skeletonItems.map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm animate-pulse"
                >
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-3" />
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default DashboardSkeleton; 