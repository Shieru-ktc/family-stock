import { SidebarTrigger } from "../ui/sidebar";

export default function NavBar() {
  return (
    <nav className="bg-slate-700 p-4 text-white font-light shadow-xl px-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="h-8 w-8" />
          <div className="text-2xl">App Name</div>
        </div>
      </div>
    </nav>
  );
}
