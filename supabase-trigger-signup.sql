-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Create a new tenant for the user
  INSERT INTO tenants (business_name, location, currency, tax_rate, low_stock_threshold)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'New Business'),
    COALESCE(NEW.raw_user_meta_data->>'location', 'Unknown'),
    'ZMK',
    16,
    5
  )
  RETURNING id INTO new_tenant_id;

  -- Create user record linking auth user to tenant
  INSERT INTO users (id, email, full_name, tenant_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin'),
    new_tenant_id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')::text
  );

  -- Create trial subscription
  INSERT INTO subscriptions (tenant_id, tier, status, trial_start_date, trial_end_date, monthly_fee, auto_renew)
  VALUES (
    new_tenant_id,
    'trial',
    'active',
    NOW(),
    NOW() + INTERVAL '7 days',
    200,
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their tenant users" ON users;
DROP POLICY IF EXISTS "Users can insert users in their tenant" ON users;
DROP POLICY IF EXISTS "Users can update users in their tenant" ON users;

DROP POLICY IF EXISTS "Users can view their tenant products" ON products;
DROP POLICY IF EXISTS "Users can insert products in their tenant" ON products;
DROP POLICY IF EXISTS "Users can update products in their tenant" ON products;
DROP POLICY IF EXISTS "Users can delete products in their tenant" ON products;

DROP POLICY IF EXISTS "Users can view their tenant sales" ON sales;
DROP POLICY IF EXISTS "Users can insert sales in their tenant" ON sales;
DROP POLICY IF EXISTS "Users can update sales in their tenant" ON sales;
DROP POLICY IF EXISTS "Users can delete sales in their tenant" ON sales;

DROP POLICY IF EXISTS "Users can view their tenant customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers in their tenant" ON customers;
DROP POLICY IF EXISTS "Users can update customers in their tenant" ON customers;
DROP POLICY IF EXISTS "Users can delete customers in their tenant" ON customers;

DROP POLICY IF EXISTS "Users can view their tenant expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert expenses in their tenant" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses in their tenant" ON expenses;
DROP POLICY IF EXISTS "Users can delete expenses in their tenant" ON expenses;

DROP POLICY IF EXISTS "Users can view their tenant staff" ON staff;
DROP POLICY IF EXISTS "Users can insert staff in their tenant" ON staff;
DROP POLICY IF EXISTS "Users can update staff in their tenant" ON staff;
DROP POLICY IF EXISTS "Users can delete staff in their tenant" ON staff;

DROP POLICY IF EXISTS "Users can view their tenant mobile money" ON mobile_money_transactions;
DROP POLICY IF EXISTS "Users can insert mobile money in their tenant" ON mobile_money_transactions;
DROP POLICY IF EXISTS "Users can update mobile money in their tenant" ON mobile_money_transactions;

DROP POLICY IF EXISTS "Users can view their tenant subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update subscriptions in their tenant" ON subscriptions;

DROP POLICY IF EXISTS "Super admin can view all tenants" ON tenants;
DROP POLICY IF EXISTS "Super admin can insert tenants" ON tenants;
DROP POLICY IF EXISTS "Super admin can update tenants" ON tenants;

-- Allow public to insert into tenants (for signup)
CREATE POLICY "Allow public insert for signup" ON tenants
  FOR INSERT WITH CHECK (true);

-- Allow public to insert into users (for signup)
CREATE POLICY "Allow public insert for signup" ON users
  FOR INSERT WITH CHECK (true);

-- Allow public to insert into subscriptions (for signup)
CREATE POLICY "Allow public insert for signup" ON subscriptions
  FOR INSERT WITH CHECK (true);

-- Recreate RLS policies for users (tenant isolation)
CREATE POLICY "Users can view their tenant users" ON users
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE tenant_id = users.tenant_id));

CREATE POLICY "Users can insert users in their tenant" ON users
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update users in their tenant" ON users
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Recreate RLS policies for products (tenant isolation)
CREATE POLICY "Users can view their tenant products" ON products
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert products in their tenant" ON products
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update products in their tenant" ON products
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete products in their tenant" ON products
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Recreate RLS policies for sales (tenant isolation)
CREATE POLICY "Users can view their tenant sales" ON sales
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert sales in their tenant" ON sales
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update sales in their tenant" ON sales
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete sales in their tenant" ON sales
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Recreate RLS policies for customers (tenant isolation)
CREATE POLICY "Users can view their tenant customers" ON customers
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert customers in their tenant" ON customers
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update customers in their tenant" ON customers
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete customers in their tenant" ON customers
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Recreate RLS policies for expenses (tenant isolation)
CREATE POLICY "Users can view their tenant expenses" ON expenses
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert expenses in their tenant" ON expenses
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update expenses in their tenant" ON expenses
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete expenses in their tenant" ON expenses
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Recreate RLS policies for staff (tenant isolation)
CREATE POLICY "Users can view their tenant staff" ON staff
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert staff in their tenant" ON staff
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update staff in their tenant" ON staff
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete staff in their tenant" ON staff
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Recreate RLS policies for mobile money (tenant isolation)
CREATE POLICY "Users can view their tenant mobile money" ON mobile_money_transactions
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert mobile money in their tenant" ON mobile_money_transactions
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update mobile money in their tenant" ON mobile_money_transactions
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Recreate RLS policies for subscriptions (tenant isolation)
CREATE POLICY "Users can view their tenant subscriptions" ON subscriptions
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update subscriptions in their tenant" ON subscriptions
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Recreate super admin policies for tenants
CREATE POLICY "Super admin can view all tenants" ON tenants
  FOR SELECT USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admin can insert tenants" ON tenants
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admin can update tenants" ON tenants
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'super_admin');
