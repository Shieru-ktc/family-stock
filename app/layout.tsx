import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";

const notoSansJP = localFont({
    src: "./fonts/NotoSansJP.ttf",
    variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
    title: "Family Stock",
    description: "家庭用の在庫管理アプリ",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${notoSansJP.variable} antialiased transition-all duration-200`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
