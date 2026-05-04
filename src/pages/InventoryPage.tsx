import { useState, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getProducts, addProduct, updateProduct, deleteProduct, type Product, getAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Search, Pencil, Trash2, AlertTriangle, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const categories = ["Groceries", "Beverages", "Bakery", "Household", "Electronics", "Other"];

const InventoryPage = () => {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const authRecord = getAuth() || {};
  const isAdmin = authRecord?.role === "admin";
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", category: "Groceries", price: "", cost: "", stock: "", reorderLevel: "", image: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () => setProducts(getProducts());

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: "", sku: "", category: "Groceries", price: "", cost: "", stock: "", reorderLevel: "", image: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, sku: p.sku, category: p.category, price: String(p.price), cost: String(p.cost), stock: String(p.stock), reorderLevel: String(p.reorderLevel), image: p.image || "" });
    setDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm({ ...form, image: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) { toast.error("Name and SKU are required"); return; }
    const data = { name: form.name.trim(), sku: form.sku.trim(), category: form.category, price: Number(form.price) || 0, cost: Number(form.cost) || 0, stock: Number(form.stock) || 0, reorderLevel: Number(form.reorderLevel) || 0, image: form.image || undefined };
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      toast.success("Product updated");
    } else {
      addProduct(data);
      toast.success("Product added");
    }
    refresh();
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    toast.success("Product deleted");
    refresh();
  };

  const getStockStatus = (p: Product) => {
    if (p.stock <= 0) return { label: "Out of Stock", cls: "bg-destructive/10 text-destructive" };
    if (p.stock <= p.reorderLevel) return { label: "Low Stock", cls: "bg-warning/10 text-warning" };
    return { label: "In Stock", cls: "bg-success/10 text-success" };
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Inventory</h1>
            <p className="text-sm text-muted-foreground">{products.length} products</p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add Product</Button>
              </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] mx-2 sm:mx-0 sm:max-w-lg max-h-[90dvh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-sm">Product Image</Label>
                  <div className="flex items-center gap-4">
                    {form.image ? (
                      <div className="relative group">
                        <img 
                          src={form.image} 
                          alt="Product preview" 
                          className="h-24 w-24 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-24 w-24 rounded-lg border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted transition-colors"
                      >
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Add image</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {form.image ? "Change Image" : "Upload Image"}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1.5">Max 2MB. JPG, PNG, or WebP.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">SKU</Label>
                    <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU001" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Selling Price</Label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Cost Price</Label>
                    <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Stock Qty</Label>
                    <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Reorder Level</Label>
                    <Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} placeholder="5" />
                  </div>
                </div>
                <Button type="submit" className="w-full">{editingProduct ? "Update" : "Add"} Product</Button>
              </form>
            </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground w-14">Image</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Price</th>
                  {isAdmin && <th className="text-right p-3 font-medium text-muted-foreground">Cost</th>}
                  <th className="text-right p-3 font-medium text-muted-foreground">Stock</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  {isAdmin && <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>}
                </tr>
              </thead>
              <tbody className="stagger-container" style={{ "--stagger-delay": "30ms" } as React.CSSProperties}>
                {filtered.map((p) => {
                  const status = getStockStatus(p);
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-all duration-200 table-row-enter">
                      <td className="p-3">
                        {p.image ? (
                          <img 
                            src={p.image} 
                            alt={p.name}
                            className="h-10 w-10 object-cover rounded-md border border-border transition-transform duration-200 hover:scale-110"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center transition-transform duration-200 hover:scale-110">
                            <Package className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-medium text-foreground">{p.name}</td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                      <td className="p-3 text-muted-foreground">{p.category}</td>
                      <td className="p-3 text-right text-foreground">ZMK {p.price.toFixed(2)}</td>
                      {isAdmin && <td className="p-3 text-right text-muted-foreground">ZMK {p.cost.toFixed(2)}</td>}
                      <td className="p-3 text-right font-medium text-foreground">{p.stock}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${status.cls}`}>
                          {p.stock <= p.reorderLevel && <AlertTriangle className="h-3 w-3" />}
                          {status.label}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="hover:scale-110 transition-transform"><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive hover:scale-110 transition-transform"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 9 : 7} className="p-8 text-center text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default InventoryPage;
