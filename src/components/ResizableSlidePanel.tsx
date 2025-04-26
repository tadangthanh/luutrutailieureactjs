import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { GripHorizontal } from "lucide-react";

interface ResizableSlidePanelProps {
    children: React.ReactNode;
    onClose: () => void;
}

const ResizableSlidePanel: React.FC<ResizableSlidePanelProps> = ({ children, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Background */}
            <div
                className="fixed inset-0 bg-black bg-opacity-30"
                onClick={onClose}
            />

            {/* Slide panel with resizable */}
            <div className="relative w-72 h-full">
                <PanelGroup direction="horizontal">
                    <Panel defaultSize={25} minSize={20} maxSize={50}>
                        <div className="relative h-full bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700">
                            {/* Header */}
                            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Thông tin</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">
                                {children}
                            </div>
                        </div>
                    </Panel>

                    {/* Resize handle */}
                    <PanelResizeHandle className="w-2 bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center cursor-col-resize">
                        <GripHorizontal className="text-gray-400 dark:text-gray-500" size={14} />
                    </PanelResizeHandle>
                </PanelGroup>
            </div>
        </div>
    );
};

export default ResizableSlidePanel;
