// localStorage-based data store for StockFlow inventory management

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reorderLevel: number;
  image?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  date: string;
  customer: string;
  items: SaleItem[];
  total: number;
  paymentMethod: "CASH" | "MOBILE MONEY" | "CARD";
  staffId?: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  staffId: string;
  role: "Cashier" | "Manager";
  status: "active" | "inactive";
  password?: string;
  createdAt: string;
}

export interface MobileMoneyTransaction {
  id: string;
  date: string;
  transactionId: string;
  phone: string;
  amount: number;
  status: "completed" | "pending" | "failed";
}

const KEYS = {
  products: "sf_v2_products",
  sales: "sf_v2_sales",
  expenses: "sf_v2_expenses",
  customers: "sf_v2_customers",
  mobileMoney: "sf_v2_mobile_money",
  staff: "sf_v2_staff",
  auth: "sf_v2_auth",
  admin: "sf_v2_admin",
  settings: "sf_v2_settings",
  subscription: "sf_v2_subscription",
};

function get<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Initial data state (empty for production)
const initialProducts: Product[] = [];
const initialSales: Sale[] = [];
const initialExpenses: Expense[] = [];
const initialCustomers: Customer[] = [];
const initialMobileMoney: MobileMoneyTransaction[] = [];
const initialStaff: Staff[] = [];

// Initialize with empty arrays if not set
function init() {
  if (!localStorage.getItem(KEYS.products)) set(KEYS.products, initialProducts);
  if (!localStorage.getItem(KEYS.sales)) set(KEYS.sales, initialSales);
  if (!localStorage.getItem(KEYS.expenses)) set(KEYS.expenses, initialExpenses);
  if (!localStorage.getItem(KEYS.customers)) set(KEYS.customers, initialCustomers);
  if (!localStorage.getItem(KEYS.mobileMoney)) set(KEYS.mobileMoney, initialMobileMoney);
  if (!localStorage.getItem(KEYS.staff)) set(KEYS.staff, initialStaff);
}
init();

// ---- Products ----
export const getProducts = (): Product[] => get<Product>(KEYS.products, initialProducts);
export const addProduct = (p: Omit<Product, "id" | "createdAt">): Product => {
  const products = getProducts();
  const product: Product = { ...p, id: genId(), createdAt: new Date().toISOString().slice(0, 10) };
  products.push(product);
  set(KEYS.products, products);
  return product;
};
export const updateProduct = (id: string, updates: Partial<Product>) => {
  const products = getProducts().map((p) => (p.id === id ? { ...p, ...updates } : p));
  set(KEYS.products, products);
};
export const deleteProduct = (id: string) => {
  set(KEYS.products, getProducts().filter((p) => p.id !== id));
};

