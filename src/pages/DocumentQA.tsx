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
        <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-xl shadow-lg mt-10">
            <h1 className="text-2xl font-bold">Hỏi đáp với tài liệu</h1>

            <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full"
            />

            <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Nhập câu hỏi của bạn về tài liệu..."
                className="input input-bordered w-full"
            />

            <button
                onClick={handleAsk}
                disabled={!file || !question || loading}
                className="btn btn-primary w-full"
            >
                {loading ? "Đang hỏi..." : "Gửi câu hỏi"}
            </button>

            {answer && (
                <div className="p-4 bg-gray-100 rounded-lg text-gray-800 whitespace-pre-wrap">
                    {answer}
                </div>
            )}
        </div>
    );
};

export default DocumentQA;
