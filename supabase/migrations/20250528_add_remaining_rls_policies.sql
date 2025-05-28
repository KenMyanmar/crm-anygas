
-- Add remaining RLS policies for leads
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
CREATE POLICY "Users can create leads" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update leads" ON public.leads;
CREATE POLICY "Users can update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add RLS policies for restaurants
DROP POLICY IF EXISTS "Users can create restaurants" ON public.restaurants;
CREATE POLICY "Users can create restaurants" ON public.restaurants
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update restaurants" ON public.restaurants;
CREATE POLICY "Users can update restaurants" ON public.restaurants
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add RLS policies for orders
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (created_by_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update orders" ON public.orders;
CREATE POLICY "Users can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add RLS policies for activity logs
DROP POLICY IF EXISTS "Users can create activity logs" ON public.activity_logs;
CREATE POLICY "Users can create activity logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()::text);
