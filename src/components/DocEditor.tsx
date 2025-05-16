import { useSearchParams } from "react-router-dom";
import { OnlyOfficeConfig } from "../types/OnlyOfficeConfig";
import { useEffect, useState } from "react";
import { Editor } from "./Editor";
import { getOnlyOfficeConfig } from "../services/DocumentApi";

export const DocEditor: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [config, setConfig] = useState<OnlyOfficeConfig | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const docId = searchParams.get('docId');
        if (docId) {
            getOnlyOfficeConfig(Number(docId))
                .then((response) => {
                    if (response.status === 200) {
                        const config: OnlyOfficeConfig = response.data;
                        setConfig(config);
                    }
                })
                .catch((error) => {
                    setError("Không thể lấy cấu hình editor");
                });
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
    return (
        <>
            <Editor config={config} />
        </>
    )
}
