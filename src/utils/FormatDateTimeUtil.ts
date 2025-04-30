export const formatDateTime=(dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');     // Ngày
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng (getMonth() trả về từ 0-11)
    const year = date.getFullYear();                         // Năm
    const hours = String(date.getHours()).padStart(2, '0');   // Giờ
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Phút

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}