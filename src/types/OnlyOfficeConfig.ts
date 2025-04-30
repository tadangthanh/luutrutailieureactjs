// Định nghĩa Permission
interface Permissions {
    edit: boolean;
    comment: boolean;
    download: boolean;
}

// Định nghĩa User
interface User {
    id: string;
    name: string;
}

// Định nghĩa cấu trúc OnlyOfficeConfig
export interface OnlyOfficeConfig {
    documentId: number;      // ID của tài liệu
    documentKey: string;     // Key duy nhất cho tài liệu
    documentTitle: string;   // Tiêu đề tài liệu
    fileType: string;        // Loại file (ví dụ: "docx", "pdf", "xlsx")
    documentType: string;    // Loại tài liệu cho OnlyOffice (ví dụ: "word", "pdf", "excel")
    documentUrl: string;     // URL để xem tài liệu
    callbackUrl: string;     // URL để nhận sự kiện "save" từ OnlyOffice

    permissions: Permissions; // Quyền của người dùng đối với tài liệu
    user: User;               // Thông tin người dùng
}
