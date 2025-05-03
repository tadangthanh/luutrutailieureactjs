export function getFileExtensionFromMimeType(mimeType: string): string {
    const mimeToExtension: { [key: string]: string } = {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/msword': 'doc',
        'application/pdf': 'pdf',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'text/plain': 'txt',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/svg+xml': 'svg',
        'application/zip': 'zip',
        'application/x-rar-compressed': 'rar',
        'application/x-7z-compressed': '7z'
    };

    return mimeToExtension[mimeType] || 'unknown';
}

export function getFileTypeName(mimeType: string): string {
    const mimeToName: { [key: string]: string } = {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
        'application/msword': 'Word',
        'application/pdf': 'PDF',
        'application/vnd.ms-excel': 'Excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
        'application/vnd.ms-powerpoint': 'PowerPoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
        'text/plain': 'Text',
        'image/jpeg': 'JPEG',
        'image/png': 'PNG',
        'image/gif': 'GIF',
        'image/svg+xml': 'SVG',
        'application/zip': 'ZIP',
        'application/x-rar-compressed': 'RAR',
        'application/x-7z-compressed': '7Z'
    };

    return mimeToName[mimeType] || 'Unknown';
}