// WebSocketService.ts
import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const baseApi = process.env.REACT_APP_BASE_URL_BACKEND;
const WS_URL = baseApi + "/ws?token=" + localStorage.getItem("accessToken");

export class WebSocketService {
    private client: Client;
    private progressSubscription: StompSubscription | null = null;
    private completedSubscription: StompSubscription | null = null;

    constructor() {
        this.client = new Client({
            webSocketFactory: () =>
                new SockJS(WS_URL, null, {
                    transports: ["websocket"],
                    timeout: 5000,
                }),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });
    }

    connect(onMessage: (message: string) => void): void {
        this.client.onConnect = () => {
            console.log("✅ WebSocket connected");
        };
        this.client.activate();
    }

    disconnect(): void {
        if (this.client.active) {
            this.unsubscribeUploadProgress();
            this.unsubscribeUploadCompleted();
            this.client.deactivate();
        }
    }

    // ✅ Gọi khi bắt đầu upload
    subscribeUploadProgress(onMessage: (message: string) => void) {
        if (!this.client.connected) return;
        this.progressSubscription = this.client.subscribe(
            "/user/topic/upload-documents",
            (message) => {
                if (message.body) {
                    onMessage(message.body);
                }
            }
        );
    }

    subscribeUploadCompleted(onMessage: (message: string) => void) {
        if (!this.client.connected) return;
        this.completedSubscription = this.client.subscribe(
            "/user/topic/upload-documents-completed",
            (message) => {
                if (message.body) {
                    onMessage(message.body);
                }
            }
        );
    }

    // ✅ Gọi khi kết thúc hoặc hủy upload
    unsubscribeUploadProgress() {
        this.progressSubscription?.unsubscribe();
        this.progressSubscription = null;
    }

    unsubscribeUploadCompleted() {
        this.completedSubscription?.unsubscribe();
        this.completedSubscription = null;
    }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
