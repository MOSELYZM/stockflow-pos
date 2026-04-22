import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, type Database } from "@/lib/supabase";
import { Building, Users, TrendingUp, DollarSign, Activity, Search, Filter } from "lucide-react";
import { toast } from "sonner";

type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

const SuperAdminDashboard = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "trial" | "expired">("all");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      toast.error("Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
      return;
    }
    loadTenants();
    loadSubscriptions();
  }, []);

  const loadTenants = async () => {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error("Error loading tenants:", error);
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    }
  };

  const getTenantSubscription = (tenantId: string) => {
    return subscriptions.find(sub => sub.tenant_id === tenantId);
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const subscription = getTenantSubscription(tenant.id);
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "active" && subscription?.status === "active" && subscription?.tier !== "trial") ||
                          (statusFilter === "trial" && subscription?.tier === "trial") ||
                          (statusFilter === "expired" && subscription?.status === "expired");
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = tenants.length * 200; // Simplified calculation
  const activeTenants = tenants.length;
  const trialTenants = subscriptions.filter(s => s.tier === "trial").length;
  const paidTenants = subscriptions.filter(s => s.tier !== "trial" && s.status === "active").length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor all StockFlow tenants</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Super Admin
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">{activeTenants}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trial Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                <p className="text-2xl font-bold">{trialTenants}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <p className="text-2xl font-bold">{paidTenants}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <p className="text-2xl font-bold">ZMW {totalRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by business name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants List */}
        <Card>
          <CardHeader>
            <CardTitle>All Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading tenants...</p>
            ) : filteredTenants.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No tenants found</p>
            ) : (
              <div className="space-y-4">
                {filteredTenants.map((tenant) => {
                  const subscription = getTenantSubscription(tenant.id);
                  return (
                    <div key={tenant.id} className="border rounded-lg p-4 hover:bg-muted/50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{tenant.business_name}</h3>
                            <Badge variant={
                              subscription?.tier === "trial" ? "secondary" :
                              subscription?.status === "active" ? "default" : "destructive"
                            }>
                              {subscription?.tier || "Trial"}
                            </Badge>
                            <Badge variant="outline">
                              {subscription?.status || "Unknown"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{tenant.location}</p>
                          <div className="flex gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Currency:</span> {tenant.currency}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tax Rate:</span> {tenant.tax_rate}%
                            </div>
                            {tenant.tin && (
                              <div>
                                <span className="text-muted-foreground">TIN:</span> {tenant.tin}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Joined: {new Date(tenant.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {subscription && (
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Monthly Fee:</span> ZMW {subscription.monthly_fee}
                              </div>
                              {subscription.subscription_end_date && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Renewal:</span>{" "}
                                  {new Date(subscription.subscription_end_date).toLocaleDateString()}
                                </div>
                              )}
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
