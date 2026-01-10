-- Drop the old permissive "Anyone can..." policies that bypass authentication
DROP POLICY IF EXISTS "Anyone can delete expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can read expenses" ON public.expenses;

DROP POLICY IF EXISTS "Anyone can delete menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can read menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can update menu items" ON public.menu_items;

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can read order items" ON public.order_items;

DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON public.orders;