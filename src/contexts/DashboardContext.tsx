import { createContext, useContext, ReactNode } from 'react';
import { ItemResponse } from '../types/ItemResponse';
import { DocumentVersionResponse } from '../types/DocumentVersionResponse';

type DashboardContextType = {
    isEditor: boolean;
    handleSave: (id: number) => void;
    handleUnSave: (id: number) => void;
    handleVersionHistory: (id: number) => void;
    handleItemClick: (item: ItemResponse) => void;
    handleCopy: (id: number) => void;
    handleDownload: (id: number) => void;
    handleInfo: (id: number) => void;
    handleMoveToTrash: (id: number) => void;
    handleOpen: (id: number) => void;
    handleRename: (id: number) => void;
    handleShare: (id: number) => void;
    handleRestoreSuccess: (documentId: number, version: DocumentVersionResponse) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

interface DashboardProviderProps {
    children: ReactNode;
    value: DashboardContextType;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children, value }) => {
    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};
