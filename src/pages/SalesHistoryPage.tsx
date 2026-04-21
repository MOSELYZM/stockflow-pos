import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getSales, type Sale } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";

const SalesHistoryPage = () => {
  const allSales = getSales();
  const authRecord = JSON.parse(localStorage.getItem("sf_auth") || "{}");
  const isStaff = authRecord?.role === "staff";
  const staffId = authRecord?.identifier;

  const [sales] = useState<Sale[]>(isStaff ? allSales.filter(s => s.staffId === staffId) : allSales);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = sales.filter((s) => {
    const matchSearch = s.customer.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchMethod = methodFilter === "all" || s.paymentMethod === methodFilter;
    return matchSearch && matchMethod;
  });

  const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Sales History</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} transactions · Total: ZMK {totalRevenue.toFixed(2)}</p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by customer or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Payment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="MOBILE MONEY">Mobile Money</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Sale ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Payment</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <>
                  <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                    <td className="p-3 font-mono text-xs text-foreground">{s.id}</td>
                    <td className="p-3 text-muted-foreground">{new Date(s.date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className="p-3 text-foreground">{s.customer}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.paymentMethod === "MOBILE MONEY" ? "bg-success/10 text-success" : s.paymentMethod === "CARD" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold text-foreground">ZMK {s.total.toFixed(2)}</td>
                    <td className="p-3">{expandedId === s.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</td>
                  </tr>
                  {expandedId === s.id && (
                    <tr key={`${s.id}-items`}>
                      <td colSpan={6} className="p-3 bg-muted/20">
                        <div className="space-y-1">
                          {s.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{item.productName} × {item.quantity}</span>
                              <span className="text-foreground">ZMK {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-40" />No sales found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SalesHistoryPage;
