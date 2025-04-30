import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { OnlyOfficeConfig } from "../types/OnlyOfficeConfig";
import { getOnlyOfficeConfig } from "../services/DocumentApi";
import { toast } from "sonner";



const OnlyOfficeEditor = () => {
    const { documentId } = useParams<{ documentId: string }>(); // Lấy documentId từ URL
    const [config, setConfig] = useState<OnlyOfficeConfig | null>(null);
    const navigate = useNavigate();
    // Lấy thông tin cấu hình từ backend
    useEffect(() => {
        if (documentId) {
            getOnlyOfficeConfig(Number(documentId))
                .then((response) => {
                    if (response.status === 200) {
                        setConfig(response.data);
                    } else {
                        toast.error(response.message); // Hiển thị thông báo lỗi nếu không thành công
                        navigate("/"); // Điều hướng về trang chính nếu có lỗi
                    }
                }).catch((error) => {
                    console.error("Lỗi khi lấy cấu hình OnlyOffice:", error);
                    toast.error("Lỗi khi lấy cấu hình tài liệu.");
                    navigate("/"); // Điều hướng về trang chính nếu có lỗi
                })
        }
    }, [documentId]);

    if (!config) return <div>Loading...</div>; // Đợi khi cấu hình tài liệu được tải về

    const handleSave = (event: any) => {
        console.log("Tài liệu đã được lưu", event);
        // Kiểm tra payload sự kiện
        // Có thể gửi yêu cầu API để lưu tài liệu vào backend
    };
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <DocumentEditor
                id="docxEditor"
                documentServerUrl="http://localhost/"
                config={{
                    document: {
                        fileType: config.fileType,  // Dựa trên cấu hình
                        key: config.documentKey,    // Dựa trên cấu hình
                        title: config.documentTitle, // Dựa trên cấu hình
                        url: config.documentUrl,    // Dựa trên cấu hình
                    },
                    documentType: config.documentType, // Dựa trên cấu hình
                    editorConfig: {
                        mode: config.permissions.edit ? "edit" : "view", // Chế độ chỉnh sửa nếu người dùng có quyền edit
                        user: {
                            id: config.user.id,
                            name: config.user.name,
                        },
                        callbackUrl: "https://c7e1-1-53-53-57.ngrok-free.app/api/v1/documents/save-editor",
                        customization: {
                            forcesave: true, // Tự động lưu nếu cần
                        }
                    }
                }}
                width="100%"
                height="100%"
            />
        </div>
    );
};

export default OnlyOfficeEditor;
