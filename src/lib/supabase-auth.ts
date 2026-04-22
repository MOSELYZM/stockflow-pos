import { supabase } from './supabase';

// Sign up a new tenant with Supabase auth
export const signUpTenant = async (email: string, password: string, businessName: string, location: string, adminName: string) => {
  try {
    // 1. Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: adminName,
          role: 'admin',
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // 2. Create tenant record
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        business_name: businessName,
        location: location,
        currency: 'ZMK',
        tax_rate: 16,
        low_stock_threshold: 5,
      })
      .select()
      .single();

    if (tenantError) throw tenantError;
    if (!tenantData) throw new Error('Failed to create tenant');

    // 3. Create user record linking auth user to tenant
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: adminName,
        tenant_id: tenantData.id,
        role: 'admin',
      });

    if (userError) throw userError;

    // 4. Create subscription record
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 7);

    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        tenant_id: tenantData.id,
        tier: 'trial',
        status: 'active',
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        monthly_fee: 200,
        auto_renew: true,
      });

    if (subError) throw subError;

    return { success: true, tenantId: tenantData.id };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Sign in with Supabase auth
export const signInTenant = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to sign in');

    // Get user details with tenant info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, tenants(*)')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error('User not found');

    return {
      success: true,
      user: userData,
      session: data.session,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign out
export const signOutTenant = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, tenants(*)')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;
    return userData;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};
