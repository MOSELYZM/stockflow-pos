import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getCustomers, addCustomer, deleteCustomer, type Customer } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, UsersRound, Search, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>(getCustomers());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const refresh = () => setCustomers(getCustomers());

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    addCustomer({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() });
    toast.success("Customer added");
    refresh();
    setDialogOpen(false);
    setForm({ name: "", phone: "", email: "" });
  };

  const handleDelete = (id: string) => { deleteCustomer(id); toast.success("Customer deleted"); refresh(); };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Customers</h1>
            <p className="text-sm text-muted-foreground">{customers.length} customers</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Customer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-sm">Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Customer name" />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>
                <Button type="submit" className="w-full">Add Customer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone || "—"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {c.email || "—"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive h-7 w-7 p-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Spent</span>
                <span className="text-sm font-semibold text-foreground">ZMK {c.totalSpent.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground bg-card rounded-lg border border-border">
              <UsersRound className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No customers found
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomersPage;
