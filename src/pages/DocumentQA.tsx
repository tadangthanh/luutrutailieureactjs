import React, { useRef, useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ChevronDown, FileText, Plus, SendHorizonalIcon, X } from "lucide-react";
import { SidebarChatList } from "../components/SidebarChatList";
import { AssistantFile } from "../types/AssistantFile";
import { addAssistantFiles, getAssistantFilesByChatSessionId } from "../services/AssistantFileApi";
import { PageResponse } from "../types/PageResponse";
import { Conversation } from "../types/Conversation";
import { addConversation, getConversations } from "../services/ConversationApi";
import { ChatSessionDto } from "../types/ChatSessionDto";
import { getChatSessions, createChatSession, delChatSession } from "../services/ChatSessionApi";
import { ChatSessionInit } from "../types/ChatSessionInit";
import { TypingIndicator } from "../components/TypingIndicator";

const DocumentQA: React.FC = () => {
    // ====== STATE ======
    const [question, setQuestion] = useState("");
    const [textAreaValue, setTextAreaValue] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [chatSelected, setChatSelected] = useState<ChatSessionDto | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filesSelected, setFilesSelected] = useState<File[]>([]);
    const [filesInput, setFilesInput] = useState<File[]>([]);
    const [filesUploaded, setFilesUploaded] = useState<AssistantFile[]>([]);
    const [showUploadedFiles, setShowUploadedFiles] = useState(false);
    const [pageSessionNumber, setPageSessionNumber] = useState(0);
    const [chatSessionPage, setChatSessionPage] = useState<PageResponse<ChatSessionDto>>({
        pageNo: 0,
        pageSize: 10,
        totalPage: 0,
        hasNext: false,
        totalItems: 0,
        items: [],
    });

    // ====== REF ======
    const filesInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // ====== GOOGLE GEN AI INSTANCE ======
    const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

    // ====== HANDLE FILE ======
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = Array.from(e.target.files || []);
        if (!fileList.length) return;

        for (const file of fileList) {
            if (file.type !== "application/pdf") {
                toast.error("Vui lòng chọn tệp PDF.");
                e.target.value = "";
                return;
            }
        }
        setFilesInput((prev) => [...prev, ...fileList]);
        setFilesSelected((prev) => [...prev, ...fileList]);
        e.target.value = "";
    };

    const handleRemoveFileSelected = (file: File) => {
        setFilesSelected((prev) => prev.filter((f) => f !== file));
        setFilesInput((prev) => prev.filter((f) => f !== file));
        if (filesInputRef.current) filesInputRef.current.value = "";
    };

    const clearInputQuestion = () => setTextAreaValue("");

    const clearInputFiles = () => {
        filesInputRef.current && (filesInputRef.current.value = "")
        setFilesInput([]);
    };

    // ====== UI UTILS ======
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // ====== CONVERSATION ======
    const generateContentTimeSecond = async (answer: string) => {
        let index = 0;
        let newText = "";
        scrollToBottom();

        const typeInterval = setInterval(() => {
            if (index < answer.length) {
                newText += answer[index++];
                setConversations((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];

                    if (last) {
                        updated[updated.length - 1] = { ...last, answer: newText };
                    } else {
                        updated.push({ id: null, question, answer: newText, chatSessionId: null });
                    }

                    return updated;
                });
            } else {
                clearInterval(typeInterval);
            }
        }, 10);
    };

    // ====== DELETE ======
    const deleteFileStorageAi = async (name?: string) => {
        if (name) await ai.files.delete({ name });
    };

    const deleteListFileCloudAI = async (files: AssistantFile[]) => {
        for (const file of files) {
            console.log(file.name);
            await deleteFileStorageAi(file.name);
        }
    };

    const handleChatDelete = async (id: number) => {
        const fileUploaded = await getAssistantFilesByChatSessionId(id)
            .then((res) => {
                if (res.data.status === 200) {
                    return res.data.data;
                } else {
                    toast.error("Lỗi khi tải danh sách file đã tải lên.");
                    return [];
                }
            }).catch(() => {
                toast.error("Lỗi khi tải danh sách file đã tải lên.");
                return [];
            })
        try {
            const res = await delChatSession(id);
            if (res.data.status === 200) {
                await deleteListFileCloudAI(fileUploaded);
                setChatSessionPage((prev) => ({
                    ...prev,
                    items: prev.items.filter((item) => item.id !== id),
                }));
                if (chatSelected?.id === id) setChatSelected(null);
                setConversations([]);
                setFilesUploaded([]);
                setFilesSelected([]);
                setQuestion("");
                setShowUploadedFiles(false);
                setLoading(false);
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Lỗi khi xóa cuộc trò chuyện.");
        }
    };

    // ====== SESSION ======
    const handleChatSelect = (chat: ChatSessionDto) => {
        setChatSelected(chat);
    };

    const handleCreateNewChat = () => {
        setChatSelected(null);
        setConversations([]);
        setFilesUploaded([]);
        setFilesInput([]);
        setFilesSelected([]);
        setQuestion("");
        setShowUploadedFiles(false);
        setLoading(false);
    };


    // ====== INIT CHAT ======
    const initChatSession = async () => {
        setLoading(true);
        try {
            setConversations([{ id: null, question, answer: "", chatSessionId: null }]);            // Upload files
            const assistantFiles: AssistantFile[] = [];
            for (const file of filesSelected) {
                const uploaded = await ai.files.upload({ file });
                if (!uploaded) {
                    toast.error(`Tải lên tệp ${file.name} thất bại.`);
                    return;
                }
                assistantFiles.push({
                    id: null,
                    name: uploaded.name,
                    uri: uploaded.uri,
                    mimeType: uploaded.mimeType,
                    originalFileName: file.name,
                    expirationTime: uploaded.expirationTime,
                    createTime: uploaded.createTime,
                    chatSessionId: 0,
                });
            }
            const parts = assistantFiles.map((f) => ({
                fileData: { fileUri: f.uri, mimeType: f.mimeType },
            }));

            const response = await ai.models.generateContentStream({
                model: "gemini-2.5-flash-preview-04-17",
                contents: {
                    role: "user",
                    parts: [...parts, { text: question }],
                },
                config: { responseMimeType: "text/plain" },
            });

            let fullText = "";
            for await (const chunk of response) {
                fullText += chunk.text || "";
            }

            const conversation: Conversation = { id: null, question, answer: fullText, chatSessionId: null };
            const chatSessionInit: ChatSessionInit = {
                name: question.slice(0, 20) + "...",
                assistantFiles,
                conversation,
            };

            const createRes = await createChatSession(chatSessionInit);
            if (createRes.data.status === 201) {
                const newChat = createRes.data.data;
                setChatSessionPage((prev) => ({ ...prev, items: [newChat, ...prev.items] }));
                setChatSelected(newChat);
                setQuestion("");
                setFilesSelected([]);
                generateContentTimeSecond(conversation.answer);
            } else {
                toast.error("Lỗi khi khởi tạo cuộc trò chuyện.");
                deleteListFileCloudAI(assistantFiles);
            }
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi trong quá trình khởi tạo cuộc trò chuyện.");
        } finally {
            setFilesSelected([]);
            setFilesInput([]);
            setTextAreaValue("");
            setLoading(false);
        }
    };
    const saveGenAiFiles = async (files: AssistantFile[]) => {
        const fileUploaded = await addAssistantFiles(files)
            .then((res) => {
                if (res.data.status === 201) {
                    return res.data.data;
                } else {
                    toast.error("Lỗi khi tải lên tệp.");
                    return [];
                }
            }).catch(() => {
                toast.error("Lỗi khi tải lên tệp.");
                return [];
            });
        setFilesUploaded((prev) => [...prev, ...fileUploaded]);
        return fileUploaded;
    }
    // ====== ASK ======
    const handleAsk = async () => {
        clearInputQuestion();
        clearInputFiles();
        if (!question || (filesSelected.length === 0 && filesUploaded.length === 0)) return;

        if (!chatSelected) {
            await initChatSession();
        } else {
            await continueAsk();
        }
    };
    const continueAsk = async () => {
        if (!chatSelected) return;
        setLoading(true);
        try {
            setConversations((prev) => [...prev, { id: null, question, answer: "", chatSessionId: chatSelected.id }]);
            const genAiFiles: AssistantFile[] = [];
            for (const file of filesSelected) {
                const uploaded = await ai.files.upload({ file });
                if (!uploaded) {
                    toast.error(`Tải lên tệp ${file.name} thất bại.`);
                    return;
                }
                genAiFiles.push({
                    id: null,
                    name: uploaded.name,
                    uri: uploaded.uri,
                    mimeType: uploaded.mimeType,
                    originalFileName: file.name,
                    expirationTime: uploaded.expirationTime,
                    createTime: uploaded.createTime,
                    chatSessionId: chatSelected.id,
                });
            }
            // CHUA CAC FILE DA UPLOAD LEN CLOUD AI VA LUU VAO DATABASE
            const assistantFilesUploaded = await saveGenAiFiles(genAiFiles);
            const tempFileUploaded = [...filesUploaded, ...assistantFilesUploaded]


            const parts = tempFileUploaded.map((f) => ({
                fileData: { fileUri: f.uri, mimeType: f.mimeType },
            }));

            const response = await ai.models.generateContentStream({
                model: "gemini-2.5-flash-preview-04-17",
                contents: {
                    role: "user",
                    parts: [...parts, { text: question }],
                },
                config: { responseMimeType: "text/plain" },
            });

            let fullText = "";
            for await (const chunk of response) {
                fullText += chunk.text || "";
            }

            const conversation: Conversation = { id: null, question, answer: fullText, chatSessionId: chatSelected.id };
            const conversationAdded = await addConversation(conversation)
                .then((res) => {
                    if (res.data.status === 201) {
                        return res.data.data;
                    } else {
                        toast.error("Lỗi khi thêm cuộc trò chuyện.");
                        return null;
                    }
                }).catch(() => {
                    toast.error("Lỗi khi thêm cuộc trò chuyện.");
                    return null;
                })
            if (conversationAdded) {
                setConversations((prev) => prev.map((conv) => (conv.id === null ? conversationAdded : conv)));
                generateContentTimeSecond(fullText);
            }
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi trong quá trình khởi tạo cuộc trò chuyện.");
        } finally {
            setFilesInput([]);
            setTextAreaValue("");
            setLoading(false);
        }
    }

    // ====== FETCH CHAT SESSION ======
    useEffect(() => {
        getChatSessions(pageSessionNumber, 10)
            .then((res) => {
                if (res.status === 200) {
                    const data = res.data.data;
                    setChatSessionPage((prev) => ({
                        ...prev,
                        items: [...prev.items, ...data.items],
                        pageNo: data.pageNo,
                        pageSize: data.pageSize,
                        totalPage: data.totalPage,
                        hasNext: data.hasNext,
                        totalItems: data.totalItems,
                    }));
                } else {
                    toast.error("Lỗi khi tải danh sách cuộc trò chuyện.");
                }
            })
            .catch(() => toast.error("Lỗi khi tải danh sách cuộc trò chuyện."))
    }, [pageSessionNumber]);

    // ====== LOAD CONVERSATION WHEN CHAT SELECTED ======

    useEffect(() => {
        if (!chatSelected) return;
        handleChangeChatSession();
        try {
            getConversations(chatSelected.id)
                .then((res) => {
                    if (res.status === 200) {
                        setConversations(res.data.data);
                    } else {
                        toast.error("Lỗi khi tải danh sách cuộc trò chuyện.");
                    }
                })
                .catch(() => toast.error("Lỗi khi tải danh sách cuộc trò chuyện."));

            getAssistantFilesByChatSessionId(chatSelected.id)
                .then((res) => {
                    if (res.status === 200) {
                        setFilesUploaded(res.data.data);
                    } else {
                        toast.error("Lỗi khi tải danh sách file đã tải lên.");
                    }
                })
                .catch(() => toast.error("Lỗi khi tải danh sách file đã tải lên."));
        } catch (error) {
            toast.error("Đã xảy ra lỗi trong quá trình tải danh sách file.");
        } finally {
            setLoading(false);
        }
    }, [chatSelected]);

    const handleChangeChatSession = () => {
        setFilesUploaded([]);
        setFilesInput([]);
        setFilesSelected([]);
        setQuestion("");
        setShowUploadedFiles(false);
        setLoading(false);
        setConversations([]);
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-neutral-light dark:bg-gray-900">
            {/* Sidebar */}
            <div className="w-full md:w-64 md:mt-20 dark:bg-gray-900 flex-shrink-0">
                <SidebarChatList
                    chatSelected={chatSelected}
                    onChatSelect={handleChatSelect}
                    onChatDelete={handleChatDelete}
                    onCreateNewChat={handleCreateNewChat}
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
                                    onClick={() => filesInputRef.current?.click()}
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary hover:bg-primary-dark text-white transition"
                                    title="Tải tài liệu lên"
                                >
                                    <Plus size={20} />
                                </button>

                                {filesInput.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 bg-gray-100 dark:bg-neutral-700 px-3 py-1.5 rounded-lg w-full sm:w-auto">
                                        <FileText size={20} className="text-primary" />
                                        {filesInput.map((file, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="text-sm text-gray-800 dark:text-white truncate max-w-[150px]">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFileSelected(file)}
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
                                ref={filesInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* Nhập câu hỏi */}
                        <div>
                            <textarea
                                ref={textAreaRef}
                                value={textAreaValue}
                                onChange={(e) => {
                                    setQuestion(e.target.value);
                                    setTextAreaValue(e.target.value);
                                }}
                                placeholder="Hỏi bất kỳ điều gì"
                                rows={3}
                                className="w-full resize-none bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/50 rounded-xl p-4 border border-gray-300 dark:border-gray-600 transition"
                            />
                        </div>
                        <div className=" bottom-4 right-20">
                            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-64 max-w-full">
                                <button
                                    onClick={() => setShowUploadedFiles(!showUploadedFiles)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-t-xl transition w-full"
                                >
                                    <FileText size={16} />
                                    <span>Tài liệu đã tải lên</span>
                                    <ChevronDown
                                        size={16}
                                        className={`ml-auto transition-transform ${showUploadedFiles ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {showUploadedFiles && (
                                    <div className="max-h-48 sm:max-h-64 overflow-y-auto border-t border-gray-200 dark:border-gray-600">
                                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                            {filesUploaded.map((file) => (
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
                            disabled={(filesUploaded.length === 0 && filesSelected.length === 0) || !question || loading}
                            className={`inline-flex items-center px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200 ${(filesUploaded.length === 0 && filesSelected.length === 0) || !question || loading
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
