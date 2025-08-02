import React, { useRef, useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ArrowDown, ChevronDown, FileText, Plus, SendHorizonalIcon, X } from "lucide-react";
import { SidebarChatList } from "../components/SidebarChatList";
import { AssistantFile } from "../types/AssistantFile";
import { addAssistantFiles, getAssistantFilesByChatSessionId } from "../services/AssistantFileApi";
import { PageResponse } from "../types/PageResponse";
import { Conversation } from "../types/Conversation";
import { addConversation, getConversations } from "../services/ConversationApi";
import { ChatSessionDto } from "../types/ChatSessionDto";
import { getChatSessions, createChatSession, delChatSession, getChatSessionByDocId, updateChatSession } from "../services/ChatSessionApi";
import { ChatSessionInit } from "../types/ChatSessionInit";
import { TypingIndicator } from "../components/TypingIndicator";
import { useSearchParams } from "react-router-dom";
import { fetchDocAsFilePdf } from "../services/DocumentApi";
import FullScreenLoading from "../components/FullScreenLoading";
import { useFullscreenLoading } from "../hooks/UseFullscreenLoading";
import { motion, AnimatePresence } from "framer-motion";

const DocumentQA: React.FC = () => {
    // ====== STATE ======
    const [question, setQuestion] = useState("");
    const [model, setModel] = useState("gemini-2.5-flash-lite-preview-06-17");
    const [textAreaValue, setTextAreaValue] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [chatSelected, setChatSelected] = useState<ChatSessionDto | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filesInput, setFilesInput] = useState<File[]>([]);
    const [filesUploaded, setFilesUploaded] = useState<AssistantFile[]>([]);
    const [showUploadedFiles, setShowUploadedFiles] = useState(false);
    const [pageSessionNumber, setPageSessionNumber] = useState(0);
    const [searchParams] = useSearchParams();
    const documentId = searchParams.get("documentId");
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
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

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
        e.target.value = "";
    };

    const handleRemoveFileSelected = (file: File) => {
        setFilesInput((prev) => prev.filter((f) => f !== file));
        if (filesInputRef.current) filesInputRef.current.value = "";
    };

    const clearInputFiles = () => {
        filesInputRef.current && (filesInputRef.current.value = "")
        setFilesInput([]);
    };

    // ====== CONVERSATION ======
    const generateContentTimeSecond = async (answer: string) => {
        let index = 0;
        let newText = "";
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
    const {
        isLoading,
        message,
        startLoading,
        stopLoading,
    } = useFullscreenLoading();
    //====== DELETE CHAT SESSION ======
    const handleChatDelete = async (id: number) => {
        startLoading("Đang xóa cuộc trò chuyện...");

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
                setQuestion("");
                setShowUploadedFiles(false);
                setLoading(false);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Lỗi khi xóa cuộc trò chuyện.");
        } finally {
            stopLoading();
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
        setQuestion("");
        setTextAreaValue("");
        setShowUploadedFiles(false);
        setLoading(false);
    };


    // ====== INIT CHAT ======
    const initChatSession = async () => {
        setLoading(true);
        const assistantFiles: AssistantFile[] = [];
        try {
            setConversations([{ id: null, question, answer: "", chatSessionId: null }]);            // Upload files
            const filesWillUpload = [...filesInput];
            setFilesInput([]);
            for (const file of filesWillUpload) {
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
                    documentId: documentId ? Number(documentId) : null,
                });
            }
            console.log("assistantFiles", assistantFiles);
            const parts = assistantFiles.map((f) => ({
                fileData: { fileUri: f.uri, mimeType: f.mimeType?.split(";")[0] },
            }));
            const response = await ai.models.generateContentStream({
                model: model,
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
                // setFilesSelected([]);
                generateContentTimeSecond(conversation.answer);
            } else {
                toast.error("Lỗi khi khởi tạo cuộc trò chuyện.");
                deleteListFileCloudAI(assistantFiles);
            }
        } catch (err) {
            deleteListFileCloudAI(assistantFiles);
            console.error(err);
            toast.error("Đã xảy ra lỗi trong quá trình khởi tạo cuộc trò chuyện.");
        } finally {
            setLoading(false);
        }
    };
    // ====== SAVE FILES UPLOADED GEN AI TO DB======
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
        clearInputFiles();
        if (!question || (filesInput.length === 0 && filesUploaded.length === 0)) return;

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
            const filesWillUpload = [...filesInput];
            setFilesInput([]);
            for (const file of filesWillUpload) {
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
                    documentId: documentId ? Number(documentId) : null,
                });
            }
            // CHUA CAC FILE DA UPLOAD LEN CLOUD AI VA LUU VAO DATABASE
            const assistantFilesUploaded = await saveGenAiFiles(genAiFiles);
            const tempFileUploaded = [...filesUploaded, ...assistantFilesUploaded]


            const parts = tempFileUploaded.map((f) => ({
                fileData: { fileUri: f.uri, mimeType: f.mimeType },
            }));

            const response = await ai.models.generateContentStream({
                model: model,
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
            // setTextAreaValue("");
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
        // setFilesSelected([]);
        setQuestion("");
        setShowUploadedFiles(false);
        setLoading(false);
        setConversations([]);
    }
    // Auto resize textarea
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto"; // Reset height
            textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 200)}px`; // 200px là chiều cao tối đa
        }
    }, [textAreaValue]);
    const handleKeyDown = (e: any) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if ((filesUploaded.length === 0 && filesInput.length === 0) || !question || loading) {
                toast.error("Vui lòng chọn tệp hoặc nhập câu hỏi.");
                return;
            }
            if (textAreaValue.trim() !== "") {
                handleAsk();
                setTextAreaValue("");
            }
        }
    };
    const [showScrollButton, setShowScrollButton] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const handleScroll = () => {
        if (!containerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

        // Hiện nút nếu không còn ở gần đáy
        setShowScrollButton(!isNearBottom);
    };


    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    };
    useEffect(() => {
        scrollToBottom(); // Scroll tới cuối khi render hoặc khi có tin nhắn mới
    }, [conversations, loading]);

    useEffect(() => {
        if (documentId) {
            getChatSessionByDocId(Number(documentId))
                .then((res) => {
                    if (res.status === 200) {
                        // Cập nhật chatSessionsPage trước khi select
                        setChatSessionPage(prev => ({
                            ...prev,
                            items: [res.data, ...prev.items]
                        }));
                        handleChatSelect(res.data);
                    } else {
                        fetchDocNotExisted();
                    }
                })
                .catch(() => {
                    toast.error("Lỗi khi tải cuộc trò chuyện.");
                })
        }
    }, [documentId]);

    const fetchDocNotExisted = async () => {
        startLoading("Đang chuyển đổi tài liệu...")
        try {
            const file = await fetchDocAsFilePdf(Number(documentId));
            if (file) {
                // Kiểm tra type của file, bỏ qua charset
                const fileType = file.type.split(';')[0];
                if (fileType !== "application/pdf") {
                    toast.error("Tài liệu không phải định dạng PDF.");
                    return;
                }
                // Tạo file mới với type đã được xử lý
                const fileWithCorrectType = new File([file], file.name, {
                    type: fileType
                });
                setFilesInput([fileWithCorrectType]);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Không thể tải tài liệu. Vui lòng thử lại.");
        } finally {
            stopLoading();
            const url = new URL(window.location.href);
            url.searchParams.delete("documentId");
            window.history.replaceState({}, "", url);
        }
    }
    const handleChatRename = (id: number, newName: string) => {
        if (newName) {
            updateChatSession(id, { name: newName, id: id })
                .then((res) => {
                    if (res.status === 200) {
                        setChatSessionPage((prev) => ({
                            ...prev,
                            items: prev.items.map((item) => (item.id === id ? { ...item, name: newName } : item))
                        }));
                    }
                })
                .catch(() => toast.error("Lỗi khi đổi tên cuộc trò chuyện."));
        }
    }
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
            {isLoading && <FullScreenLoading message={message} />}
            {/* Sidebar */}
            <div className="md:w-auto md:mt-20 dark:bg-gray-900 flex-shrink-0">
                <SidebarChatList
                    chatSelected={chatSelected}
                    onChatSelect={handleChatSelect}
                    onChatDelete={handleChatDelete}
                    onCreateNewChat={handleCreateNewChat}
                    chatSessionsPage={chatSessionPage}
                    onChatRename={handleChatRename}
                    onLoadMore={() => setPageSessionNumber((prev) => prev + 1)}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 sm:px-6 md:px-10 py-6">
                <div className="px-4 sm:px-6 py-6 space-y-6 bg-white dark:bg-gray-900 rounded-2xl mt-4 md:mt-12 shadow-xl border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600 tracking-tight">
                            Truy vấn tài liệu
                        </h1>
                        {chatSelected && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Cuộc trò chuyện: {chatSelected.name}
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <div
                            onScroll={handleScroll}
                            ref={containerRef}
                            className="h-[24rem] sm:h-96 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-5 rounded-xl space-y-4 border border-gray-200 dark:border-gray-700 shadow-inner custom-scrollbar"
                        >
                            {conversations.map((conv) => (
                                <motion.div
                                    key={conv.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="flex justify-end">
                                        <div className="max-w-[90%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none">
                                            <ReactMarkdown>{conv.question}</ReactMarkdown>
                                        </div>
                                    </div>

                                    {conv.answer && (
                                        <div className="flex justify-start">
                                            <div className="max-w-[90%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap shadow-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-600">
                                                <ReactMarkdown>{conv.answer}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[90%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-600">
                                        <TypingIndicator />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {showScrollButton && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                onClick={scrollToBottom}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                                aria-label="Scroll to bottom"
                            >
                                <ArrowDown size={20} />
                            </motion.button>
                        )}
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
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                                    title="Tải tài liệu lên"
                                >
                                    <Plus size={20} />
                                </button>

                                {filesInput.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg w-full sm:w-auto border border-gray-200 dark:border-gray-700">
                                        <FileText size={20} className="text-blue-500" />
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
                                onKeyDown={handleKeyDown}
                                onChange={(e) => {
                                    setQuestion(e.target.value);
                                    setTextAreaValue(e.target.value);
                                }}
                                rows={1}
                                placeholder="Hỏi bất kỳ điều gì"
                                className="custom-scrollbar w-full resize-none max-h-[200px] overflow-auto bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all duration-200"
                            />
                        </div>

                        <div className="relative">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-64 max-w-full">
                                <button
                                    onClick={() => setShowUploadedFiles(!showUploadedFiles)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-xl transition w-full"
                                >
                                    <FileText size={16} className="text-blue-500" />
                                    <span>Tài liệu đã tải lên</span>
                                    <ChevronDown
                                        size={16}
                                        className={`ml-auto transition-transform ${showUploadedFiles ? "rotate-180" : ""}`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {showUploadedFiles && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="max-h-48 sm:max-h-64 overflow-y-auto border-t border-gray-200 dark:border-gray-600">
                                                <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                                    {filesUploaded.map((file) => (
                                                        <li
                                                            key={file.id}
                                                            className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 truncate flex items-center gap-2"
                                                            title={file.originalFileName}
                                                        >
                                                            <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                                            <span className="truncate">{file.originalFileName}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Nút gửi câu hỏi */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleAsk}
                            disabled={(filesUploaded.length === 0 && filesInput.length === 0) || !question || loading}
                            className={`inline-flex items-center px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200 ${(filesUploaded.length === 0 && filesInput.length === 0) || !question || loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
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
