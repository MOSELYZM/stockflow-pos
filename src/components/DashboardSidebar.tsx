import {
  LayoutDashboard, ShoppingCart, Package, History,
  Receipt, Smartphone, UsersRound, BarChart3, Upload, Settings, UserCircle, LogOut,
  Lock
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { logout, getSettings, getAuth, getFeatureAccess } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";
import { SubscriptionBadge } from "./subscription-banner";
import logo from "@/assets/stockflow-logo.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "sonner";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  requires?: keyof ReturnType<typeof getFeatureAccess>;
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "New Sale (POS)", url: "/admin/pos", icon: ShoppingCart, requires: "pos" },
  { title: "Inventory", url: "/admin/inventory", icon: Package },
  { title: "Sales History", url: "/admin/sales", icon: History, requires: "reports" },
  { title: "Expenses", url: "/admin/expenses", icon: Receipt },
  { title: "Mobile Money", url: "/admin/mobile-money", icon: Smartphone },
  { title: "Customers", url: "/admin/customers", icon: UsersRound, requires: "customers" },
  { title: "Staff", url: "/admin/staff", icon: UserCircle, requires: "staff" },
  { title: "Reports", url: "/admin/reports", icon: BarChart3, requires: "reports" },
  { title: "Upload & Analyse", url: "/admin/upload", icon: Upload, requires: "analytics" },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const DashboardSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const authRecord = getAuth() || {};
  const isAdmin = authRecord?.role === "admin";
  const navigate = useNavigate();
  const settings = getSettings();
  const featureAccess = getFeatureAccess();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLockedFeature = (itemTitle: string) => {
    toast.error(`${itemTitle} requires a subscription. Please upgrade your plan.`, {
      action: {
        label: "View Plans",
        onClick: () => navigate("/admin/dashboard"),
      },
    });
  };

  // Filter items based on role and subscription
  let visibleItems = isAdmin
    ? navItems
    : navItems
        .filter((item) => ["Dashboard", "New Sale (POS)", "Inventory", "Customers", "Sales History"].includes(item.title))
        .map((item) => item.title === "Dashboard" ? { ...item, url: "/staff/dashboard" } : item);

  // Further filter based on subscription
  visibleItems = visibleItems.filter((item) => {
    if (item.requires && !featureAccess[item.requires]) {
      return false;
    }
    return true;
  });

  return (
    <Sidebar collapsible="icon" className="border-r border-white/20 glass">
      <div className="p-4 flex items-center gap-3 border-b border-white/20">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
          <img
            src={settings.logo || logo}
            alt={settings.businessName}
            className="relative h-10 w-10 shrink-0 object-contain rounded-lg shadow-sm ring-2 ring-white/30"
          />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{settings.businessName}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground truncate">{settings.location}</p>
              <SubscriptionBadge />
            </div>
          </div>
        )}
      </div>
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="group">
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 relative overflow-hidden"
                      activeClassName="bg-primary/15 text-primary font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-primary before:rounded-r-full"
                    >
                      <div className="relative">
                        <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                      </div>
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Show locked items for trial users */}
              {isAdmin && navItems
                .filter(item => item.requires && !featureAccess[item.requires])
                .map(item => (
                  <SidebarMenuItem key={`locked-${item.title}`}>
                    <SidebarMenuButton
                      onClick={() => handleLockedFeature(item.title)}
                      className="group opacity-50 cursor-not-allowed"
                    >
                      <div className="relative flex items-center gap-3 px-3 py-2.5 w-full">
                        <Lock className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate text-sm">{item.title}</span>}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4 border-t border-white/20">
        <div className={`flex items-center mb-3 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && <span className="text-xs text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all duration-200 relative overflow-hidden group ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && (
          <div className="mt-4 text-center">
            <p className="text-[10px] text-muted-foreground/40 italic">developed by Hakanene mosely</p>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default DashboardSidebar;
