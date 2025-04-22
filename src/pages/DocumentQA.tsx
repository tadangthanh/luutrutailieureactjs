import React, { useRef, useState, useEffect } from "react";
import { Content, GoogleGenAI } from "@google/genai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ChevronDown, FileText, Plus, SendHorizonalIcon, X } from "lucide-react";
import { SidebarChatList } from "../components/SidebarChatList";
import { AssistantFile } from "../types/AssistantFile";
import { getAssistantFilesByChatSessionId } from "../services/AssistantFileApi";
import { PageResponse } from "../types/PageResponse";
import { Conversation } from "../types/Conversation";
import { getConversations } from "../services/ConversationApi";
import { ChatSessionDto } from "../types/ChatSessionDto";
import { getChatSessions, createChatSession, delChatSession } from "../services/ChatSessionApi";
import { ChatSessionInit } from "../types/ChatSessionInit";
import { TypingIndicator } from "../components/TypingIndicator";

type Message = {
    role: "user" | "ai";
    text: string;
};

const DocumentQA: React.FC = () => {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const questionRef = useRef<HTMLTextAreaElement>(null);
    const tokenUsage = useRef(0);
    const tokenDocument = useRef(0);
    const maxToken = 1000000;
    const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = Array.from(e.target.files || []);
        if (fileList == null || fileList?.length === 0) return;
        for (let i = 0; i < fileList.length; i++) {
            // Kiểm tra loại file
            if (fileList[i].type !== "application/pdf") {
                toast.error("Vui lòng chọn tệp PDF.");
                e.target.value = ""; // reset input value
                return;
            }
        }
        setQuestion("");
        setMessages([]);
        setFiles(
            (prevFiles) => [...prevFiles, ...Array.from(fileList)],
        ); // Thêm file vào danh sách file đã chọn

        // Reset input để cho phép chọn lại cùng file sau này
        e.target.value = "";
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

    // const handleAsk = async () => {
    //     if (!file || !question) return;

    //     const userMessage: Message = { role: "user", text: question };
    //     setMessages((prev) => [...prev, userMessage]);
    //     setQuestion("");
    //     setLoading(true);
    //     try {
    //         const uploadedFile = await ai.files.upload({ file });
    //         if (!uploadedFile) {
    //             toast.error("Tải lên tệp thất bại.");
    //             return;
    //         }
    //         const initContent: Content = {
    //             role: "user",
    //             parts: [
    //                 {
    //                     fileData: {
    //                         fileUri: uploadedFile.uri,
    //                         mimeType: uploadedFile.mimeType,
    //                     },
    //                 },
    //                 { text: question },
    //             ],
    //         };
    //         contentsRef.current.push(initContent);

    //         const response = await ai.models.generateContentStream({
    //             model: "gemini-2.5-flash-preview-04-17",
    //             contents: contentsRef.current,
    //             config: { responseMimeType: "text/plain" }
    //         });

    //         let fullText = "";

    //         for await (const chunk of response) {
    //             const content = chunk.candidates?.[0]?.content;
    //             const usageMetadata = chunk.usageMetadata;
    //             if (usageMetadata) {
    //                 tokenUsage.current = usageMetadata.totalTokenCount || 0;
    //                 usageMetadata.promptTokensDetails?.forEach((detail) => {
    //                     if (detail?.modality === "DOCUMENT") {
    //                         tokenDocument.current = detail.tokenCount || 0;
    //                     }
    //                 });
    //             }
    //             if (!content) continue;
    //             contentsRef.current.push(content);
    //             fullText += chunk.text || "";
    //         }

    //         let index = 0;
    //         let newText = "";
    //         const typeInterval = setInterval(() => {
    //             if (index < fullText.length) {
    //                 newText += fullText[index];
    //                 index++;
    //                 setMessages((prev) => {
    //                     const updated = [...prev];
    //                     if (updated[updated.length - 1]?.role === "ai") {
    //                         updated[updated.length - 1].text = newText;
    //                     } else {
    //                         updated.push({ role: "ai", text: newText });
    //                     }
    //                     return updated;
    //                 });
    //                 scrollToBottom();
    //             } else {
    //                 clearInterval(typeInterval);
    //             }
    //         }, 10);

    //         trimContentsToMaxToken(contentsRef.current, maxToken);
    //     } catch (err) {
    //         console.error(err);
    //         setMessages((prev) => [...prev, { role: "ai", text: "Đã xảy ra lỗi. Vui lòng thử lại." }]);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleChatSelect = (chatSession: ChatSessionDto) => {
        setChatSessionSelected(chatSession);
    };
    const deleteFileStorageAi = async (name: string | undefined) => {
        if (name) {
            await ai.files.delete({ name: name });
        }
    }
    const handleChatDelete = (id: number) => {
        if (chatSessionSelected && chatSessionSelected.id === id) {
            setChatSessionSelected(null);
        }
        delChatSession(id).then((response) => {
            if (response.data.status === 200) {
                setChatSessionPage((prev) => {
                    return {
                        ...prev,
                        items: prev.items.filter((item) => item.id !== id),
                    };
                });
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        }).catch((error) => {
            toast.error("Lỗi khi xóa cuộc trò chuyện.");
        })
    }
    const [chatSessionPage, setChatSessionPage] = useState<PageResponse<ChatSessionDto>>(
        {
            pageNo: 0,
            pageSize: 10,
            totalPage: 0,
            hasNext: false,
            totalItems: 0,
            items: [],
        }
    );
    const [pageSessionNumber, setPageSessionNumber] = useState(0);
    useEffect(() => {
        getChatSessions(pageSessionNumber, 10)
            .then((response) => {
                if (response.status === 200) {
                    setChatSessionPage((prev) => {
                        return {
                            ...prev,
                            items: [...prev.items, ...response.data.data.items],
                            pageNo: response.data.data.pageNo,
                            pageSize: response.data.data.pageSize,
                            totalPage: response.data.data.totalPage,
                            hasNext: response.data.data.hasNext,
                            totalItems: response.data.data.totalItems,
                        };
                    });
                } else {
                    toast.error("Lỗi khi tải danh sách cuộc trò chuyện.");
                }
            })
            .catch((error) => {
                toast.error("Lỗi khi tải danh sách cuộc trò chuyện.");
            })

    }, [pageSessionNumber]);



    const [chatSessionSelected, setChatSessionSelected] = useState<ChatSessionDto | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        if (chatSessionSelected) {
            getConversations(chatSessionSelected.id).then((response) => {
                if (response.status === 200) {
                    setConversations(response.data.data);
                } else {
                    toast.error("Lỗi khi tải danh sách cuộc trò chuyện.");
                }
            }).catch((error) => {
                toast.error("Lỗi khi tải danh sách cuộc trò chuyện.");
            })
        }
    }, [chatSessionSelected]);

    const [files, setFiles] = useState<File[]>([]);
    // xóa file khỏi ô input
    const handleRemoveFile = (file: File) => {
        setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
        setQuestion("");
        if (fileInput.current) fileInput.current.value = ""; // reset input value
    }
    const [showUploadedFiles, setShowUploadedFiles] = useState(false);

    const [assistantFileUploaded, setAssistantFileUploaded] = useState<AssistantFile[]>([])
    useEffect(() => {
        if (chatSessionSelected) {
            getAssistantFilesByChatSessionId(chatSessionSelected.id).then((response) => {
                if (response.status === 200) {
                    setAssistantFileUploaded(response.data.data);
                } else {
                    toast.error("Lỗi khi tải danh sách file đã tải lên.");
                }
            }).catch((error) => {
                toast.error("Lỗi khi tải danh sách file đã tải lên.");
            })
        }
    }, [chatSessionSelected]);

    const initChatSession = async () => {
        setLoading(true);
        try {
            setConversations([
                {
                    id: null,
                    question: question,
                    answer: "",
                    chatSessionId: null
                }
            ]);
            // danh sách các file đã tải lên
            const assistantFiles: AssistantFile[] = [];
            for (let i = 0; i < files.length; i++) {
                // file đã upload lên Google GenAI
                const uploadedFile = await ai.files.upload({ file: files[i] });
                if (!uploadedFile) {
                    toast.error(`Tải lên tệp ${files[i].name} thất bại.`);
                    return;
                }
                // thêm file đã upload vào danh sách
                assistantFiles.push({
                    id: null,
                    name: uploadedFile.name,
                    uri: uploadedFile.uri,
                    mimeType: uploadedFile.mimeType,
                    originalFileName: files[i].name,
                    expirationTime: uploadedFile.expirationTime,
                    createTime: uploadedFile.createTime,
                    chatSessionId: 0
                });
            }
            // init part ban đầu cho cuộc trò chuyện
            const parts = assistantFiles.map((file) => ({
                fileData: {
                    fileUri: file.uri,
                    mimeType: file.mimeType,
                },
            }));

            const initContent: Content = {
                role: "user",
                parts: [...parts, { text: question }],
            };
            const response = await ai.models.generateContentStream({
                model: "gemini-2.5-flash-preview-04-17",
                contents: initContent,
                config: { responseMimeType: "text/plain" }
            });

            let fullText = "";

            for await (const chunk of response) {
                const content = chunk.candidates?.[0]?.content;
                if (!content) continue;
                fullText += chunk.text || "";
            }

            const conversation: Conversation = {
                id: null,
                question: question,
                answer: fullText,
                chatSessionId: null
            };

            const chatSessionInit: ChatSessionInit = {
                name: question.substring(0, 20) + "...",// tên cuộc trò chuyện
                assistantFiles,
                conversation,
            };
            createChatSession(chatSessionInit).then((response) => {
                if (response.data.status === 201) {
                    setChatSessionPage((prev) => {
                        return {
                            ...prev,
                            items: [response.data.data, ...prev.items],
                        };
                    });
                    setChatSessionSelected(response.data.data);
                    setLoading(false);
                    generateContentTimeSecond(conversation.answer);
                    setFiles([]); // xóa file đã tải lên
                    setQuestion(""); // xóa câu hỏi đã nhập
                    setAssistantFileUploaded(response.data.data.assistantFiles); // cập nhật danh sách file đã tải lên
                } else {
                    toast.error("Lỗi khi khởi tạo cuộc trò chuyện.");
                    // nếu lỗi thì xóa các file đã tải lên
                    deleteListFileCloudAI(assistantFiles);
                }
            });

            const listResponse = await ai.files.list({ config: { 'pageSize': 10 } });
            for await (const file of listResponse) {
                console.log(file.name);
                if (file && file.name) {
                    await ai.files.delete({ name: file.name });
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi trong quá trình khởi tạo cuộc trò chuyện.");
        } finally {
            setLoading(false);
        }
    }
    // khi có câu trả lời từ AI thì sẽ gọi hàm này để hiển thị câu trả lời
    const generateContentTimeSecond = async (answer: string) => {
        let index = 0;
        let newText = "";
        scrollToBottom();
        const typeInterval = setInterval(() => {
            if (index < answer.length) {
                newText += answer[index];
                index++;
                setConversations((prev) => {
                    const updated = [...prev];
                    if (updated[updated.length - 1]?.answer) {
                        updated[updated.length - 1].answer = newText;
                    } else {
                        updated.push({ id: null, question: "", answer: newText, chatSessionId: null });
                    }
                    return updated;
                });

            } else {
                clearInterval(typeInterval);
            }
        }, 10);
    }
    const clearInputQuestion = () => {
        if (questionRef.current) {
            questionRef.current.value = "";
        }
    }
    const clearInputFiles = () => {
        if (fileInput.current) {
            fileInput.current.value = "";
        }
    }
    const handleAsk = async () => {
        clearInputQuestion();
        clearInputFiles();
        if (files.length === 0 || !question) return;
        // nếu ko có chatSessionSelected thì tạo mới cuộc trò chuyện
        if (!chatSessionSelected) {
            await initChatSession();
            return;
        }
    };
    const deleteListFileCloudAI = async (files: AssistantFile[]) => {
        for (let i = 0; i < files.length; i++) {
            await deleteFileStorageAi(files[i].name);
        }
    }


    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-neutral-light dark:bg-gray-900">
            {/* Sidebar */}
            <div className="w-full md:w-64 md:mt-20 dark:bg-gray-900 flex-shrink-0">
                <SidebarChatList
                    chatSelected={chatSessionSelected}
                    onChatSelect={handleChatSelect}
                    onChatDelete={handleChatDelete}
                    chatSessionsPage={chatSessionPage}
                    onLoadMore={() => setPageSessionNumber((prev) => prev + 1)}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 sm:px-6 md:px-10 py-6">
                <div className="px-4 sm:px-6 py-6 space-y-6 bg-white dark:bg-gray-900 rounded-2xl mt-4 md:mt-12 shadow-xl border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-white tracking-tight">
                        🤖 Trợ lý Tài Liệu Thông Minh
                    </h1>

                    <div className="relative h-[24rem] sm:h-96 overflow-y-auto bg-neutral-100 dark:bg-neutral-800 p-4 sm:p-5 rounded-xl space-y-4 border border-gray-200 dark:border-gray-700 shadow-inner custom-scrollbar">
                        {conversations.map((conv) => (
                            <div key={conv.id} className="space-y-4">
                                {/* User question */}
                                <div className="flex justify-end">
                                    <div className="max-w-[90%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap shadow-md bg-primary text-white rounded-br-none">
                                        <ReactMarkdown>{conv.question}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* Assistant answer */}
                                {conv.answer && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[90%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap shadow-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none">
                                            <ReactMarkdown>{conv.answer}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="max-w-[90%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none">
                                    <TypingIndicator />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />

                        {/* Góc dưới bên phải hiển thị danh sách file đã upload */}

                    </div>

                    <div className="space-y-4">
                        {/* Upload tài liệu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tải tệp tài liệu của bạn (.pdf)
                            </label>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInput.current?.click()}
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary hover:bg-primary-dark text-white transition"
                                    title="Tải tài liệu lên"
                                >
                                    <Plus size={20} />
                                </button>

                                {files.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 bg-gray-100 dark:bg-neutral-700 px-3 py-1.5 rounded-lg w-full sm:w-auto">
                                        <FileText size={20} className="text-primary" />
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="text-sm text-gray-800 dark:text-white truncate max-w-[150px]">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(file)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                    title="Xóa tệp"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <input
                                multiple
                                ref={fileInput}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* Nhập câu hỏi */}
                        <div>
                            <textarea
                                ref={questionRef}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Nhập câu hỏi của bạn về tài liệu..."
                                rows={3}
                                className="w-full resize-none bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/50 rounded-xl p-4 border border-gray-300 dark:border-gray-600 transition"
                            />
                        </div>
                        <div className="absolute bottom-4 right-20">
                            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-64 max-w-full">
                                <button
                                    onClick={() => setShowUploadedFiles(!showUploadedFiles)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-t-xl transition w-full"
                                >
                                    <FileText size={16} />
                                    <span>Các file đã tải lên</span>
                                    <ChevronDown
                                        size={16}
                                        className={`ml-auto transition-transform ${showUploadedFiles ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {showUploadedFiles && (
                                    <div className="max-h-48 sm:max-h-64 overflow-y-auto border-t border-gray-200 dark:border-gray-600">
                                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                            {assistantFileUploaded.map((file) => (
                                                <li
                                                    key={file.id}
                                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700  truncate"
                                                    title={file.originalFileName}
                                                >
                                                    📎 {file.originalFileName}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Nút gửi câu hỏi */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleAsk}
                            disabled={files.length === 0 || !question || loading}
                            className={`inline-flex items-center px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200 ${files.length === 0 || !question || loading
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
