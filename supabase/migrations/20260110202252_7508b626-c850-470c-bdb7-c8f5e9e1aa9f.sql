-- Drop all existing overly permissive policies
DROP POLICY IF EXISTS "Allow all access to menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow all access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow all access to expenses" ON public.expenses;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.menu_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.menu_items;
DROP POLICY IF EXISTS "Enable update for all users" ON public.menu_items;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.menu_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable update for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable update for all users" ON public.expenses;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.expenses;

-- Create secure RLS policies - only authenticated users can access data
-- Menu Items policies
CREATE POLICY "Authenticated users can read menu_items"
ON public.menu_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert menu_items"
ON public.menu_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update menu_items"
ON public.menu_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete menu_items"
ON public.menu_items FOR DELETE
TO authenticated
USING (true);

-- Orders policies
CREATE POLICY "Authenticated users can read orders"
ON public.orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete orders"
ON public.orders FOR DELETE
TO authenticated
USING (true);

-- Order Items policies
CREATE POLICY "Authenticated users can read order_items"
ON public.order_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert order_items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update order_items"
ON public.order_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete order_items"
ON public.order_items FOR DELETE
TO authenticated
USING (true);

-- Expenses policies
CREATE POLICY "Authenticated users can read expenses"
ON public.expenses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert expenses"
ON public.expenses FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update expenses"
ON public.expenses FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete expenses"
ON public.expenses FOR DELETE
TO authenticated
USING (true);