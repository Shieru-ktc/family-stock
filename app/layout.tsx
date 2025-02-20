import "./globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";

import NavBar from "@/components/navbar/Navbar";
import AppSidebar from "@/components/sidebar/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";

import { Toaster } from "@/components/ui/toaster";
import Providers from "./providers";

const notoSansJP = localFont({
    src: "./fonts/NotoSansJP.ttf",
    variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
    title: "Family Stock",
    description: "家庭用の在庫管理アプリ",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${notoSansJP.variable} antialiased transition-all duration-200`}
            >
                {children}
            </body>
        </html>
    );
}
