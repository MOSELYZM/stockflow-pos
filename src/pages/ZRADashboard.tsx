import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  getSettings,
  getVATReport,
  getQuarterlyVATReport,
  getSales,
  generateZRAInvoice,
  type VATReport,
  type ZRAInvoice,
} from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, TrendingUp, AlertCircle, CheckCircle, Printer, Download } from "lucide-react";
import { ZRAInvoice as ZRAInvoiceComponent } from "@/components/ZRAInvoice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const ZRADashboard = () => {
  const [settings, setSettings] = useState(getSettings());
  const [currentReport, setCurrentReport] = useState<VATReport | null>(null);
  const [reportType, setReportType] = useState<"monthly" | "quarterly">("monthly");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [zraInvoice, setZRAInvoice] = useState<ZRAInvoice | null>(null);

  useEffect(() => {
    loadReport();
  }, [reportType, selectedPeriod]);

  const loadReport = () => {
    const now = new Date();
    if (reportType === "monthly") {
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      setSelectedPeriod(`${year}-${String(month).padStart(2, "0")}`);
      setCurrentReport(getVATReport(year, month));
    } else {
      const year = now.getFullYear();
      const quarter = Math.ceil((now.getMonth() + 1) / 3);
      setSelectedPeriod(`${year}-Q${quarter}`);
      setCurrentReport(getQuarterlyVATReport(year, quarter));
    }
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    if (reportType === "monthly") {
      const [year, month] = value.split("-").map(Number);
      setCurrentReport(getVATReport(year, month));
    } else {
      const [year, quarter] = value.split("-Q").map(Number);
      setCurrentReport(getQuarterlyVATReport(year, quarter));
    }
  };

  const handleGenerateInvoice = (sale: any) => {
    if (!settings.tin) {
      toast.error("Please configure your TIN in Settings first");
      return;
    }
    const invoice = generateZRAInvoice(sale);
    if (invoice) {
      setZRAInvoice(invoice);
      setShowInvoiceDialog(true);
    } else {
      toast.error("Failed to generate ZRA invoice. Check your settings.");
    }
  };

  const isCompliant = !!settings.tin && !!settings.vatRegistration;

  const sales = getSales();
  const recentSales = sales.slice(-10).reverse();

  const getMonthlyOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-ZM", { year: "numeric", month: "long" });
      options.push({ value, label });
    }
    return options;
  };

  const getQuarterlyOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 8; i++) {
      let quarter = Math.ceil((now.getMonth() + 1 - i * 3) / 3);
      let year = now.getFullYear();
      if (quarter <= 0) {
        quarter += 4;
        year -= 1;
      }
      const value = `${year}-Q${quarter}`;
      const label = `${year} Quarter ${quarter}`;
      options.push({ value, label });
    }
    return options;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ZRA Tax Compliance</h1>
            <p className="text-muted-foreground">VAT reporting and invoice management</p>
          </div>
          <div className="flex items-center gap-2">
            {isCompliant ? (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <CheckCircle className="h-4 w-4" />
                Compliant
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                <AlertCircle className="h-4 w-4" />
                Setup Required
              </div>
            )}
          </div>
        </div>

        {/* Compliance Status */}
        {!isCompliant && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900">ZRA Setup Required</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Please configure your TIN and VAT Registration Number in Settings to enable full ZRA compliance features.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => (window.location.href = "/admin/settings")}
                  >
                    Go to Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* VAT Report Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">ZMW {currentReport?.totalSales.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-muted-foreground mt-1">{selectedPeriod}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total VAT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">ZMW {currentReport?.totalVAT.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-muted-foreground mt-1">16% rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currentReport?.invoiceCount || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Total transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tax Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{settings.taxRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Standard VAT</p>
            </CardContent>
          </Card>
        </div>

        {/* VAT Report Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              VAT Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Report Type:</label>
                <Select value={reportType} onValueChange={(v) => setReportType(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <label className="text-sm font-medium">Period:</label>
                <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportType === "monthly" ? (
                      getMonthlyOptions().map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))
                    ) : (
                      getQuarterlyOptions().map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {currentReport && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">VAT Report Summary - {selectedPeriod}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="font-bold">ZMW {currentReport.totalSales.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total VAT</p>
                    <p className="font-bold text-green-600">ZMW {currentReport.totalVAT.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exempt Sales</p>
                    <p className="font-bold">ZMW {currentReport.exemptSales.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Invoices</p>
                    <p className="font-bold">{currentReport.invoiceCount}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales - Generate ZRA Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Sales - Generate ZRA Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sales yet</p>
            ) : (
              <div className="space-y-2">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition">
                    <div className="flex-1">
                      <p className="font-medium">{sale.customer}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.date).toLocaleDateString()} • ZMW {sale.total.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateInvoice(sale)}
                      disabled={!isCompliant}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      ZRA Invoice
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ZRA Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[90dvh] overflow-y-auto mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle>ZRA Compliant Invoice</DialogTitle>
          </DialogHeader>
          {zraInvoice && (
            <ZRAInvoiceComponent invoice={zraInvoice} onClose={() => setShowInvoiceDialog(false)} />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ZRADashboard;
