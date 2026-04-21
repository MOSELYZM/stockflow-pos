import { useNavigate } from "react-router-dom";
import { Shield, Users, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import logo from "@/assets/stockflow-logo.png";
import { getSettings } from "@/lib/store";

const Index = () => {
  const navigate = useNavigate();
  const settings = getSettings();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl animate-fade-in-up">
        {/* Logo */}
        <div className="relative mt-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-success/20 rounded-2xl blur-xl animate-pulse-soft" />
          <img 
            src={settings.logo || logo} 
            alt="Store Logo" 
            className="relative h-24 w-24 object-contain rounded-2xl shadow-lg ring-2 ring-white/50" 
          />
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium text-primary mb-2">
            <Sparkles className="h-3 w-3" />
            <span>Inventory Management System</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            {settings.businessName}
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Streamline your business operations with our modern inventory and point-of-sale solution
          </p>
        </div>

        {/* Login Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full stagger-container" style={{ "--stagger-delay": "100ms" } as React.CSSProperties}>
          <button
            onClick={() => navigate("/admin-login")}
            className="group relative overflow-hidden rounded-2xl glass-card p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover-lift-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 group-hover:scale-105 transition-all duration-300">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">Admin Portal</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Full access to manage inventory, reports & settings</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/staff-login")}
            className="group relative overflow-hidden rounded-2xl glass-card p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover-lift-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-lg shadow-success/20 group-hover:shadow-success/30 group-hover:scale-105 transition-all duration-300">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-success transition-colors">Staff Access</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Sales, inventory lookup & daily operations</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-success opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-muted-foreground">First time here?</p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin-signup")}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Register your Business
          </Button>
        </div>

        <div className="mt-8 mb-8 text-center space-y-1">
          <div className="overflow-hidden whitespace-nowrap">
            <p className="text-[10px] text-muted-foreground/60 italic animate-marquee inline-block">developed by mosely hakanene</p>
          </div>
          <p className="text-xs text-muted-foreground mt-4">© {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
