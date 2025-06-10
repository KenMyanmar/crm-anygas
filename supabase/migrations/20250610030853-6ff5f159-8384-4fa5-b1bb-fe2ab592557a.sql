
-- Add townships column to support multiple townships as JSONB array
ALTER TABLE uco_collection_plans 
ADD COLUMN townships JSONB DEFAULT '[]'::jsonb;

-- Make the existing township column nullable for backward compatibility
ALTER TABLE uco_collection_plans 
ALTER COLUMN township DROP NOT NULL;

-- Update existing records to populate townships array from township column
UPDATE uco_collection_plans 
SET townships = jsonb_build_array(township) 
WHERE township IS NOT NULL AND (townships IS NULL OR townships = '[]'::jsonb);

-- Add a constraint to ensure at least one township is provided
ALTER TABLE uco_collection_plans 
ADD CONSTRAINT check_townships_not_empty 
CHECK (
  (townships IS NOT NULL AND jsonb_array_length(townships) > 0) OR 
  township IS NOT NULL
);
