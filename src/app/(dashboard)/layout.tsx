import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        <Topbar />
        <main className="flex-1 p-margin-desktop bg-background max-w-max-width mx-auto w-full">
          {children}
        </main>
      </div>
    </>
  );
}
