import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransition } from "@/components/page-transition";
import { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import StaffLogin from "./pages/StaffLogin";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import InventoryPage from "./pages/InventoryPage";
import POSPage from "./pages/POSPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import ExpensesPage from "./pages/ExpensesPage";
import MobileMoneyPage from "./pages/MobileMoneyPage";
import CustomersPage from "./pages/CustomersPage";
import ReportsPage from "./pages/ReportsPage";
import UploadPage from "./pages/UploadPage";
import SettingsPage from "./pages/SettingsPage";
import StaffManagementPage from "./pages/StaffManagementPage";
import ZRADashboard from "./pages/ZRADashboard";
import AdminSignup from "./pages/AdminSignup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// AnimatedRoutes wraps routes with PageTransition
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/pos" element={<POSPage />} />
        <Route path="/admin/inventory" element={<InventoryPage />} />
        <Route path="/admin/sales" element={<SalesHistoryPage />} />
        <Route path="/admin/expenses" element={<ExpensesPage />} />
        <Route path="/admin/mobile-money" element={<MobileMoneyPage />} />
        <Route path="/admin/customers" element={<CustomersPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/upload" element={<UploadPage />} />
        <Route path="/admin/zra" element={<ZRADashboard />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/staff" element={<StaffManagementPage />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash ? (
            <SplashScreen onComplete={handleSplashComplete} />
          ) : (
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
