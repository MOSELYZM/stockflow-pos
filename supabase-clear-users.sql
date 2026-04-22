-- Clear all users and related data for testing
-- WARNING: This deletes ALL data! Use with caution.

-- Delete from child tables first (to avoid foreign key errors)
DELETE FROM payment_history;
DELETE FROM mobile_money_transactions;
DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM products;
DELETE FROM expenses;
DELETE FROM customers;
DELETE FROM staff;
DELETE FROM subscriptions;
DELETE FROM users;
DELETE FROM tenants;

-- Delete from auth.users (Supabase auth system)
DELETE FROM auth.users WHERE email NOT LIKE '%supabase%';
