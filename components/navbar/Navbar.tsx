import { SidebarTrigger } from "../ui/sidebar";

export default function NavBar() {
    return (
        <nav className="bg-orange-300 p-4 px-8 font-light shadow-xl dark:bg-gray-900 dark:text-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <SidebarTrigger className="h-8 w-8" />
                    <div className="text-2xl">Family Stock</div>
                </div>
            </div>
        </nav>
    );
}
