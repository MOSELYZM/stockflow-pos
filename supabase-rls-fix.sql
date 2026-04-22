-- Update RLS policies to allow authenticated users to insert their own data

-- Allow authenticated users to insert into tenants (for signup)
DROP POLICY IF EXISTS "Allow public insert for signup" ON tenants;
CREATE POLICY "Allow authenticated insert for signup" ON tenants
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to insert into users (for signup)
DROP POLICY IF EXISTS "Allow public insert for signup" ON users;
CREATE POLICY "Allow authenticated insert for signup" ON users
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to insert into subscriptions (for signup)
DROP POLICY IF EXISTS "Allow public insert for signup" ON subscriptions;
CREATE POLICY "Allow authenticated insert for signup" ON subscriptions
  FOR INSERT WITH CHECK (true);

-- Drop the auth trigger since we're doing manual creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
