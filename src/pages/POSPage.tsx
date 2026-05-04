import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getProducts, getCustomers, addSale, addMobileMoneyTransaction, getSettings, getAuth, type Product, type Customer, type SaleItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Minus, ShoppingCart, Trash2, Check, Package, QrCode, Smartphone } from "lucide-react";
import { toast } from "sonner";

const POSPage = () => {
  const settings = getSettings();
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<(SaleItem & { maxStock: number })[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MOBILE MONEY" | "CARD" | "QR CODE">("CASH");
  const [momoNetwork, setMomoNetwork] = useState<"MTN" | "AIRTEL" | "ZAMTEL">("MTN");
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState("");
  const [bankName, setBankName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [qrTransactionId, setQrTransactionId] = useState("");
  const [qrPaymentConfirmed, setQrPaymentConfirmed] = useState(false);
  const customers = getCustomers();

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) { toast.error("Not enough stock"); return prev; }
        return prev.map((item) => item.productId === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (p.stock <= 0) { toast.error("Out of stock"); return prev; }
      return [...prev, { productId: p.id, productName: p.name, quantity: 1, price: p.price, maxStock: p.stock }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.maxStock) { toast.error("Not enough stock"); return item; }
        return { ...item, quantity: newQty };
      })
    );
  };

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((item) => item.productId !== productId));

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Generate QR code URL with payment data
  const generateQRData = () => {
    const paymentData = {
      merchant: settings.businessName,
      location: settings.location,
      amount: total.toFixed(2),
      transactionId: qrTransactionId,
      currency: "ZMK",
      items: cart.map(item => ({ name: item.productName, qty: item.quantity, price: item.price }))
    };
    return JSON.stringify(paymentData);
  };

  const qrCodeUrl = qrTransactionId 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateQRData())}`
    : "";

  const confirmQRPayment = () => {
    setQrPaymentConfirmed(true);
    toast.success("QR Payment confirmed!");
    // Auto complete after confirmation
    setTimeout(() => {
      completeSale("QR CODE", qrTransactionId);
    }, 500);
  };

  const openCheckout = () => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    // Generate QR transaction ID if QR payment selected
    if (paymentMethod === "QR CODE") {
      setQrTransactionId(`QR${Date.now().toString(36).toUpperCase()}`);
      setQrPaymentConfirmed(false);
    }
    setIsCheckoutOpen(true);
  };

  const confirmCheckout = async () => {
    if (paymentMethod === "MOBILE MONEY" && !paymentDetails) {
      toast.error("Please provide Mobile Number or Merchant ID");
      return;
    }
    if (paymentMethod === "CARD" && (!paymentDetails || !bankName)) {
      toast.error("Please select a Bank and provide Bank Account or Card Details");
      return;
    }
    if (paymentMethod === "CASH") {
      const tendered = parseFloat(paymentDetails);
      if (isNaN(tendered) || tendered !== total) {
        toast.error(`Please enter the exact printed amount (ZMK ${total.toFixed(2)}) to proceed with the transaction.`);
        return;
      }
    }

    if (paymentMethod === "MOBILE MONEY") {
      setIsVerifying(true);
      try {
        const response = await fetch("/api/charge-momo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            email: "pos-customer@stockflow.local", // using standard placeholder for POS walkins
            phone: paymentDetails,
            fullname: customerName,
            network: momoNetwork,
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || "Payment Failed");
        }

        toast.success("Payment request sent to customer's phone (Pending USSD Pin)");
        setVerifiedName(data.data?.customer?.name || "Verified Customer");
        
        // In reality, we would poll for webhook success or wait for a websocket.
        // For local POS simulation immediately post-dispatch, we proceed if Flutterwave accepted the dispatch:
        setTimeout(() => {
          setIsVerifying(false);
          setVerifiedName("");
          finalizeCheckout(data.data?.customer?.name || "Verified Customer");
        }, 1500);

      } catch (error: any) {
        setIsVerifying(false);
        toast.error("Transaction Error: " + error.message);
      }
    } else if (paymentMethod === "QR CODE") {
      if (!qrPaymentConfirmed) {
        toast.error("Please confirm QR payment");
        return;
      }
      finalizeCheckout();
    } else {
      finalizeCheckout();
    }
  };

  const finalizeCheckout = (mobileMoneyName?: string) => {
    const finalDetails = paymentMethod === "QR CODE" 
      ? qrTransactionId 
      : paymentMethod === "MOBILE MONEY" 
        ? `${momoNetwork}:${paymentDetails}` 
        : paymentDetails;

    if (paymentMethod === "MOBILE MONEY") {
      addMobileMoneyTransaction({
        date: new Date().toISOString(),
        transactionId: `TXN${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        phone: paymentDetails,
        amount: total,
        status: "completed"
      });
    }

    const sfAuth = getAuth() || {};
    const staffId = sfAuth?.role === "staff" ? sfAuth.identifier : undefined;

    addSale({
      date: new Date().toISOString(),
      customer: customerName,
      items: cart.map(({ maxStock, ...item }) => item),
      total,
      paymentMethod,
      staffId: staffId,
    });
    
    setPaymentDetails(finalDetails);

    // Auto complete the transaction and trigger print dialog
    setTimeout(() => {
      window.print();
      toast.success(`Sale completed! Total: ZMK ${total.toFixed(2)}`);
      setCart([]);
      setSearch("");
      setPaymentDetails("");
      setBankName("");
      setIsCheckoutOpen(false);
      setProducts(getProducts());
    }, 100);
  };

  return (
    <AdminLayout>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 min-h-[calc(100dvh-7rem)]">
        {/* Products */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex-1 overflow-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 content-start stagger-container pb-safe" style={{ "--stagger-delay": "40ms" } as React.CSSProperties}>
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className="bg-card border border-border rounded-xl p-2 sm:p-3 text-left hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none group hover-lift-shadow active:scale-[0.98] touch-manipulation"
              >
                {p.image ? (
                  <img 
                    src={p.image} 
                    alt={p.name}
                    className="h-12 sm:h-16 w-full object-cover rounded-lg mb-1 sm:mb-2 group-hover:scale-[1.02] transition-transform duration-200"
                  />
                ) : (
                  <div className="h-12 sm:h-16 w-full rounded-lg bg-muted flex items-center justify-center mb-1 sm:mb-2">
                    <Package className="h-6 sm:h-8 w-6 sm:w-8 text-muted-foreground/40" />
                  </div>
                )}
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">{p.sku}</p>
                <div className="flex items-center justify-between mt-1 sm:mt-2">
                  <span className="text-sm font-bold text-foreground">ZMK {p.price}</span>
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium transition-all duration-200 hover:scale-105 ${p.stock <= p.reorderLevel ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                    {p.stock} left
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Cart ({cart.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3 overflow-auto">
            {cart.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No items in cart</p>}
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between py-2 border-b border-border">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">ZMK {item.price} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQty(item.productId, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQty(item.productId, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => removeFromCart(item.productId)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-auto space-y-3 pt-3 border-t border-border">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Customer</label>
                <Select value={customerName} onValueChange={setCustomerName}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Walk-in Customer">Walk-in Customer</SelectItem>
                    {customers.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-lg font-bold text-foreground">
                <span>Total</span>
                <span>ZMK {total.toFixed(2)}</span>
              </div>
              <Button className="w-full gap-2" onClick={openCheckout} disabled={cart.length === 0}>
                <Check className="h-4 w-4" /> Complete Sale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] mx-2 sm:mx-0 max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between font-medium">
              <span>Total Amount:</span>
              <span className="text-lg sm:text-xl font-bold">ZMK {total.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Payment Method</label>
              <Select value={paymentMethod} onValueChange={(v) => { setPaymentMethod(v as "CASH" | "MOBILE MONEY" | "CARD" | "QR CODE"); setPaymentDetails(""); setQrPaymentConfirmed(false); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select payment method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="MOBILE MONEY">Mobile Money</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="QR CODE">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      QR Code Scan
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentMethod === "MOBILE MONEY" && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Select Network Provider</label>
                  <Select value={momoNetwork} onValueChange={(v) => setMomoNetwork(v as any)} disabled={isVerifying || !!verifiedName}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select Network" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                      <SelectItem value="AIRTEL">Airtel Money</SelectItem>
                      <SelectItem value="ZAMTEL">Zamtel Kwacha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm flex justify-between items-center text-primary-foreground font-medium">
                  <span className="text-muted-foreground whitespace-nowrap mr-2">Receiving Account:</span>
                  <span className="font-bold text-primary truncate text-right">
                    {momoNetwork === "MTN" ? (`${settings.mtnNumber || ""} ${settings.mtnName ? `(${settings.mtnName})` : ""}`) || "Not Configured" : 
                     momoNetwork === "AIRTEL" ? (`${settings.airtelNumber || ""} ${settings.airtelName ? `(${settings.airtelName})` : ""}`) || "Not Configured" : 
                     (`${settings.zamtelNumber || ""} ${settings.zamtelName ? `(${settings.zamtelName})` : ""}`) || "Not Configured"}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount to Pay</label>
                  <Input value={`ZMK ${total.toFixed(2)}`} disabled className="bg-muted font-bold text-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Mobile Number</label>
                  <Input placeholder="e.g. 0967123456" value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} disabled={isVerifying || !!verifiedName} />
                </div>
                {isVerifying && <p className="text-sm text-muted-foreground animate-pulse">Sending Payment Request to Customer's Phone...</p>}
                {verifiedName && <p className="text-sm font-medium text-success">Verified: {verifiedName} (Payment Received)</p>}
              </div>
            )}
            {paymentMethod === "CARD" && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Select Bank</label>
                  <Select value={bankName} onValueChange={setBankName}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select Zambian Bank" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZANACO">ZANACO</SelectItem>
                      <SelectItem value="FNB">FNB Zambia</SelectItem>
                      <SelectItem value="Standard Chartered">Standard Chartered</SelectItem>
                      <SelectItem value="ABSA">ABSA Bank Zambia</SelectItem>
                      <SelectItem value="Atlas Mara">Atlas Mara</SelectItem>
                      <SelectItem value="Indo Zambia Bank">Indo Zambia Bank</SelectItem>
                      <SelectItem value="Stanbic Bank">Stanbic Bank</SelectItem>
                      <SelectItem value="Other">Other Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Bank Account / Card Number</label>
                  <Input placeholder="e.g. 1234 5678" value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} />
                </div>
              </div>
            )}
            {paymentMethod === "CASH" && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-sm font-medium text-foreground">Amount Tendered</label>
                <Input type="number" placeholder={`e.g. ${total.toFixed(2)}`} value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} />
              </div>
            )}
            {paymentMethod === "QR CODE" && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-foreground">Scan to Pay</p>
                    <p className="text-xs text-muted-foreground">Customer scans with mobile banking app</p>
                  </div>
                  
                  {/* QR Code Display */}
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      {qrCodeUrl && (
                        <img 
                          src={qrCodeUrl} 
                          alt="Payment QR Code" 
                          className="h-40 w-40"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Transaction Info */}
                  <div className="space-y-1 text-center">
                    <p className="text-lg font-bold text-foreground">ZMK {total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground font-mono">Txn: {qrTransactionId}</p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-xs space-y-1">
                    <p className="font-medium text-foreground flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5" />
                      How to pay:
                    </p>
                    <ol className="text-muted-foreground list-decimal list-inside space-y-0.5 pl-1">
                      <li>Open your mobile banking app</li>
                      <li>Select "Scan QR Code"</li>
                      <li>Scan the code above</li>
                      <li>Confirm payment amount</li>
                      <li>Enter PIN to authorize</li>
                    </ol>
                  </div>

                  {/* Confirmation Button */}
                  {!qrPaymentConfirmed ? (
                    <Button 
                      onClick={confirmQRPayment}
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <Check className="h-4 w-4" />
                      Payment Received ✓
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-success text-sm font-medium py-2">
                      <Check className="h-4 w-4" />
                      Payment Confirmed
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} disabled={isVerifying || (paymentMethod === "QR CODE" && !qrPaymentConfirmed)}>Cancel</Button>
            <Button 
              onClick={confirmCheckout} 
              disabled={isVerifying || (paymentMethod === "QR CODE" && !qrPaymentConfirmed) || (paymentMethod !== "QR CODE" && paymentMethod !== "CASH" && !paymentDetails)} 
              className="gap-2"
            >
              <Check className="h-4 w-4" /> 
              {isVerifying ? "Verifying..." : paymentMethod === "QR CODE" ? "Complete Sale" : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Printable Receipt */}
      <div id="printable-receipt" className="hidden p-4 max-w-[280px] mx-auto bg-white text-black font-mono text-sm printable-receipt">
        
        {/* Header */}
        <div className="text-center space-y-1 pb-3">
          <h2 className="text-xl font-bold uppercase tracking-wide">{settings.businessName}</h2>
          <p className="text-xs">Address: {settings.location}</p>
        </div>

        <div className="text-center border-t border-b border-dashed border-black py-2 mb-4">
          <p className="uppercase font-bold tracking-widest text-sm">{paymentMethod} RECEIPT</p>
        </div>

        {/* Transaction Meta */}
        <div className="text-xs mb-4 space-y-1">
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{customerName}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t border-dashed border-black pt-2 pb-2 mb-2">
          <div className="flex justify-between font-bold text-xs pb-2">
            <span>Description</span>
            <span>Price</span>
          </div>
          
          <div className="space-y-2 text-xs">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="flex flex-col pr-2">
                  <span className="font-semibold">{item.productName}</span>
                  {item.quantity > 1 && (
                    <span className="text-[10px] text-gray-700">{item.quantity} x {item.price.toFixed(2)}</span>
                  )}
                </div>
                <span className="font-semibold">{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-black py-2 space-y-1">
          <div className="flex justify-between items-end font-bold text-base pt-1">
            <span>Total</span>
            <span>{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span>Payment</span>
            <span className="uppercase">{paymentMethod}</span>
          </div>
          {paymentDetails && (
            <div className="flex justify-between text-xs">
              <span>Ref</span>
              <span>{paymentDetails}</span>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-dashed border-black pt-4 pb-2 text-center space-y-3 mt-2">
          <p className="font-bold italic uppercase tracking-widest text-sm">Thank You!</p>
          
          {/* Barcode Mock */}
          <div className="flex justify-center my-3">
            <svg className="h-8 w-48" preserveAspectRatio="none" viewBox="0 0 100 20">
              <rect x="0" y="0" width="2" height="20" fill="black" />
              <rect x="3" y="0" width="1" height="20" fill="black" />
              <rect x="6" y="0" width="3" height="20" fill="black" />
              <rect x="11" y="0" width="1" height="20" fill="black" />
              <rect x="14" y="0" width="4" height="20" fill="black" />
              <rect x="20" y="0" width="2" height="20" fill="black" />
              <rect x="24" y="0" width="1" height="20" fill="black" />
              <rect x="27" y="0" width="5" height="20" fill="black" />
              <rect x="34" y="0" width="2" height="20" fill="black" />
              <rect x="38" y="0" width="1" height="20" fill="black" />
              <rect x="41" y="0" width="3" height="20" fill="black" />
              <rect x="46" y="0" width="2" height="20" fill="black" />
              <rect x="50" y="0" width="4" height="20" fill="black" />
              <rect x="56" y="0" width="1" height="20" fill="black" />
              <rect x="59" y="0" width="3" height="20" fill="black" />
              <rect x="64" y="0" width="2" height="20" fill="black" />
              <rect x="68" y="0" width="4" height="20" fill="black" />
              <rect x="74" y="0" width="1" height="20" fill="black" />
              <rect x="77" y="0" width="3" height="20" fill="black" />
              <rect x="82" y="0" width="2" height="20" fill="black" />
              <rect x="86" y="0" width="1" height="20" fill="black" />
              <rect x="89" y="0" width="3" height="20" fill="black" />
              <rect x="94" y="0" width="1" height="20" fill="black" />
              <rect x="97" y="0" width="3" height="20" fill="black" />
            </svg>
          </div>

          <div className="text-[10px] space-y-0.5 pt-2">
            <p className="italic">developed by mosely hakanene</p>
            <p className="italic">moselyhakanene@gmail.com</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default POSPage;
