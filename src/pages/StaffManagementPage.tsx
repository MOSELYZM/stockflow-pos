import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getStaff, addStaff, updateStaff, deleteStaff, getSales, type Staff } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, BarChart2 } from "lucide-react";
import { toast } from "sonner";

const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState<Staff[]>(getStaff());
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportStaff, setReportStaff] = useState<Staff | null>(null);
  const [reportTimeframe, setReportTimeframe] = useState("week");

  const [formData, setFormData] = useState({
    name: "",
    staffId: "",
    password: "",
    role: "Cashier",
    status: "active",
  });

  const getReportCutoff = (tf: string) => {
    const now = new Date();
    if (tf === "today") return new Date(now.setHours(0,0,0,0));
    if (tf === "week") return new Date(now.setDate(now.getDate() - 7));
    if (tf === "month") return new Date(now.setMonth(now.getMonth() - 1));
    return new Date(0); // all
  };

  const getStaffReport = (staffId: string, tf: string) => {
    const cutoff = getReportCutoff(tf);
    const relatedSales = getSales().filter(s => s.staffId === staffId && new Date(s.date) >= cutoff);
    
    let totalRevenue = 0;
    const itemMap: Record<string, { name: string, quantity: number, revenue: number }> = {};
    
    relatedSales.forEach(s => {
      totalRevenue += s.total;
      s.items.forEach(item => {
        if (!itemMap[item.productId]) itemMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        itemMap[item.productId].quantity += item.quantity;
        itemMap[item.productId].revenue += (item.price * item.quantity);
      });
    });

    return {
      revenue: totalRevenue,
      transactions: relatedSales.length,
      items: Object.values(itemMap).sort((a,b) => b.revenue - a.revenue)
    };
  };

  const reportData = reportStaff ? getStaffReport(reportStaff.staffId, reportTimeframe) : null;

  const filtered = staffList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.staffId.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDialog = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        staffId: staff.staffId,
        password: staff.password || "",
        role: staff.role,
        status: staff.status,
      });
    } else {
      setEditingStaff(null);
      
      const currentStaff = getStaff();
      let lastNum = 0;
      currentStaff.forEach(s => {
        if (s.staffId.startsWith("STF-")) {
          const num = parseInt(s.staffId.replace("STF-", ""));
          if (!isNaN(num) && num > lastNum) lastNum = num;
        }
      });
      const nextId = `STF-${String(lastNum + 1).padStart(3, "0")}`;
      const genPassword = Math.random().toString(36).slice(-8).toUpperCase();

      setFormData({ name: "", staffId: nextId, password: genPassword, role: "Cashier", status: "active" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.staffId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingStaff) {
      updateStaff(editingStaff.id, formData);
      toast.success("Staff updated successfully");
    } else {
      // Check if ID exists
      if (staffList.some(s => s.staffId === formData.staffId)) {
        toast.error("Staff ID already exists");
        return;
      }
      addStaff(formData);
      toast.success("Staff added successfully");
    }

    setStaffList(getStaff());
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      deleteStaff(id);
      setStaffList(getStaff());
      toast.success("Staff member deleted");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Add, edit, and manage staff access.</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" /> Add Staff
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg">Staff Directory</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No staff members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium text-foreground">{staff.staffId}</TableCell>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${staff.role === "Manager" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                            {staff.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${staff.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                            {staff.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{staff.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => { setReportStaff(staff); setIsReportOpen(true); setReportTimeframe("week"); }}>
                              <BarChart2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(staff)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(staff.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="e.g. John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Staff ID</Label>
                <Input value={formData.staffId} disabled className="bg-muted font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Auto-Generated Password</Label>
                <Input value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="font-mono text-primary font-bold" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-primary/5 p-2 rounded border border-primary/10">
              Please share these exact credentials with the staff member. They will need both the ID and the Password to log in.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cashier">Cashier</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingStaff ? "Save Changes" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{reportStaff?.name}'s Performance Report</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto py-4 space-y-6">
            <div className="flex justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing data for <span className="font-medium text-foreground">{reportStaff?.staffId}</span>
              </div>
              <Select value={reportTimeframe} onValueChange={setReportTimeframe}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportData && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-primary/5 border-primary/10">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                      <p className="text-xl font-bold text-primary">ZMK {reportData.revenue.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-success/5 border-success/10">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Transactions</p>
                      <p className="text-xl font-bold text-success">{reportData.transactions}</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3 border-b border-border pb-2">Items Sold Summary</h3>
                  {reportData.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No items sold in this period.</p>
                  ) : (
                    <div className="space-y-2">
                      {reportData.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.quantity} units</p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">ZMK {item.revenue.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default StaffManagementPage;
