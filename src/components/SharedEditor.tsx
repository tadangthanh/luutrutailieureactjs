import { useParams } from "react-router-dom";
import { Editor } from "./Editor";
import { useEffect, useState } from "react";
import { OnlyOfficeConfig } from "../types/OnlyOfficeConfig";
import { accessSharedLink } from "../services/SharedLinkApi";

export const SharedEditor: React.FC = () => {
    const { token } = useParams();
    const [config, setConfig] = useState<OnlyOfficeConfig | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            accessSharedLink(token)
                .then((response) => {
                    if (response.status === 200) {
                        const config: OnlyOfficeConfig = response.data;
                        setConfig(config);
                    } else {
                        setError(response.message);
                    }
                })
                .catch((error) => {
                    setError("Không thể lấy cấu hình editor");
                });
        }
    }, [token]);
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
        <div>
            <Editor config={config} />
        </div>
    )
}