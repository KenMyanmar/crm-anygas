
-- First, let's check if RLS is enabled and add policies for restaurant visibility

-- Create policy to allow all authenticated users to view all restaurants
CREATE POLICY "All users can view all restaurants" 
ON restaurants 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy to allow all authenticated users to insert new restaurants
CREATE POLICY "All users can create restaurants" 
ON restaurants 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create policy to allow all authenticated users to update restaurants
CREATE POLICY "All users can update restaurants" 
ON restaurants 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create policy to allow admins to delete restaurants
CREATE POLICY "Admins can delete restaurants" 
ON restaurants 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
