import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { OnlyOfficeConfig } from "../types/OnlyOfficeConfig";
interface EditorProps {
    config: OnlyOfficeConfig | null;
}
export const Editor: React.FC<EditorProps> = ({ config }) => {
    const baseUrl = "https://page-surprising-kde-controlled.trycloudflare.com";
    if (!config) {
        return <div>No config</div>;
    }
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
                            id: config.user?.id,
                            name: config.user?.name,
                        },
                        callbackUrl: `${baseUrl}/api/v1/documents/save-editor/${localStorage.getItem("accessToken")}`,
                        customization: {
                            forcesave: true,
                        }
                    }
                }}
                width="100%"
                height="100%"
            />
        </div>
    );
};