// ---- Sales ----
export const getSales = (): Sale[] => get<Sale>(KEYS.sales, initialSales);
export const addSale = (s: Omit<Sale, "id">): Sale => {
  const sales = getSales();
  const date = new Date();
  const prefix = `SD${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const count = sales.filter((x) => x.id.startsWith(prefix)).length + 1;
  const sale: Sale = { ...s, id: `${prefix}-${String(count).padStart(4, "0")}` };
  sales.unshift(sale);
  set(KEYS.sales, sales);
  // Update stock
  const products = getProducts();
  s.items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) product.stock = Math.max(0, product.stock - item.quantity);
  });
  set(KEYS.products, products);

  // Update customer
  if (s.customer && s.customer !== "Walk-in Customer") {
    const customers = getCustomers();
    const customer = customers.find((c) => c.name === s.customer);
    if (customer) {
      customer.totalSpent += s.total;
      set(KEYS.customers, customers);
    }
  }

  return sale;
};

// ---- Expenses ----
export const getExpenses = (): Expense[] => get<Expense>(KEYS.expenses, initialExpenses);
export const addExpense = (e: Omit<Expense, "id">): Expense => {
  const expenses = getExpenses();
  const expense: Expense = { ...e, id: genId() };
  expenses.unshift(expense);
  set(KEYS.expenses, expenses);
  return expense;
};
export const deleteExpense = (id: string) => {
  set(KEYS.expenses, getExpenses().filter((e) => e.id !== id));
};

// ---- Customers ----
export const getCustomers = (): Customer[] => get<Customer>(KEYS.customers, initialCustomers);
export const addCustomer = (c: Omit<Customer, "id" | "totalSpent" | "createdAt">): Customer => {
  const customers = getCustomers();
  const customer: Customer = { ...c, id: genId(), totalSpent: 0, createdAt: new Date().toISOString().slice(0, 10) };
  customers.push(customer);
  set(KEYS.customers, customers);
  return customer;
};
export const deleteCustomer = (id: string) => {
  set(KEYS.customers, getCustomers().filter((c) => c.id !== id));
};

// ---- Mobile Money ----
export const getMobileMoneyTransactions = (): MobileMoneyTransaction[] => get<MobileMoneyTransaction>(KEYS.mobileMoney, initialMobileMoney);
export const addMobileMoneyTransaction = (t: Omit<MobileMoneyTransaction, "id">): MobileMoneyTransaction => {
  const transactions = getMobileMoneyTransactions();
  const tx: MobileMoneyTransaction = { ...t, id: genId() };
  transactions.unshift(tx);
  set(KEYS.mobileMoney, transactions);
  return tx;
};

// ---- Auth ----
export const getStaff = (): Staff[] => get<Staff>(KEYS.staff, initialStaff);
export const addStaff = (s: Omit<Staff, "id" | "createdAt">): Staff => {
  const staffs = getStaff();
  const staff: Staff = { ...s, id: genId(), createdAt: new Date().toISOString().slice(0, 10) };
  staffs.push(staff);
  set(KEYS.staff, staffs);
  return staff;
};
export const updateStaff = (id: string, updates: Partial<Staff>) => {
  const staffs = getStaff().map((s) => (s.id === id ? { ...s, ...updates } : s));
  set(KEYS.staff, staffs);
};
export const deleteStaff = (id: string) => {
  set(KEYS.staff, getStaff().filter((s) => s.id !== id));
};

export const login = (role: "admin" | "staff", identifier: string): boolean => {
  localStorage.setItem(KEYS.auth, JSON.stringify({ role, identifier, loggedIn: true }));
  return true;
};
export const logout = () => localStorage.removeItem(KEYS.auth);
export const getAuth = (): { role: string; identifier: string; loggedIn: boolean } | null => {
  try {
    const data = localStorage.getItem(KEYS.auth);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const getAdminAccount = (): any => {
  try {
    const data = localStorage.getItem(KEYS.admin);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveAdminAccount = (account: any) => {
  localStorage.setItem(KEYS.admin, JSON.stringify({ ...account, registered: true }));
};

// ---- Settings ----
export interface AppSettings {
  businessName: string;
  location: string;
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
  mtnNumber?: string;
  mtnName?: string;
  airtelNumber?: string;
  airtelName?: string;
  zamtelNumber?: string;
  zamtelName?: string;
  logo?: string;
  // ZRA-specific fields
  tin?: string; // Tax Identification Number
  vatRegistration?: string; // VAT Registration Number
  zraCertificate?: string; // ZRA Certificate Number
}

const defaultSettings: AppSettings = {
  businessName: "StockFlow Store",
  location: "Lusaka, Zambia",
  currency: "ZMK",
  taxRate: 16,
  lowStockThreshold: 5,
  mtnNumber: "",
  mtnName: "",
  airtelNumber: "",
  airtelName: "",
  zamtelNumber: "",
  zamtelName: "",
  logo: "",
};

export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(KEYS.settings);
    return data ? JSON.parse(data) : defaultSettings;
  } catch {
    return defaultSettings;
  }
};
export const saveSettings = (s: AppSettings) => localStorage.setItem(KEYS.settings, JSON.stringify(s));

// ---- Dashboard helpers ----
export const getTodaySales = (): Sale[] => {
  const today = new Date().toISOString().slice(0, 10);
  return getSales().filter((s) => s.date.startsWith(today));
};

export const getTodayExpenses = (): Expense[] => {
  const today = new Date().toISOString().slice(0, 10);
  return getExpenses().filter((e) => e.date.startsWith(today));
};

export const getLowStockProducts = (): Product[] => {
  const threshold = getSettings().lowStockThreshold;
  return getProducts().filter((p) => p.stock <= threshold);
};

export const getLast7DaysData = () => {
  const days: { day: string; date: string; sales: number; expenses: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const daySales = getSales().filter((s) => s.date.startsWith(dateStr)).reduce((sum, s) => sum + s.total, 0);
    const dayExpenses = getExpenses().filter((e) => e.date.startsWith(dateStr)).reduce((sum, e) => sum + e.amount, 0);
    days.push({ day: dayName, date: dateStr, sales: daySales, expenses: dayExpenses });
  }
  return days;
};

export const getTopProducts = (days = 7) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const sales = getSales().filter((s) => new Date(s.date) >= cutoff);
  const productTotals: Record<string, { name: string; total: number }> = {};
  sales.forEach((s) =>
    s.items.forEach((item) => {
      if (!productTotals[item.productId]) productTotals[item.productId] = { name: item.productName, total: 0 };
      productTotals[item.productId].total += item.price * item.quantity;
    })
  );
  return Object.values(productTotals).sort((a, b) => b.total - a.total).slice(0, 5);
};

export const getTodayMobileMoney = (): number => {
  const today = new Date().toISOString().slice(0, 10);
  return getMobileMoneyTransactions()
    .filter((m) => m.date.startsWith(today) && m.status === "completed")
    .reduce((sum, m) => sum + m.amount, 0);
};

// ---- ZRA VAT/Tax Reporting ----
export interface VATReport {
  period: string; // e.g., "2024-01"
  totalSales: number;
  totalVAT: number;
  exemptSales: number;
  zeroRatedSales: number;
  invoiceCount: number;
}

export interface ZRAInvoice {
  invoiceNumber: string;
  date: string;
  tin: string;
  vatRegistration: string;
  businessName: string;
  businessAddress: string;
  customerName: string;
  customerTIN?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number; // 16% for standard, 0% for exempt
    vatAmount: number;
    total: number;
  }[];
  subTotal: number;
  totalVAT: number;
  grandTotal: number;
  paymentMethod: string;
}

// Calculate VAT for a sale (Zambia standard is 16%)
export const calculateVAT = (amount: number, taxRate: number, isExempt: boolean = false): number => {
  if (isExempt) return 0;
  return (amount * taxRate) / 100;
};

// Generate ZRA-compliant invoice from a sale
export const generateZRAInvoice = (sale: Sale, settings: AppSettings): ZRAInvoice => {
  const taxRate = settings.taxRate || 16;
  
  const items = sale.items.map(item => {
    const unitPrice = item.price;
    const lineTotal = item.quantity * unitPrice;
    const vatAmount = calculateVAT(lineTotal, taxRate);
    
    return {
      description: item.productName,
      quantity: item.quantity,
      unitPrice,
      vatRate: taxRate,
      vatAmount,
      total: lineTotal + vatAmount
    };
  });

  const subTotal = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalVAT = items.reduce((sum, item) => sum + item.vatAmount, 0);
  const grandTotal = subTotal + totalVAT;

  return {
    invoiceNumber: sale.id,
    date: sale.date,
    tin: settings.tin || "NOT PROVIDED",
    vatRegistration: settings.vatRegistration || "NOT PROVIDED",
    businessName: settings.businessName,
    businessAddress: settings.location,
    customerName: sale.customer,
    customerTIN: undefined,
    items,
    subTotal,
    totalVAT,
    grandTotal,
    paymentMethod: sale.paymentMethod
  };
};

// Get VAT report for a specific period
export const getVATReport = (year: number, month: number): VATReport => {
  const sales = getSales();
  const period = `${year}-${String(month).padStart(2, '0')}`;
  const settings = getSettings();
  const taxRate = settings.taxRate || 16;

  const periodSales = sales.filter(s => s.date.startsWith(period));
  
  let totalSales = 0;
  let totalVAT = 0;
  let exemptSales = 0;
  let zeroRatedSales = 0;

  periodSales.forEach(sale => {
    const saleTotal = sale.total;
    const vat = calculateVAT(saleTotal, taxRate);
    
    totalSales += saleTotal;
    totalVAT += vat;
    // Add logic for exempt/zero-rated items if needed
  });

  return {
    period,
    totalSales,
    totalVAT,
    exemptSales,
    zeroRatedSales,
    invoiceCount: periodSales.length
  };
};

// Get quarterly VAT report
export const getQuarterlyVATReport = (year: number, quarter: number): VATReport => {
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  
  let totalSales = 0;
  let totalVAT = 0;
  let exemptSales = 0;
  let zeroRatedSales = 0;
  let invoiceCount = 0;
  const settings = getSettings();
  const taxRate = settings.taxRate || 16;

  for (let month = startMonth; month <= endMonth; month++) {
    const report = getVATReport(year, month);
    totalSales += report.totalSales;
    totalVAT += report.totalVAT;
    exemptSales += report.exemptSales;
    zeroRatedSales += report.zeroRatedSales;
    invoiceCount += report.invoiceCount;
  }

  return {
    period: `${year}-Q${quarter}`,
    totalSales,
    totalVAT,
    exemptSales,
    zeroRatedSales,
    invoiceCount
  };
};
export type SubscriptionTier = "trial" | "basic" | "premium";
export type SubscriptionStatus = "active" | "expired" | "cancelled";

export interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  lastPaymentDate?: string;
  monthlyFee: number; // in ZMW
  paymentHistory: PaymentRecord[];
  autoRenew: boolean;
  deviceId: string; // Device ID to prevent multi-device login
  activationCode?: string; // One-time activation code
  codeUsed: boolean; // Whether the activation code has been used
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: "MTN" | "AIRTEL" | "ZAMTEL" | "BANK";
  phoneNumber?: string;
  transactionId: string;
  status: "completed" | "pending" | "failed";
  monthsPaid: number;
}

const TRIAL_DAYS = 7;
const MONTHLY_FEE = 200; // ZMW
const USED_CODES_KEY = "sf_v2_used_codes";
const DEVICE_ID_KEY = "sf_v2_device_id";

// Get or generate device ID
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = genId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

// Generate a unique activation code
export const generateActivationCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format as XXXX-XXXX-XXXX
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
};

// Check if a code has been used
export const isCodeUsed = (code: string): boolean => {
  const usedCodes = getSingle<string[]>(USED_CODES_KEY, []);
  return usedCodes.includes(code);
};

// Mark a code as used
export const markCodeUsed = (code: string) => {
  const usedCodes = getSingle<string[]>(USED_CODES_KEY, []);
  if (!usedCodes.includes(code)) {
    usedCodes.push(code);
    setSingle(USED_CODES_KEY, usedCodes);
  }
};

function getSingle<T>(key: string, fallback: T | null = null): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setSingle<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const initializeSubscription = (): Subscription => {
  const existing = getSingle<Subscription>(KEYS.subscription);
  if (existing) return existing;

  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

  const subscription: Subscription = {
    id: genId(),
    tier: "trial",
    status: "active",
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    monthlyFee: MONTHLY_FEE,
    paymentHistory: [],
    autoRenew: true,
    deviceId: getDeviceId(),
    codeUsed: false,
  };

  setSingle(KEYS.subscription, subscription);
  return subscription;
};

export const getSubscription = (): Subscription => {
  const sub = getSingle<Subscription>(KEYS.subscription);
  if (!sub) return initializeSubscription();

  // Check if trial expired
  if (sub.tier === "trial" && sub.status === "active") {
    const now = new Date();
    const trialEnd = new Date(sub.trialEndDate);
    if (now > trialEnd) {
      sub.status = "expired";
      setSingle(KEYS.subscription, sub);
    }
  }

  // Check if subscription expired
  if ((sub.tier === "basic" || sub.tier === "premium") && sub.status === "active" && sub.subscriptionEndDate) {
    const now = new Date();
    const endDate = new Date(sub.subscriptionEndDate);
    if (now > endDate) {
      sub.status = "expired";
      setSingle(KEYS.subscription, sub);
    }
  }

  // Check device ID (for paid subscriptions)
  if ((sub.tier === "basic" || sub.tier === "premium") && sub.status === "active") {
    const currentDeviceId = getDeviceId();
    if (sub.deviceId !== currentDeviceId) {
      // Device mismatch - reset to trial
      sub.status = "expired";
      sub.tier = "trial";
      sub.deviceId = currentDeviceId;
      setSingle(KEYS.subscription, sub);
    }
  }

  return sub;
};

export const isSubscriptionActive = (): boolean => {
  const sub = getSubscription();
  return sub.status === "active";
};

export const getDaysRemaining = (): number => {
  const sub = getSubscription();
  const now = new Date();

  if (sub.tier === "trial" && sub.status === "active") {
    const trialEnd = new Date(sub.trialEndDate);
    const diff = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  if ((sub.tier === "basic" || sub.tier === "premium") && sub.status === "active" && sub.subscriptionEndDate) {
    const endDate = new Date(sub.subscriptionEndDate);
    const diff = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return 0;
};

export const getSubscriptionStatusText = (): { text: string; color: string; urgent: boolean } => {
  const sub = getSubscription();
  const days = getDaysRemaining();

  if (sub.status === "expired") {
    return { text: "Subscription Expired - Please Renew", color: "text-destructive", urgent: true };
  }

  if (sub.tier === "trial") {
    if (days <= 2) {
      return { text: `Trial ends in ${days} day${days === 1 ? "" : "s"} - Subscribe now!`, color: "text-warning", urgent: true };
    }
    return { text: `Trial: ${days} days remaining`, color: "text-success", urgent: false };
  }

  if (days <= 7) {
    return { text: `Subscription expires in ${days} days`, color: "text-warning", urgent: true };
  }

  return { text: `Active - ${days} days remaining`, color: "text-success", urgent: false };
};

export const processPayment = (
  tier: SubscriptionTier,
  months: number,
  method: "MTN" | "AIRTEL" | "ZAMTEL" | "BANK",
  phoneNumber: string
): PaymentRecord => {
  const sub = getSubscription();
  const amount = MONTHLY_FEE * months;
  const now = new Date();

  const payment: PaymentRecord = {
    id: genId(),
    date: now.toISOString(),
    amount,
    method,
    phoneNumber,
    transactionId: `SUB${Date.now()}`,
    status: "completed",
    monthsPaid: months,
  };

  // Calculate new end date
  let endDate = new Date(now);
  if (sub.subscriptionEndDate && sub.status === "active") {
    const currentEnd = new Date(sub.subscriptionEndDate);
    if (currentEnd > now) {
      endDate = currentEnd;
    }
  }
  endDate.setMonth(endDate.getMonth() + months);

  const updatedSub: Subscription = {
    ...sub,
    tier,
    status: "active",
    subscriptionStartDate: sub.subscriptionStartDate || now.toISOString(),
    subscriptionEndDate: endDate.toISOString(),
    lastPaymentDate: now.toISOString(),
    paymentHistory: [...sub.paymentHistory, payment],
    deviceId: "", // Will be set when code is redeemed
    activationCode: "", // Will be set by admin
    codeUsed: false,
  };

  setSingle(KEYS.subscription, updatedSub);
  return payment;
};

// Manually generate an activation code for a user (admin function)
export const generateUserCode = (tier: SubscriptionTier, months: number): string => {
  const code = generateActivationCode();
  const now = new Date();
  const sub = getSubscription();

  // Calculate end date
  let endDate = new Date(now);
  if (sub.subscriptionEndDate && sub.status === "active") {
    const currentEnd = new Date(sub.subscriptionEndDate);
    if (currentEnd > now) {
      endDate = currentEnd;
    }
  }
  endDate.setMonth(endDate.getMonth() + months);

  const updatedSub: Subscription = {
    ...sub,
    tier,
    status: "active",
    subscriptionStartDate: sub.subscriptionStartDate || now.toISOString(),
    subscriptionEndDate: endDate.toISOString(),
    lastPaymentDate: now.toISOString(),
    deviceId: "",
    activationCode: code,
    codeUsed: false,
  };

  setSingle(KEYS.subscription, updatedSub);
  return code;
};

// Redeem activation code
export const redeemCode = (code: string): { success: boolean; message: string } => {
  const sub = getSubscription();

  // Check if code matches
  if (sub.activationCode !== code) {
    return { success: false, message: "Invalid activation code" };
  }

  // Check if code already used
  if (sub.codeUsed) {
    return { success: false, message: "This activation code has already been used" };
  }

  // Check if code is in global used codes list
  if (isCodeUsed(code)) {
    return { success: false, message: "This activation code has already been used on another device" };
  }

  // Validate code and activate subscription
  const now = new Date();
  const updatedSub: Subscription = {
    ...sub,
    deviceId: getDeviceId(),
    codeUsed: true,
  };

  setSingle(KEYS.subscription, updatedSub);
  markCodeUsed(code);

  return { success: true, message: "Subscription activated successfully!" };
};

export const getFeatureAccess = (): {
  pos: boolean;
  inventory: boolean;
  reports: boolean;
  staff: boolean;
  customers: boolean;
  analytics: boolean;
  export: boolean;
} => {
  const sub = getSubscription();

  if (sub.status !== "active") {
    return {
      pos: false,
      inventory: true, // Allow view-only
      reports: false,
      staff: false,
      customers: false,
      analytics: false,
      export: false,
    };
  }

  switch (sub.tier) {
    case "trial":
      return {
        pos: true,
        inventory: true,
        reports: true,
        staff: false,
        customers: true,
        analytics: false,
        export: false,
      };
    case "basic":
      return {
        pos: true,
        inventory: true,
        reports: true,
        staff: true,
        customers: true,
        analytics: false,
        export: false,
      };
    case "premium":
      return {
        pos: true,
        inventory: true,
        reports: true,
        staff: true,
        customers: true,
        analytics: true,
        export: true,
      };
    default:
      return {
        pos: false,
        inventory: true,
        reports: false,
        staff: false,
        customers: false,
        analytics: false,
        export: false,
      };
  }
};

