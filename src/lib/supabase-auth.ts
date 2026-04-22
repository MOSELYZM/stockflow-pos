import { supabase } from './supabase';

// Sign up a new tenant with Supabase auth
export const signUpTenant = async (email: string, password: string, businessName: string, location: string, adminName: string) => {
  try {
    // Create Supabase auth user with metadata
    // The database trigger will automatically create tenant, user, and subscription records
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: adminName,
          role: 'admin',
          business_name: businessName,
          location: location,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    return { success: true, userId: authData.user.id };
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
