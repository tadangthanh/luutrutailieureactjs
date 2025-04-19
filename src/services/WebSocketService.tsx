import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "../utils/auth";

// URL WebSocket server
const token = getAccessToken();
const baseApi = process.env.REACT_APP_BASE_URL_BACKEND;
const WS_URL = baseApi + "/ws?token=" + getAccessToken();
export class WebSocketService {
    private client: Client;

    constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_URL,null,{
                transports: ["websocket"],
                timeout: 5000
            }),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

    }

    // Kết nối WebSocket
    connect(onMessage: (message: string) => void): void {
        this.client.onConnect = () => {
            // console.log("Connected to WebSocket");
            // Subscribe vào topic
            this.client.subscribe("/user/topic/import-word-status", (message) => {
                if (message.body) {
                    onMessage(message.body);
                }
            });
            // Subscribe vào topic import-sentence-status
            this.client.subscribe("/user/topic/import-sentence-status", (message) => {
                if (message.body) {
                    onMessage(message.body);
                }
            });
        };
        this.client.onDisconnect = () => {
            // console.log("Disconnected from WebSocket");
        };

        this.client.activate();
    }

    // Ngắt kết nối WebSocket
    disconnect(): void {
        if (this.client.active) {
            this.client.deactivate();
            // console.log("WebSocket connection closed");
        }
    }
}

export const webSocketService = new WebSocketService();
export default webSocketService;

