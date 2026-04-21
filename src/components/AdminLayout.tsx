import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { ReactNode } from "react";
import { SubscriptionBanner } from "./subscription-banner";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <SubscriptionBanner />
          <header className="h-14 flex items-center border-b border-border px-4 lg:px-6 bg-card shrink-0">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
