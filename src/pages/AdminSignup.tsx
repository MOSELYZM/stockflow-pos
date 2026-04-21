import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, getSettings, saveSettings, addStaff, saveAdminAccount } from "@/lib/store";
import { toast } from "sonner";

const AdminSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !location.trim() || !adminName.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      // 1. Save Business Settings
      const settings = await getSettings();
      await saveSettings({ ...settings, businessName: businessName.trim(), location: location.trim() });

      // 2. Register Admin Account & Staff Role
      await saveAdminAccount({
        email: email.trim(),
        password: password.trim(),
        adminName: adminName.trim(),
      });

      await addStaff({
        name: adminName.trim(),
        staffId: email.trim(),
        role: "Manager",
        status: "active"
      });

      // 3. Login
      login("admin", email.trim());
      toast.success("Business registered successfully! Welcome to StockFlow.");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error('Error during signup:', error);
      toast.error("An error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="animate-fade-in w-full max-w-lg">
        <div className="bg-card rounded-lg border border-border shadow-sm p-8">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Register Your Business</h1>
              <p className="text-sm text-muted-foreground mt-1">Set up your company and create an admin account.</p>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Business Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-sm font-medium">Business Name</Label>
                  <Input id="businessName" placeholder="e.g. My Fast Mart" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                  <Input id="location" placeholder="e.g. Lusaka, Zambia" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Admin Account</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="adminName" className="text-sm font-medium">Full Name</Label>
                  <Input id="adminName" placeholder="e.g. Jane Doe" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Admin Email / ID</Label>
                  <Input id="email" type="email" placeholder="admin@stockflow.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2">Create Account</Button>
          </form>

          <div className="mt-6 text-center text-sm border-t border-border pt-6">
            <span className="text-muted-foreground">Already set up? </span>
            <Link to="/admin-login" className="text-primary hover:underline font-medium transition-colors">Sign in here</Link>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
