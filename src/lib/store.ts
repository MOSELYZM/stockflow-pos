// Supabase-based data store for StockFlow inventory management
import { supabase } from './supabase';

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

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---- Products ----
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    price: Number(p.price),
    cost: Number(p.cost),
    stock: p.stock,
    reorderLevel: p.reorder_level,
    image: p.image,
    createdAt: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  }));
};

export const addProduct = async (p: Omit<Product, "id" | "createdAt">): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      reorder_level: p.reorderLevel,
      image: p.image
    }])
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    sku: data.sku,
    category: data.category,
    price: Number(data.price),
    cost: Number(data.cost),
    stock: data.stock,
    reorderLevel: data.reorder_level,
    image: data.image,
    createdAt: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  };
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { error } = await supabase
    .from('products')
    .update({
      name: updates.name,
      sku: updates.sku,
      category: updates.category,
      price: updates.price,
      cost: updates.cost,
      stock: updates.stock,
      reorder_level: updates.reorderLevel,
      image: updates.image
    })
    .eq('id', id);
  if (error) throw error;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// ---- Sales ----
export const getSales = async (): Promise<Sale[]> => {
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false });
  if (salesError) throw salesError;

  const salesWithItems: Sale[] = [];
  for (const sale of sales) {
    const { data: items, error: itemsError } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', sale.id);
    if (itemsError) throw itemsError;

    salesWithItems.push({
      id: sale.id,
      date: sale.date,
      customer: sale.customer,
      items: items.map(item => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: Number(item.price)
      })),
      total: Number(sale.total),
      paymentMethod: sale.payment_method as any,
      staffId: sale.staff_id
    });
  }
  return salesWithItems;
};

export const addSale = async (s: Omit<Sale, "id">): Promise<Sale> => {
  const date = new Date();
  const prefix = `SD${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}`;
  
  // Get existing sales to generate ID
  const { data: existingSales } = await supabase
    .from('sales')
    .select('id')
    .ilike('id', `${prefix}%`);
  const count = (existingSales?.length || 0) + 1;
  const saleId = `${prefix}-${String(count).padStart(4, "0")}`;

  // Insert sale
  const { error: saleError } = await supabase
    .from('sales')
    .insert([{
      id: saleId,
      date: s.date,
      customer: s.customer,
      total: s.total,
      payment_method: s.paymentMethod,
      staff_id: s.staffId
    }]);
  if (saleError) throw saleError;

  // Insert sale items
  for (const item of s.items) {
    const { error: itemError } = await supabase
      .from('sale_items')
      .insert([{
        sale_id: saleId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price
      }]);
    if (itemError) throw itemError;
  }

  // Update stock
  for (const item of s.items) {
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.productId)
      .single();
    if (product) {
      const newStock = Math.max(0, product.stock - item.quantity);
      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.productId);
    }
  }

  // Update customer
  if (s.customer && s.customer !== "Walk-in Customer") {
    const { data: customer } = await supabase
      .from('customers')
      .select('total_spent')
      .ilike('name', s.customer)
      .single();
    if (customer) {
      await supabase
        .from('customers')
        .update({ total_spent: Number(customer.total_spent) + s.total })
        .eq('id', customer.id);
    }
  }

  return { ...s, id: saleId };
};

// ---- Expenses ----
export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data.map(e => ({
    id: e.id,
    date: e.date,
    description: e.description,
    amount: Number(e.amount),
    category: e.category
  }));
};

export const addExpense = async (e: Omit<Expense, "id">): Promise<Expense> => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      date: e.date,
      description: e.description,
      amount: e.amount,
      category: e.category
    }])
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    date: data.date,
    description: data.description,
    amount: Number(data.amount),
    category: data.category
  };
};

export const deleteExpense = async (id: string) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// ---- Customers ----
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    totalSpent: Number(c.total_spent),
    createdAt: c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  }));
};

export const addCustomer = async (c: Omit<Customer, "id" | "totalSpent" | "createdAt">): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .insert([{
      name: c.name,
      phone: c.phone,
      email: c.email,
      total_spent: 0
    }])
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: data.email,
    totalSpent: Number(data.total_spent),
    createdAt: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  };
};

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// ---- Mobile Money ----
export const getMobileMoneyTransactions = async (): Promise<MobileMoneyTransaction[]> => {
  const { data, error } = await supabase
    .from('mobile_money_transactions')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data.map(m => ({
    id: m.id,
    date: m.date,
    transactionId: m.transaction_id,
    phone: m.phone,
    amount: Number(m.amount),
    status: m.status
  }));
};

export const addMobileMoneyTransaction = async (t: Omit<MobileMoneyTransaction, "id">): Promise<MobileMoneyTransaction> => {
  const { data, error } = await supabase
    .from('mobile_money_transactions')
    .insert([{
      date: t.date,
      transaction_id: t.transactionId,
      phone: t.phone,
      amount: t.amount,
      status: t.status
    }])
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    date: data.date,
    transactionId: data.transaction_id,
    phone: data.phone,
    amount: Number(data.amount),
    status: data.status
  };
};

// ---- Staff ----
export const getStaff = async (): Promise<Staff[]> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(s => ({
    id: s.id,
    name: s.name,
    staffId: s.staff_id,
    role: s.role,
    status: s.status,
    password: s.password,
    createdAt: s.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  }));
};

export const addStaff = async (s: Omit<Staff, "id" | "createdAt">): Promise<Staff> => {
  const { data, error } = await supabase
    .from('staff')
    .insert([{
      name: s.name,
      staff_id: s.staffId,
      role: s.role,
      status: s.status,
      password: s.password
    }])
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    staffId: data.staff_id,
    role: data.role,
    status: data.status,
    password: data.password,
    createdAt: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  };
};

