import React, { useRef, useState, useEffect } from "react";
import { Content, GoogleGenAI } from "@google/genai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { IoMdCloseCircle } from "react-icons/io"; // Sử dụng icon cấm từ react-icons
import { SendHorizonalIcon, StopCircle } from "lucide-react";

type Message = {
    role: "user" | "ai";
    text: string;
};

const DocumentQA: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [isStopped, setIsStopped] = useState(false); // Trạng thái dừng trả lời
    const [elapsedTime, setElapsedTime] = useState(0); // Thời gian trôi qua (mili giây)
    const [timeRemainingForAI, setTimeRemainingForAI] = useState<number | null>(null); // Thời gian còn lại cho AI

    const fileInput = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const contentsRef = useRef<Content[]>([]);
    const tokenUsage = useRef(0);
    const tokenDocument = useRef(0);
    const maxToken = 1000000;
    const intervalRef = useRef<NodeJS.Timeout | null>(null); // Dùng để dừng interval khi cần

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (e.target.files[0].type !== "application/pdf") {
                toast.error("Vui lòng chọn tệp PDF.");
                setFile(null);
                setQuestion("");
                fileInput.current!.value = "";
                return;
            }
            setFile(e.target.files[0]);
        }
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
        setIsStopped(false);
        setElapsedTime(0); // Reset thời gian khi bắt đầu hỏi

        // Khởi tạo một interval để tính thời gian trôi qua
        intervalRef.current = setInterval(() => {
            if (!isStopped) {
                setElapsedTime((prevTime) => {
                    const newTime = prevTime + 0.1;
                    return Math.round(newTime * 10) / 10; // Làm tròn đến 1 chữ số thập phân
                });
            }
        }, 100); // 100 ms

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });
            const uploadedFile = await ai.files.upload({ file });
            const newContent: Content = {
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
            contentsRef.current.push(newContent);

            const response = await ai.models.generateContentStream({
                model: "gemini-2.5-flash-preview-04-17",
                contents: contentsRef.current,
                config: { responseMimeType: "text/plain" }
            });
            let fullText = "";

            for await (const chunk of response) {
                if (isStopped) break; // Nếu đã dừng thì thoát khỏi vòng lặp
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
            clearInterval(intervalRef.current!); // Dừng interval khi kết thúc
        }
    };

    const handleStop = () => {
        setIsStopped(true); // Đánh dấu dừng trả lời
        clearInterval(intervalRef.current!); // Dừng interval tính thời gian
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-4 bg-neutral-light dark:bg-neutral-dark rounded-xl mt-10 shadow-md transition-colors duration-300">
            <h1 className="text-2xl text-secondary font-bold">Trợ lý tài liệu</h1>

            <input
                ref={fileInput}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full text-primary file:text-primary file:border-primary/50 file:bg-primary/10 hover:file:bg-primary/20"
            />

            <div className="h-96 overflow-y-auto bg-white dark:bg-neutral-dark p-4 rounded-md space-y-4 border border-gray-200 dark:border-gray-700">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${msg.role === "user"
                                ? "bg-primary text-white rounded-br-none"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-none"
                                }`}
                        >
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                            {/* Hiển thị thời gian trong tin nhắn của AI sắp tới */}
                            {msg.role === "ai" && loading && !isStopped && timeRemainingForAI !== null && (
                                <div className="text-sm text-gray-500 mt-2">
                                    Thời gian đã trôi qua: {elapsedTime}s
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Nhập câu hỏi của bạn về tài liệu..."
                className="w-full bg-white dark:bg-neutral-dark  text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:ring-0 focus:border-transparent rounded-md p-3"
            />

            <div className="relative h-[50px]">
                {/* Hiển thị thời gian đếm nếu đang loading */}
                {loading && !isStopped && (
                    <div className="absolute bottom-4 right-[175px] text-sm text-gray-600 dark:text-gray-300 font-medium">
                        ⏱ {elapsedTime.toFixed(1)}s
                    </div>
                )}

                {/* Nút Gửi câu hỏi */}
                {!loading && (
                    <button
                        onClick={handleAsk}
                        disabled={!file || !question}
                        className={`absolute bottom-4 right-4 w-[150px] p-2 text-white rounded-md flex items-center justify-center transition-colors duration-200 ${!file || !question
                                ? "bg-primary/50 cursor-not-allowed"
                                : "bg-primary hover:bg-primary-dark"
                            }`}
                    >
                        Gửi câu hỏi
                        <SendHorizonalIcon className="ms-2 w-5 h-5 text-white" />
                    </button>
                )}

                {/* Nút Dừng trả lời */}
                {loading && (
                    <button
                        onClick={handleStop}
                        className="absolute bottom-4 right-4 w-[150px] p-2 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center transition-colors duration-200"
                    >
                        Dừng
                        <StopCircle className="ms-2 w-5 h-5 text-white" />
                    </button>
                )}
            </div>


        </div>
    );
};

export default DocumentQA;
