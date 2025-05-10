import { createContext, useContext } from "react";
import { ItemResponse } from "../types/ItemResponse";
import { PageResponse } from "../types/PageResponse";

type ItemContextType = {
    items: string[];
    setItems: (items: string[] | ((prev: string[]) => string[])) => void;
    itemPage: PageResponse<ItemResponse>;
    pageNo: number;
    setActiveLink: (activeLink: string) => void;
    activeLink: string;
    setItemPage: (itemPage: PageResponse<ItemResponse> | ((prev: PageResponse<ItemResponse>) => PageResponse<ItemResponse>)) => void;
    setPageNo: (pageNo: number | ((prev: number) => number)) => void;
    folderId: number | null;
    setFolderId: (folderId: number | null) => void;
    isProcessing: boolean;
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
    setIsProcessing: (isProcessing: boolean) => void;
    messageProcessing: string | null;
    setMessageProcessing: (messageProcessing: string | null) => void;
    onCancelRef: React.MutableRefObject<() => void>;
    triggerFileUpload: () => void;
    handleDrop: (e: DragEvent) => void;
    handleDragOver: (e: DragEvent) => void;
    handleDragLeave: (e: DragEvent) => void;
    handleUploadFailure: (message: string) => void;
    openCreateFolderModal: () => void;
    isCreateFolder: boolean;
    setIsCreateFolder: (isCreateFolder: boolean) => void;
    newFolderName: string;
    setNewFolderName: (newFolderName: string) => void;
    handleCreateFolder: () => void;
    onCancelNotificationBottomLeft: () => void;
    pathRef: React.MutableRefObject<Array<{ id: number; name: string }>>;
    setIsSharedView: (isSharedView: boolean) => void;
}
export const ItemContext = createContext<ItemContextType | null>(null);
export const useItemContext = () => {
    const context = useContext(ItemContext);
    if (!context) throw new Error("useItemContext must be inside provider");
    return context;
}
