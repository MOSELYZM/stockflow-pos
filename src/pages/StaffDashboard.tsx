import { ShoppingCart, Package, Search, LogOut, TrendingUp, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTodaySales, getProducts, getSettings, getAuth } from "@/lib/store";
import logo from "@/assets/stockflow-logo.png";

const quickActions = [
  { title: "New Sale", description: "Process a new transaction", icon: ShoppingCart, color: "bg-primary/10 text-primary", url: "/admin/pos" },
  { title: "Check Stock", description: "Look up inventory levels", icon: Package, color: "bg-success/10 text-success", url: "/admin/inventory" },
  { title: "Search Product", description: "Find product by name or SKU", icon: Search, color: "bg-warning/10 text-warning", url: "/admin/inventory" },
];

const StaffDashboard = () => {
  const navigate = useNavigate();
  const settings = getSettings();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  
  const authRecord: any = getAuth() || {};
  const staffId = authRecord?.identifier;
  
  const todaysSales = getTodaySales().filter(s => s.staffId === staffId);
  const totalTransactions = todaysSales.length;
  const totalSalesAmount = todaysSales.reduce((sum, s) => sum + s.total, 0);

  const [search, setSearch] = useState("");
  const products = getProducts();
  const filteredProducts = search.trim() === "" ? [] : products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="h-14 flex items-center justify-between border-b border-border px-4 lg:px-6 bg-card">
        <div className="flex items-center gap-3">
          <img src={logo} alt="StockFlow" className="h-8 w-8" />
          <div>
            <p className="text-sm font-semibold text-foreground">{settings.businessName} Staff</p>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate("/")}>
          <LogOut className="h-3.5 w-3.5" /> Logout
        </Button>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-2xl font-bold text-foreground">Welcome back 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">What would you like to do today?</p>
        </div>

        {/* Today's Performance */}
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Sales Today</p>
                <p className="text-2xl font-bold text-foreground">ZMK {totalSalesAmount.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Transactions</p>
                <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Card key={action.title} onClick={() => navigate(action.url)} className="animate-in zoom-in-95 duration-500 cursor-pointer hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 transition-all">
              <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Search */}
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Quick search products by name or SKU..." 
                className="pl-9" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {search.trim() !== "" && (
              <div className="mt-4 space-y-2 max-h-48 overflow-auto border-t border-border pt-4">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-4">No products found matching "{search}"</p>
                ) : (
                  filteredProducts.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">ZMK {p.price.toFixed(2)}</p>
                        <p className={`text-xs font-medium ${p.stock <= p.reorderLevel ? 'text-warning' : 'text-success'}`}>{p.stock} in stock</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StaffDashboard;
