import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, getStaff } from "@/lib/store";
import { toast } from "sonner";

const StaffLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const staffList = getStaff();
    const staffMember = staffList.find((s) => s.staffId === staffId.trim());
    
    if (!staffMember) {
      toast.error("Invalid Staff ID");
      return;
    }
    if (staffMember.status !== "active") {
      toast.error("This staff account is deactivated");
      return;
    }
    if (staffMember.password && staffMember.password !== password.trim()) {
      toast.error("Incorrect Password");
      return;
    }

    login("staff", staffMember.staffId);
    toast.success(`Welcome back, ${staffMember.name}!`);
    navigate("/staff/dashboard");
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="animate-fade-in w-full max-w-sm">
        <div className="bg-card rounded-lg border border-border shadow-sm p-8">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-success" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-foreground">Staff Login</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Sign in to access operations</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staffId" className="text-sm font-medium text-foreground">Staff ID</Label>
              <Input id="staffId" type="text" placeholder="e.g. STF-001" value={staffId} onChange={(e) => setStaffId(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-success hover:bg-success/90">Sign In</Button>
          </form>

          <p className="mt-4 text-xs text-center text-muted-foreground">Authorized Staff Only</p>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-success transition-colors">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
