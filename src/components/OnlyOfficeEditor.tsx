import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { useEffect, useRef, useState } from "react";

interface OnlyOfficeEditorProps {
    documentUrl: string;
    documentKey: string;
    documentTitle: string;
    user: {
        id: string;
        name: string;
    };
}



const OnlyOfficeEditor: React.FC<OnlyOfficeEditorProps> = ({
    documentUrl,
    documentKey,
    documentTitle,
    user,
}) => {
    // Hàm xử lý khi có sự kiện "save" từ OnlyOffice
    const handleSave = (event: any) => {
        console.log("Tài liệu đã được lưu", event);
        // Kiểm tra payload sự kiện
    };
    return (
        <DocumentEditor
            id="docxEditor"
            documentServerUrl="http://localhost/"
            config={{
                document: {
                    fileType: "docx",
                    key: documentKey,  // sử dụng documentKey từ props
                    title: documentTitle,  // sử dụng documentTitle từ props
                    url: documentUrl,  // sử dụng documentUrl từ props
                },
                documentType: "word",
                editorConfig: {
                    mode: "edit",
                    user: user,
                    callbackUrl: "https://3566-58-186-78-141.ngrok-free.app/api/v1/documents/save-editor",
                }
            }}
        />

    );
};

export default OnlyOfficeEditor;
