export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');     // Ngày
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng (getMonth() trả về từ 0-11)
    const year = date.getFullYear();                         // Năm
    const hours = String(date.getHours()).padStart(2, '0');   // Giờ
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Phút

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0'); // Ngày
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng
    const year = date.getFullYear(); // Năm

    return `${day}/${month}/${year}`;  // Định dạng ngày/tháng/năm (DD/MM/YYYY)
}

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};