import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getMobileMoneyTransactions, type MobileMoneyTransaction } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Smartphone, CheckCircle, Clock, XCircle } from "lucide-react";

const MobileMoneyPage = () => {
  const [transactions] = useState<MobileMoneyTransaction[]>(getMobileMoneyTransactions());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = transactions.filter((t) => {
    const matchSearch = t.transactionId.toLowerCase().includes(search.toLowerCase()) || t.phone.includes(search);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCompleted = filtered.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0);

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle className="h-4 w-4 text-success" />;
    if (status === "pending") return <Clock className="h-4 w-4 text-warning" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const statusCls = (status: string) => {
    if (status === "completed") return "bg-success/10 text-success";
    if (status === "pending") return "bg-warning/10 text-warning";
    return "bg-destructive/10 text-destructive";
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2"><Smartphone className="h-5 w-5" /> Mobile Money Transactions</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} transactions · Completed: ZMK {totalCompleted.toFixed(2)}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by transaction ID or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Transaction ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs text-foreground">{t.transactionId}</td>
                  <td className="p-3 text-muted-foreground">{new Date(t.date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="p-3 text-foreground">{t.phone}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCls(t.status)}`}>
                      {statusIcon(t.status)} {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-semibold text-foreground">ZMK {t.amount.toFixed(2)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><Smartphone className="h-8 w-8 mx-auto mb-2 opacity-40" />No transactions found</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MobileMoneyPage;
