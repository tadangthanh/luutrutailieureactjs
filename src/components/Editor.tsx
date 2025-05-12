import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { OnlyOfficeConfig } from "../types/OnlyOfficeConfig";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const Editor: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [config, setConfig] = useState<OnlyOfficeConfig | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const configParam = searchParams.get('config');
        if (configParam) {
            try {
                const decodedConfig = decodeURIComponent(configParam);
                const parsedConfig: OnlyOfficeConfig = JSON.parse(decodedConfig);
                console.log("url", encodeURI(parsedConfig.documentUrl))
                setConfig(parsedConfig);
            } catch (err) {
                setError("Không thể đọc cấu hình editor");
            }
        } else {
            setError("Không tìm thấy cấu hình editor");
        }
    }, [searchParams]);

    if (error) {
        return (
        <div className="flex items-center justify-center h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }
    const baseUrl = "https://clips-candles-denver-max.trycloudflare.com";
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <DocumentEditor
                id="docxEditor"
                documentServerUrl="http://localhost/"
                config={{
                    document: {
                        fileType: config.fileType,
                        key: config.documentKey,
                        title: config.documentTitle,
                        url: `${baseUrl}/api/v1/documents/${config.documentId}/download/${localStorage.getItem("accessToken")}`,
                    },
                    documentType: config.documentType,
                    editorConfig: {
                        mode: config.permissions.edit ? "edit" : "view",
                        user: {
                            id: config.user.id,
                            name: config.user.name,
                        },
                        callbackUrl: `${baseUrl}/api/v1/documents/save-editor/${localStorage.getItem("accessToken")}`,
                        customization: {
                            forcesave: true,
                        },
                    }
                }}
                width="100%"
                height="100%"
            />
        </div>
    );
};