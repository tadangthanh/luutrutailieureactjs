import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";

const DocumentQA: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleAsk = async () => {
        if (!file || !question) return;

        setLoading(true);
        setAnswer("");

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

            const uploadedFile = await ai.files.upload({ file });

            const contents = [
                {
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
                },
            ];

            const response = await ai.models.generateContentStream({
                model: "gemini-2.5-flash-preview-04-17",
                contents,
                config: {
                    responseMimeType: "text/plain",
                },
            });

            let fullAnswer = "";
            for await (const chunk of response) {
                console.log("trả lời:", chunk.text);
                fullAnswer += chunk.text;
                setAnswer((prev) => prev + chunk.text);
            }
        } catch (error: any) {
            console.error("Error asking question:", error);
            setAnswer("Đã xảy ra lỗi. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6 bg-neutral-light dark:bg-neutral-dark rounded-xl mt-10 shadow-md transition-colors duration-300">
            <h1 className="text-2xl text-secondary font-bold">Hỏi đáp với tài liệu</h1>

            <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full text-primary file:text-primary file:border-primary/50 file:bg-primary/10 hover:file:bg-primary/20"
            />

            <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Nhập câu hỏi của bạn về tài liệu..."
                className="w-full bg-white dark:bg-neutral-dark text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:outline-none focus:ring-0 focus:border-transparent rounded-md p-3"
            />

            <button
                onClick={handleAsk}
                disabled={!file || !question || loading}
                className={`btn w-full text-white transition-colors duration-200 ${loading || !file || !question
                        ? 'bg-primary/50 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dark'
                    }`}
            >
                {loading ? "Đang hỏi..." : "Gửi câu hỏi"}
            </button>

            {answer && (
                <div className="p-4 rounded-lg bg-white dark:bg-neutral-dark border border-primary text-gray-800 dark:text-white whitespace-pre-wrap">
                    {answer}
                </div>
            )}
        </div>

    );
};

export default DocumentQA;
