-- StockFlow POS System - Supabase Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 5,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE sales (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  customer TEXT NOT NULL DEFAULT 'Walk-in Customer',
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'MOBILE MONEY', 'CARD')),
  staff_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale items table (for storing individual items in a sale)
CREATE TABLE sale_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- Customers table
CREATE TABLE customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff table
CREATE TABLE staff (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  staff_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('Cashier', 'Manager')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile money transactions table
CREATE TABLE mobile_money_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_id TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'failed'))
);

-- Admin account table
CREATE TABLE admin_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  admin_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  registered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  business_name TEXT NOT NULL DEFAULT 'StockFlow Store',
  location TEXT NOT NULL DEFAULT 'Lusaka, Zambia',
  currency TEXT NOT NULL DEFAULT 'ZMK',
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 16,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  mtn_number TEXT,
  mtn_name TEXT,
  airtel_number TEXT,
  airtel_name TEXT,
  zamtel_number TEXT,
  zamtel_name TEXT,
  logo TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription table
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tier TEXT NOT NULL DEFAULT 'trial' CHECK (tier IN ('trial', 'basic', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 200,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history table
CREATE TABLE payment_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  subscription_id TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('MTN', 'AIRTEL', 'ZAMTEL', 'BANK')),
  phone_number TEXT,
  transaction_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  months_paid INTEGER NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_customer ON sales(customer);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_staff_staff_id ON staff(staff_id);
CREATE INDEX idx_mobile_money_phone ON mobile_money_transactions(phone);
CREATE INDEX idx_mobile_money_date ON mobile_money_transactions(date);
CREATE INDEX idx_payment_history_subscription_id ON payment_history(subscription_id);

-- Insert default settings
INSERT INTO settings (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_money_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can restrict this later with proper auth)
CREATE POLICY "Enable all access for products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for staff" ON staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for mobile_money_transactions" ON mobile_money_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for admin_accounts" ON admin_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for settings" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for payment_history" ON payment_history FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