export const updateStaff = async (id: string, updates: Partial<Staff>) => {
  const { error } = await supabase
    .from('staff')
    .update({
      name: updates.name,
      staff_id: updates.staffId,
      role: updates.role,
      status: updates.status,
      password: updates.password
    })
    .eq('id', id);
  if (error) throw error;
};

export const deleteStaff = async (id: string) => {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// ---- Auth ----
export const login = (role: "admin" | "staff", identifier: string): boolean => {
  localStorage.setItem('sf_v2_auth', JSON.stringify({ role, identifier, loggedIn: true }));
  return true;
};

export const logout = () => localStorage.removeItem('sf_v2_auth');

export const getAuth = (): { role: string; identifier: string; loggedIn: boolean } | null => {
  try {
    const data = localStorage.getItem('sf_v2_auth');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const getAdminAccount = async (): Promise<any> => {
  const { data, error } = await supabase
    .from('admin_accounts')
    .select('*')
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const saveAdminAccount = async (account: any) => {
  const { error } = await supabase
    .from('admin_accounts')
    .upsert([{
      admin_name: account.adminName,
      email: account.email,
      password: account.password,
      registered: true
    }]);
  if (error) throw error;
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

export const getSettings = async (): Promise<AppSettings> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'default')
    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      // No settings found, return defaults
      return defaultSettings;
    }
    throw error;
  }
  return {
    businessName: data.business_name,
    location: data.location,
    currency: data.currency,
    taxRate: Number(data.tax_rate),
    lowStockThreshold: data.low_stock_threshold,
    mtnNumber: data.mtn_number,
    mtnName: data.mtn_name,
    airtelNumber: data.airtel_number,
    airtelName: data.airtel_name,
    zamtelNumber: data.zamtel_number,
    zamtelName: data.zamtel_name,
    logo: data.logo,
  };
};

export const saveSettings = async (s: AppSettings) => {
  const { error } = await supabase
    .from('settings')
    .upsert([{
      id: 'default',
      business_name: s.businessName,
      location: s.location,
      currency: s.currency,
      tax_rate: s.taxRate,
      low_stock_threshold: s.lowStockThreshold,
      mtn_number: s.mtnNumber,
      mtn_name: s.mtnName,
      airtel_number: s.airtelNumber,
      airtel_name: s.airtelName,
      zamtel_number: s.zamtelNumber,
      zamtel_name: s.zamtelName,
      logo: s.logo,
    }]);
  if (error) throw error;
};

// ---- Dashboard helpers ----
export const getTodaySales = async (): Promise<Sale[]> => {
  const today = new Date().toISOString().slice(0, 10);
  const sales = await getSales();
  return sales.filter((s) => s.date.startsWith(today));
};

export const getTodayExpenses = async (): Promise<Expense[]> => {
  const today = new Date().toISOString().slice(0, 10);
  const expenses = await getExpenses();
  return expenses.filter((e) => e.date.startsWith(today));
};

export const getLowStockProducts = async (): Promise<Product[]> => {
  const threshold = (await getSettings()).lowStockThreshold;
  const products = await getProducts();
  return products.filter((p) => p.stock <= threshold);
};

export const getLast7DaysData = async () => {
  const days: { day: string; date: string; sales: number; expenses: number }[] = [];
  const sales = await getSales();
  const expenses = await getExpenses();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const daySales = sales.filter((s) => s.date.startsWith(dateStr)).reduce((sum, s) => sum + s.total, 0);
    const dayExpenses = expenses.filter((e) => e.date.startsWith(dateStr)).reduce((sum, e) => sum + e.amount, 0);
    days.push({ day: dayName, date: dateStr, sales: daySales, expenses: dayExpenses });
  }
  return days;
};

export const getTopProducts = async (days = 7) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const sales = await getSales();
  const filteredSales = sales.filter((s) => new Date(s.date) >= cutoff);
  const productTotals: Record<string, { name: string; total: number }> = {};
  filteredSales.forEach((s) =>
    s.items.forEach((item) => {
      if (!productTotals[item.productId]) productTotals[item.productId] = { name: item.productName, total: 0 };
      productTotals[item.productId].total += item.price * item.quantity;
    })
  );
  return Object.values(productTotals).sort((a, b) => b.total - a.total).slice(0, 5);
};

export const getTodayMobileMoney = async (): Promise<number> => {
  const today = new Date().toISOString().slice(0, 10);
  const transactions = await getMobileMoneyTransactions();
  return transactions
    .filter((m) => m.date.startsWith(today) && m.status === "completed")
    .reduce((sum, m) => sum + m.amount, 0);
};

// ---- Subscription Management (keep using localStorage for now) ----
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
  monthlyFee: number;
  paymentHistory: PaymentRecord[];
  autoRenew: boolean;
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
const MONTHLY_FEE = 200;

export const initializeSubscription = (): Subscription => {
  const existing = localStorage.getItem('sf_v2_subscription');
  if (existing) return JSON.parse(existing);

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
  };

  localStorage.setItem('sf_v2_subscription', JSON.stringify(subscription));
  return subscription;
};

export const getSubscription = (): Subscription => {
  const sub = localStorage.getItem('sf_v2_subscription');
  if (!sub) return initializeSubscription();
  return JSON.parse(sub);
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
  };

  localStorage.setItem('sf_v2_subscription', JSON.stringify(updatedSub));
  return payment;
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
      inventory: true,
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
