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

-- Allow public to insert into tenants (for signup)
DROP POLICY IF EXISTS "Users can insert tenants in their tenant" ON tenants;
CREATE POLICY "Allow public insert for signup" ON tenants
  FOR INSERT WITH CHECK (true);

-- Allow public to insert into users (for signup)
DROP POLICY IF EXISTS "Users can insert users in their tenant" ON users;
CREATE POLICY "Allow public insert for signup" ON users
  FOR INSERT WITH CHECK (true);

-- Allow public to insert into subscriptions (for signup)
DROP POLICY IF EXISTS "Users can update subscriptions in their tenant" ON subscriptions;
CREATE POLICY "Allow public insert for signup" ON subscriptions
  FOR INSERT WITH CHECK (true);
