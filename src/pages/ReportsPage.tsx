import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getSales, getExpenses, getProducts } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { TrendingUp, TrendingDown, Package, ShoppingCart } from "lucide-react";

const COLORS = ["hsl(160, 84%, 39%)", "hsl(217, 91%, 60%)", "hsl(38, 92%, 50%)", "hsl(350, 89%, 60%)", "hsl(270, 50%, 60%)"];

const ReportsPage = () => {
  const [period, setPeriod] = useState("7");
  const sales = getSales();
  const expenses = getExpenses();
  const products = getProducts();

  const cutoffDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - Number(period));
    return d;
  }, [period]);

  const periodSales = sales.filter((s) => new Date(s.date) >= cutoffDate);
  const periodExpenses = expenses.filter((e) => new Date(e.date) >= cutoffDate);

  const totalRevenue = periodSales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const avgSale = periodSales.length ? totalRevenue / periodSales.length : 0;

  // Sales by payment method
  const byMethod = useMemo(() => {
    const map: Record<string, number> = {};
    periodSales.forEach((s) => { map[s.paymentMethod] = (map[s.paymentMethod] || 0) + s.total; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [periodSales]);

  // Expense by category
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    periodExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [periodExpenses]);

  // Daily revenue bar chart
  const dailyData = useMemo(() => {
    const days: { day: string; revenue: number; expenses: number }[] = [];
    for (let i = Number(period) - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      const revenue = sales.filter((s) => s.date.startsWith(dateStr)).reduce((sum, s) => sum + s.total, 0);
      const exp = expenses.filter((e) => e.date.startsWith(dateStr)).reduce((sum, e) => sum + e.amount, 0);
      days.push({ day: dayName, revenue, expenses: exp });
    }
    return days;
  }, [period, sales, expenses]);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Reports</h1>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase">Revenue</p>
              <p className="text-xl font-bold text-foreground mt-1">ZMK {totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-success flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" />{periodSales.length} sales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase">Expenses</p>
              <p className="text-xl font-bold text-foreground mt-1">ZMK {totalExpenses.toFixed(2)}</p>
              <p className="text-xs text-destructive flex items-center gap-1 mt-1"><TrendingDown className="h-3 w-3" />{periodExpenses.length} entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase">Net Profit</p>
              <p className={`text-xl font-bold mt-1 ${profit >= 0 ? "text-success" : "text-destructive"}`}>ZMK {profit.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Revenue - Expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase">Avg Sale</p>
              <p className="text-xl font-bold text-foreground mt-1">ZMK {avgSale.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{products.length} products</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Daily Revenue vs Expenses</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Sales by Payment Method</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              {byMethod.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byMethod} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {byMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No data for this period</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expense Breakdown */}
        {byCategory.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Expense Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {byCategory.sort((a, b) => b.value - a.value).map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-muted-foreground truncate">{cat.name}</div>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(cat.value / totalExpenses) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="text-sm font-medium text-foreground w-24 text-right">ZMK {cat.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
