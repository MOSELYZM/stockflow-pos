import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { RefreshCw, Plus, ShoppingCart, Receipt, Smartphone, TrendingUp, AlertTriangle, ArrowRight, Banknote, CreditCard, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { getTodaySales, getTodayExpenses, getLowStockProducts, getLast7DaysData, getTopProducts, getTodayMobileMoney, getSettings, getAuth, getAdminAccount, getSubscription, getDaysRemaining, getSubscriptionStatusText } from "@/lib/store";
import { SubscriptionModal } from "@/components/subscription-modal";

const COLORS = ["hsl(160, 84%, 39%)", "hsl(217, 91%, 60%)", "hsl(38, 92%, 50%)", "hsl(350, 89%, 60%)", "hsl(270, 50%, 60%)"];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getUserName = () => {
  const auth = getAuth();
  const admin = getAdminAccount();
  if (auth?.role === "admin" && admin?.adminName) {
    return admin.adminName;
  }
  return auth?.identifier?.split("@")[0] || "Admin";
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [, setRefresh] = useState(0);
  const doRefresh = () => setRefresh((n) => n + 1);
  const [showSubModal, setShowSubModal] = useState(false);

  const settings = getSettings();
  const todaySales = getTodaySales();
  const todayExpenses = getTodayExpenses();
  const lowStock = getLowStockProducts();
  const chartData = getLast7DaysData();
  const topProducts = getTopProducts();
  const mobileMoneyToday = getTodayMobileMoney();
  const subscription = getSubscription();
  const daysRemaining = getDaysRemaining();
  const subStatus = getSubscriptionStatusText();
  const userName = getUserName();

  const totalSalesToday = todaySales.reduce((sum, s) => sum + s.total, 0);
  const totalExpensesToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalSalesToday - totalExpensesToday;
  const cashToday = todaySales.filter(s => s.paymentMethod === "CASH").reduce((sum, s) => sum + s.total, 0);
  const cardToday = todaySales.filter(s => s.paymentMethod === "CARD").reduce((sum, s) => sum + s.total, 0);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const statCards = [
    { label: "SALES TODAY", value: `${settings.currency} ${totalSalesToday.toFixed(2)}`, sub: `${todaySales.length} transactions`, icon: ShoppingCart, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-500/10", textColor: "text-blue-600" },
    { label: "CASH RECEIVED", value: `${settings.currency} ${cashToday.toFixed(2)}`, sub: null, icon: Banknote, color: "from-emerald-500 to-emerald-600", bgColor: "bg-emerald-500/10", textColor: "text-emerald-600" },
    { label: "MOBILE MONEY", value: `${settings.currency} ${mobileMoneyToday.toFixed(2)}`, sub: null, icon: Smartphone, color: "from-violet-500 to-violet-600", bgColor: "bg-violet-500/10", textColor: "text-violet-600" },
    { label: "BANK / CARD", value: `${settings.currency} ${cardToday.toFixed(2)}`, sub: null, icon: CreditCard, color: "from-amber-500 to-amber-600", bgColor: "bg-amber-500/10", textColor: "text-amber-600" },
    { label: "EXPENSES TODAY", value: `${settings.currency} ${totalExpensesToday.toFixed(2)}`, sub: null, icon: Receipt, color: "from-rose-500 to-rose-600", bgColor: "bg-rose-500/10", textColor: "text-rose-600" },
    { label: "EST. PROFIT", value: `${settings.currency} ${profit.toFixed(2)}`, sub: "Sales minus expenses", icon: TrendingUp, color: "from-cyan-500 to-cyan-600", bgColor: "bg-cyan-500/10", textColor: "text-cyan-600" },
  ];

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-4 lg:px-6 glass border-b border-white/20 shrink-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-lg font-bold text-foreground">{getGreeting()}, {userName} 👋</h1>
                <p className="text-xs text-muted-foreground">{today}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-1.5 glass" onClick={doRefresh}>
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
              <Button size="sm" variant="gradient" className="gap-1.5 shine" onClick={() => navigate("/admin/pos")}>
                <Plus className="h-3.5 w-3.5" /> New Sale
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-container" style={{ "--stagger-delay": "75ms" } as React.CSSProperties}>
              {statCards.map((s) => (
                <Card
                  key={s.label}
                  className="glass-card border-0 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 hover-lift-shadow cursor-pointer"
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${s.color} shadow-lg`}>
                      <s.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                      {s.sub && <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Subscription Card */}
              <Card
                className={`glass-card border-0 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 hover-lift-shadow cursor-pointer ${
                  subscription?.status === "expired" ? "border-destructive" :
                  daysRemaining <= 2 ? "border-warning" : "border-success"
                }`}
                onClick={() => setShowSubModal(true)}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${
                    subscription?.tier === "premium" ? "from-amber-500 to-amber-600" :
                    subscription?.tier === "basic" ? "from-blue-500 to-blue-600" :
                    "from-emerald-500 to-emerald-600"
                  } shadow-lg`}>
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {subscription?.tier === "trial" ? "FREE TRIAL" :
                       subscription?.tier === "basic" ? "BASIC PLAN" : "PREMIUM PLAN"}
                    </p>
                    <p className={`text-lg font-bold mt-1 ${subStatus.color}`}>{subStatus.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {subscription?.status === "expired" ? "Click to renew" :
                       subscription?.tier === "trial" ? "Upgrade to continue" : "K200/month"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2 glass-card border-0 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    7-Day Sales vs Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Line type="monotone" dataKey="sales" stroke="hsl(var(--success))" strokeWidth={3} dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={3} dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Top Products (7 days)
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-72">
                  {topProducts.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={topProducts} dataKey="total" nameKey="name" innerRadius={50} outerRadius={70} paddingAngle={3}>
                            {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(0,0,0,0.1)',
                              borderRadius: '12px'
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 w-full mt-2">
                        {topProducts.map((p, i) => (
                          <div key={p.name} className="flex items-center gap-3 text-sm">
                            <span className="h-3 w-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-muted-foreground truncate flex-1">{p.name}</span>
                            <span className="font-bold text-foreground">{settings.currency} {p.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">No sales data yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="animate-in fade-in slide-in-from-left-4 duration-700 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Recent Sales</CardTitle>
                  <button onClick={() => navigate("/admin/sales")} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                    View all <ArrowRight className="h-3 w-3" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {todaySales.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No sales today</p>}
                  {todaySales.slice(0, 4).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-success/10 flex items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{sale.customer}</p>
                          <p className="text-xs text-muted-foreground">{sale.id} · {new Date(sale.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{settings.currency} {sale.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{sale.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="animate-in fade-in slide-in-from-right-4 duration-700 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold">Low Stock Alerts</CardTitle>
                    {lowStock.length > 0 && (
                      <span className="h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">{lowStock.length}</span>
                    )}
                  </div>
                  <button onClick={() => navigate("/admin/inventory")} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                    Manage <ArrowRight className="h-3 w-3" />
                  </button>
                </CardHeader>
                <CardContent>
                  {lowStock.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">All stock levels are healthy</p>}
                  {lowStock.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-warning/10 flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.category} · SKU: {p.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-destructive">{p.stock} pcs</p>
                        <p className="text-xs text-muted-foreground">Reorder at {p.reorderLevel}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      <SubscriptionModal open={showSubModal} onOpenChange={setShowSubModal} />
    </SidebarProvider>
  );
};

export default AdminDashboard;
