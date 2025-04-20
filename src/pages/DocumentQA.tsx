import React, { useRef, useState } from "react";
import { Content, GoogleGenAI } from "@google/genai";
import { toast } from "sonner";

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
    const contentsRef = useRef<Content[]>([]); // Khởi tạo content là một mảng rỗng
    const totalToken = useRef(0); // Khởi tạo totalToken là 0
    const maxToken = 1000000; // Giới hạn token tối đa
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

    const handleAsk = async () => {
        if (!file || !question) return;

        const userMessage: Message = { role: "user", text: question };
        setMessages((prev) => [...prev, userMessage]);
        setQuestion("");
        setLoading(true);

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
            }; // Khởi tạo content là một đối tượng rỗng
            contentsRef.current.push(newContent); // Thêm content vào mảng contents

            const response = await ai.models.generateContentStream({
                model: "gemini-2.5-flash-preview-04-17",
                contents: contentsRef.current,
                config: { responseMimeType: "text/plain" }
            });
            let fullText = "";

            for await (const chunk of response) {
                const content = chunk.candidates?.[0]?.content;
                if (!content) continue;
                contentsRef.current.push(content);
                fullText += chunk.text;
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
        } catch (err) {
            console.error(err);
            setMessages((prev) => [...prev, { role: "ai", text: "Đã xảy ra lỗi. Vui lòng thử lại." }]);
        } finally {
            setLoading(false);
        }
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
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Nhập câu hỏi của bạn về tài liệu..."
                className="w-full bg-white dark:bg-neutral-dark text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:ring-0 focus:border-transparent rounded-md p-3"
            />

            <button
                onClick={handleAsk}
                disabled={!file || !question || loading}
                className={`btn w-full text-white transition-colors duration-200 ${loading || !file || !question
                    ? "bg-primary/50 cursor-not-allowed"
                    : "bg-primary hover:bg-primary-dark"
                    }`}
            >
                {loading ? "Đang hỏi..." : "Gửi câu hỏi"}
            </button>
        </div>
    );
};

export default DocumentQA;
