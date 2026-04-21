import { useState, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface ParsedRow {
  [key: string]: string;
}

const UploadPage = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");

    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) { setError("File is empty or has no data rows"); return; }

      const hdrs = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      setHeaders(hdrs);

      const rows: ParsedRow[] = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const row: ParsedRow = {};
        hdrs.forEach((h, i) => { row[h] = values[i] || ""; });
        return row;
      });
      setData(rows);
    };
    reader.readAsText(file);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload & Analyse</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload Excel, CSV or PDF files for business analysis</p>
        </div>

        {/* Upload Container */}
        <Card className="border-dashed border-2 shadow-sm">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 bg-success/10 rounded-xl flex items-center justify-center mb-6">
                <Upload className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Drop your file here, or click to browse</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6">Supports: Excel (.xlsx, .xls, .csv) and PDF</p>
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  className="bg-success/5 border-success/20 text-success hover:bg-success/10 hover:text-success gap-2"
                  onClick={() => fileRef.current?.click()}
                >
                  <FileText className="h-4 w-4" /> Excel / CSV
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-destructive/5 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                  onClick={() => fileRef.current?.click()}
                >
                  <FileText className="h-4 w-4" /> PDF
                </Button>
              </div>
              
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
            </div>
          </CardContent>
        </Card>

        {/* Templates Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold">Excel Import Templates</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Your Excel file should have these column headers for best results:</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Products Template */}
              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Products Template</h4>
                <div className="flex flex-wrap gap-1.5">
                  {["Product Name", "SKU", "Category", "Buying Price", "Selling Price", "Stock Qty", "Reorder Level", "Unit"].map((tag) => (
                    <span key={tag} className="text-xs font-mono bg-background border border-border px-2 py-1 rounded text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sales Template */}
              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Sales Template</h4>
                <div className="flex flex-wrap gap-1.5">
                  {["Date", "Receipt No", "Customer", "Items", "Total", "Payment Method"].map((tag) => (
                    <span key={tag} className="text-xs font-mono bg-background border border-border px-2 py-1 rounded text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expenses Template */}
              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Expenses Template</h4>
                <div className="flex flex-wrap gap-1.5">
                  {["Date", "Category", "Description", "Amount", "Recurring"].map((tag) => (
                    <span key={tag} className="text-xs font-mono bg-background border border-border px-2 py-1 rounded text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mobile Money Template */}
              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Mobile Money Template</h4>
                <div className="flex flex-wrap gap-1.5">
                  {["Date", "Transaction Code", "Name", "Phone", "Amount", "Type", "Status"].map((tag) => (
                    <span key={tag} className="text-xs font-mono bg-background border border-border px-2 py-1 rounded text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {data.length > 0 && (
          <>
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              <span>Loaded <strong>{data.length}</strong> rows from <strong>{fileName}</strong></span>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Rows</p>
                  <p className="text-xl font-bold text-foreground">{data.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Columns</p>
                  <p className="text-xl font-bold text-foreground">{headers.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">File</p>
                  <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Format</p>
                    <p className="text-sm font-medium text-foreground">CSV</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Data Preview (first 20 rows)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {headers.map((h) => (
                          <th key={h} className="text-left p-2 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 20).map((row, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          {headers.map((h) => (
                            <td key={h} className="p-2 text-foreground whitespace-nowrap">{row[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default UploadPage;
