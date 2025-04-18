/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}", // 👈 bắt buộc với CRA
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#2563eb", // màu xanh (giống hover:text-blue-600)
                    light: "#3b82f6",    // màu sáng hơn
                    dark: "#1e40af",     // màu đậm hơn
                },
                secondary: {
                    DEFAULT: "#facc15", // ví dụ: vàng cho folder
                },
                neutral: {
                    light: "#f9fafb",
                    dark: "#1f2937",
                },
            },
        },
    },
    plugins: [],
}
