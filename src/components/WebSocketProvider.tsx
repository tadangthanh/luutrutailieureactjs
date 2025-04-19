import React, { createContext, useEffect, useState, ReactNode } from 'react';
import webSocketService from '../services/WebSocketService';


interface WebSocketContextType {
    lastMessage: any | null; // Thông báo mới nhất từ WebSocket
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lastMessage, setLastMessage] = useState<any | null>(null);

    useEffect(() => {
        // Kết nối WebSocket
        webSocketService.connect((data) => {
            const response = JSON.parse(data);
            setLastMessage(response); // Lưu thông báo mới nhất vào state
        });

        return () => {
            webSocketService.disconnect(); // Ngắt kết nối khi unmount
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ lastMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};
