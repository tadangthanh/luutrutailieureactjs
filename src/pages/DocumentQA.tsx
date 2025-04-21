import React, { useRef, useState, useEffect, use } from "react";
import { Content, GetFileParameters, GoogleGenAI } from "@google/genai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { SendHorizonalIcon } from "lucide-react";
import SidebarChatList from "../components/SidebarChatList";

type Message = {
    role: "user" | "ai";
    text: string;
};

const DocumentQA: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    const fileInput = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const contentsRef = useRef<Content[]>([]);
    const tokenUsage = useRef(0);
    const tokenDocument = useRef(0);
    const maxToken = 1000000;
    const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFile = e.target.files?.[0];

        // Nếu không có file mới (tức là user ấn cancel) => không làm gì cả
        if (!newFile) return;

        // Kiểm tra loại file
        if (newFile.type !== "application/pdf") {
            toast.error("Vui lòng chọn tệp PDF.");
            fileInput.current!.value = ""; // reset input
            return;
        }

        // Nếu là cùng 1 file
        if (
            file &&
            newFile.name === file.name &&
            newFile.size === file.size &&
            newFile.lastModified === file.lastModified
        ) {
            toast.info("Bạn vừa chọn lại cùng một tệp.");
            return;
        }

        // Nếu là file hợp lệ và khác file cũ
        toast.success("Đã chọn tệp mới.");
        setFile(newFile);
        setQuestion("");
        setMessages([]);
        contentsRef.current = [];
    };


    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const countTokens = (text: string): number => {
        return text.trim().split(/\s+/).length;
    };

    const trimContentsToMaxToken = (contents: Content[], maxToken: number): void => {
        const tokenCounts = contents.map((content) => {
            let total = 0;
            if (content.parts) {
                for (const part of content.parts) {
                    if ("text" in part && part.text) {
                        total += countTokens(part.text);
                    }
                }
            }
            return total;
        });

        let total = tokenCounts.reduce((sum, count) => sum + count, 0);

        while (total >= maxToken && contents.length > 0) {
            const removed = contents.shift();
            const removedToken = tokenCounts.shift();
            total -= removedToken || 0;
        }
    };

    const handleAsk = async () => {
        if (!file || !question) return;

        const userMessage: Message = { role: "user", text: question };
        setMessages((prev) => [...prev, userMessage]);
        setQuestion("");
        setLoading(true);
        try {
            const uploadedFile = await ai.files.upload({ file });
            if (!uploadedFile) {
                toast.error("Tải lên tệp thất bại.");
                return;
            }
            const initContent: Content = {
                role: "user",
                parts: [
                    {
                        fileData: {
                            fileUri: uploadedFile.uri,
                            mimeType: uploadedFile.mimeType,
                        },
                    },
                    { text: question },
                ],
            };
            contentsRef.current.push(initContent);

            const response = await ai.models.generateContentStream({
                model: "gemini-2.5-flash-preview-04-17",
                contents: contentsRef.current,
                config: { responseMimeType: "text/plain" }
            });

            let fullText = "";

            for await (const chunk of response) {
                const content = chunk.candidates?.[0]?.content;
                const usageMetadata = chunk.usageMetadata;
                if (usageMetadata) {
                    tokenUsage.current = usageMetadata.totalTokenCount || 0;
                    usageMetadata.promptTokensDetails?.forEach((detail) => {
                        if (detail?.modality === "DOCUMENT") {
                            tokenDocument.current = detail.tokenCount || 0;
                        }
                    });
                }
                if (!content) continue;
                contentsRef.current.push(content);
                fullText += chunk.text || "";
            }

            let index = 0;
            let newText = "";
            const typeInterval = setInterval(() => {
                if (index < fullText.length) {
                    newText += fullText[index];
                    index++;
                    setMessages((prev) => {
                        const updated = [...prev];
                        if (updated[updated.length - 1]?.role === "ai") {
                            updated[updated.length - 1].text = newText;
                        } else {
                            updated.push({ role: "ai", text: newText });
                        }
                        return updated;
                    });
                    scrollToBottom();
                } else {
                    clearInterval(typeInterval);
                }
            }, 10);

            trimContentsToMaxToken(contentsRef.current, maxToken);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [...prev, { role: "ai", text: "Đã xảy ra lỗi. Vui lòng thử lại." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-neutral-light dark:bg-gray-900">
            {/* Sidebar */}
            <div className="w-64 mt-20  dark:bg-gray-900  flex flex-col">
                <SidebarChatList />
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 md:px-10 py-8">
                <div className=" px-6 py-8 space-y-6 bg-white dark:bg-gray-900 rounded-2xl mt-12 shadow-xl border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <h1 className="text-3xl font-extrabold text-primary dark:text-white tracking-tight">
                        🤖 Trợ lý Tài Liệu Thông Minh
                    </h1>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tải tệp tài liệu của bạn (.pdf, .doc, .docx)
                        </label>
                        <input
                            ref={fileInput}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="file-input w-full file:bg-primary file:text-white file:border-none file:py-2 file:px-4 rounded-lg cursor-pointer bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-200 focus:outline-none transition"
                        />
                    </div>

                    <div className="h-96 overflow-y-auto bg-neutral-100 dark:bg-neutral-800 p-5 rounded-xl space-y-4 border border-gray-200 dark:border-gray-700 shadow-inner custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap shadow-md ${msg.role === "user"
                                        ? "bg-primary text-white rounded-br-none"
                                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none"
                                        }`}
                                >
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Nhập câu hỏi của bạn về tài liệu..."
                            rows={3}
                            className="w-full resize-none bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/50 rounded-xl p-4 border border-gray-300 dark:border-gray-600 transition"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleAsk}
                            disabled={!file || !question || loading}
                            className={`inline-flex items-center px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200 ${!file || !question || loading
                                ? "bg-primary/50 cursor-not-allowed"
                                : "bg-primary hover:bg-primary-dark"
                                }`}
                        >
                            Gửi câu hỏi
                            <SendHorizonalIcon className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default DocumentQA;
