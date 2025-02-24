import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";

export const metadata: Metadata = {
    title: "Family Stock",
    description: "家庭用の在庫管理アプリ",
};
const notoSans = Noto_Sans_JP({
    subsets: ["latin"],
    fallback: ["Noto Sans JP"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${notoSans.className} antialiased transition-all duration-200`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    storageKey="theme"
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
