import { ThemeProvider } from "@/components/ThemeProvider";
import Providers from "../providers";
import { SidebarProvider } from "@/components/ui/sidebar";
import NavBar from "@/components/navbar/Navbar";
import AppSidebar from "@/components/sidebar/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Banner from "@/components/Banner";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers>
            <SidebarProvider defaultOpen>
                <AppSidebar />

                <div className="flex h-full min-h-screen w-full flex-col space-y-4">
                    <div>
                        <Banner />
                        <NavBar />
                    </div>

                    <div className="px-6 py-2">{children}</div>
                </div>
                <Toaster />
                <SonnerToaster />
            </SidebarProvider>
        </Providers>
    );
}
