import Sidebar from "@/app/features/shell/components/Sidebar";
import AiChat from "@/app/features/aichat/ai-chat";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <section className="flex min-w-0 flex-1 flex-col">{children}</section>
      <AiChat />
    </div>
  );
}
