import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ZRAInvoice as ZRAInvoiceType } from "@/lib/store";
import { Printer, Download, FileText } from "lucide-react";

interface ZRAInvoiceProps {
  invoice: ZRAInvoiceType;
  onClose?: () => void;
}

export function ZRAInvoice({ invoice, onClose }: ZRAInvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-ZM", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">TAX INVOICE</h1>
        <p className="text-sm text-gray-600">VAT COMPLIANT - ZAMBIA REVENUE AUTHORITY</p>
        <p className="text-xs text-gray-500 mt-1">Invoice Type: {invoice.invoiceType}</p>
      </div>

      {/* Business Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h2 className="font-bold text-gray-900 mb-2">{invoice.businessName}</h2>
          <p className="text-sm text-gray-600">{invoice.businessAddress}</p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold">TIN:</span> {invoice.tin}
          </p>
          {invoice.vatRegistration && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold">VAT Reg:</span> {invoice.vatRegistration}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Invoice No:</span> {invoice.invoiceNumber}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Date:</span> {formatDate(invoice.date)}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Payment:</span> {invoice.paymentMethod}
          </p>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Customer Info */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
        <p className="text-sm text-gray-700">{invoice.customerName}</p>
        {invoice.customerTIN && (
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold">Customer TIN:</span> {invoice.customerTIN}
          </p>
        )}
      </div>

      {/* Items Table */}
      <div className="border border-gray-300 rounded mb-6 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 text-sm font-semibold text-gray-900">Description</th>
              <th className="text-center p-3 text-sm font-semibold text-gray-900">Qty</th>
              <th className="text-right p-3 text-sm font-semibold text-gray-900">Unit Price</th>
              <th className="text-right p-3 text-sm font-semibold text-gray-900">VAT Rate</th>
              <th className="text-right p-3 text-sm font-semibold text-gray-900">VAT Amount</th>
              <th className="text-right p-3 text-sm font-semibold text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="p-3 text-sm text-gray-700">{item.description}</td>
                <td className="p-3 text-sm text-gray-700 text-center">{item.quantity}</td>
                <td className="p-3 text-sm text-gray-700 text-right">
                  ZMW {item.unitPrice.toFixed(2)}
                </td>
                <td className="p-3 text-sm text-gray-700 text-right">{item.vatRate}%</td>
                <td className="p-3 text-sm text-gray-700 text-right">
                  ZMW {item.vatAmount.toFixed(2)}
                </td>
                <td className="p-3 text-sm text-gray-700 text-right font-semibold">
                  ZMW {item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">ZMW {invoice.subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-gray-600">VAT ({invoice.items[0]?.vatRate || 16}%):</span>
            <span className="text-gray-900">ZMW {invoice.totalVAT.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between py-2 text-lg font-bold">
            <span className="text-gray-900">Total:</span>
            <span className="text-gray-900">ZMW {invoice.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ZRA Compliance Statement */}
      <div className="bg-gray-50 p-4 rounded mb-6">
        <p className="text-xs text-gray-600 text-center">
          This invoice is VAT compliant with Zambia Revenue Authority regulations.
          VAT is calculated at the standard rate of {invoice.items[0]?.vatRate || 16}%.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mb-4">
        <p>Generated by StockFlow POS System</p>
        <p>{new Date().toLocaleString()}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center print:hidden">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
