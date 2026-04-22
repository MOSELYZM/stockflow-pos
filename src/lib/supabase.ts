import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          business_name: string;
          location: string;
          currency: string;
          tax_rate: number;
          tin?: string;
          vat_registration?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          location: string;
          currency?: string;
          tax_rate?: number;
          tin?: string;
          vat_registration?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          location?: string;
          currency?: string;
          tax_rate?: number;
          tin?: string;
          vat_registration?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          tenant_id: string;
          role: 'admin' | 'staff';
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          tenant_id: string;
          role?: 'admin' | 'staff';
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          role?: 'admin' | 'staff';
        };
      };
      products: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          sku: string;
          category: string;
          price: number;
          cost: number;
          stock: number;
          reorder_level: number;
          image?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          sku: string;
          category: string;
          price: number;
          cost: number;
          stock?: number;
          reorder_level?: number;
          image?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          sku?: string;
          category?: string;
          price?: number;
          cost?: number;
          stock?: number;
          reorder_level?: number;
          image?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          tenant_id: string;
          date: string;
          customer: string;
          total: number;
          payment_method: string;
          staff_id?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          date?: string;
          customer?: string;
          total: number;
          payment_method: string;
          staff_id?: string;
          created_at?: string;
        };
        Update: {
          date?: string;
          customer?: string;
          total?: number;
          payment_method?: string;
          staff_id?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          price: number;
        };
        Update: {
          product_name?: string;
          quantity?: number;
          price?: number;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          tenant_id: string;
          tier: 'trial' | 'basic' | 'premium';
          status: 'active' | 'expired' | 'cancelled';
          trial_start_date: string;
          trial_end_date: string;
          subscription_start_date?: string;
          subscription_end_date?: string;
          last_payment_date?: string;
          monthly_fee: number;
          auto_renew: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          tier?: 'trial' | 'basic' | 'premium';
          status?: 'active' | 'expired' | 'cancelled';
          trial_start_date: string;
          trial_end_date: string;
          subscription_start_date?: string;
          subscription_end_date?: string;
          last_payment_date?: string;
          monthly_fee?: number;
          auto_renew?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tier?: 'trial' | 'basic' | 'premium';
          status?: 'active' | 'expired' | 'cancelled';
          subscription_start_date?: string;
          subscription_end_date?: string;
          last_payment_date?: string;
          auto_renew?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}
