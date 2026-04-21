import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getSettings, saveSettings, type AppSettings } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { logout } from "@/lib/store";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      await saveSettings(settings);
      toast.success("Settings saved");
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleReset = () => {
    // Clear all data
    localStorage.clear();
    toast.success("All data has been reset");
    window.location.href = "/";
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in max-w-2xl">
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5" /> Settings
        </h1>

        {/* Business Settings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4 items-end mb-4">
              <div className="h-16 w-16 bg-muted border border-border rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                {settings.logo ? <img src={settings.logo} alt="Logo" className="h-full w-full object-contain" /> : <div className="text-xs text-muted-foreground">Logo</div>}
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-sm">Store Logo</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="text-xs"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setSettings({ ...settings, logo: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Business Name</Label>
              <Input value={settings.businessName} onChange={(e) => setSettings({ ...settings, businessName: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Location</Label>
              <Input value={settings.location} onChange={(e) => setSettings({ ...settings, location: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm">Currency</Label>
                <Select value={settings.currency} onValueChange={(v) => setSettings({ ...settings, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZMK">ZMK - Zambian Kwacha</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Tax Rate (%)</Label>
                <Input type="number" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Settings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inventory Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm">Default Low Stock Threshold</Label>
              <Input type="number" value={settings.lowStockThreshold} onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })} />
              <p className="text-xs text-muted-foreground">Products below this stock level will trigger alerts</p>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Money Receiving Accounts */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Mobile Money Receiving Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4">Set the official merchant IDs or phone numbers where customer payments should be deposited.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                <h4 className="font-medium text-sm">MTN Merchant</h4>
                <div className="space-y-1">
                  <Label className="text-xs">Number</Label>
                  <Input placeholder="e.g. 096..." value={settings.mtnNumber || ""} onChange={(e) => setSettings({ ...settings, mtnNumber: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Registered Name</Label>
                  <Input placeholder="e.g. Your Business Name" value={settings.mtnName || ""} onChange={(e) => setSettings({ ...settings, mtnName: e.target.value })} />
                </div>
              </div>
              
              <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                <h4 className="font-medium text-sm">Airtel Merchant</h4>
                <div className="space-y-1">
                  <Label className="text-xs">Number</Label>
                  <Input placeholder="e.g. 097..." value={settings.airtelNumber || ""} onChange={(e) => setSettings({ ...settings, airtelNumber: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Registered Name</Label>
                  <Input placeholder="e.g. Your Business Name" value={settings.airtelName || ""} onChange={(e) => setSettings({ ...settings, airtelName: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                <h4 className="font-medium text-sm">Zamtel Merchant</h4>
                <div className="space-y-1">
                  <Label className="text-xs">Number</Label>
                  <Input placeholder="e.g. 095..." value={settings.zamtelNumber || ""} onChange={(e) => setSettings({ ...settings, zamtelNumber: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Registered Name</Label>
                  <Input placeholder="e.g. Your Business Name" value={settings.zamtelName || ""} onChange={(e) => setSettings({ ...settings, zamtelName: e.target.value })} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save Settings
          </Button>
          <Button variant="outline" onClick={handleLogout} className="gap-1.5">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </Button>
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Reset all data to defaults. This action cannot be undone.</p>
            <Button variant="destructive" size="sm" onClick={handleReset}>Reset All Data</Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
