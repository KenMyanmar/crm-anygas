
-- Create a function to safely delete a restaurant and all its dependencies
CREATE OR REPLACE FUNCTION public.delete_restaurant_safely(restaurant_uuid uuid)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  restaurant_name_var text;
  current_user_role user_role;
BEGIN
  -- Check if user is admin
  SELECT role INTO current_user_role 
  FROM users 
  WHERE id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RETURN QUERY SELECT FALSE, 'Only admins can delete restaurants';
    RETURN;
  END IF;

  -- Get restaurant name for logging
  SELECT name INTO restaurant_name_var 
  FROM restaurants 
  WHERE id = restaurant_uuid;

  IF restaurant_name_var IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Restaurant not found';
    RETURN;
  END IF;

  -- Delete in the correct dependency order to avoid foreign key violations
  BEGIN
    -- Delete calendar events
    DELETE FROM calendar_events WHERE restaurant_id = restaurant_uuid;
    
    -- Delete calls
    DELETE FROM calls WHERE restaurant_id = restaurant_uuid;
    
    -- Delete dual business visits
    DELETE FROM dual_business_visits WHERE restaurant_id = restaurant_uuid;
    
    -- Delete enhanced tasks
    DELETE FROM enhanced_tasks WHERE restaurant_id = restaurant_uuid;
    
    -- Delete leads
    DELETE FROM leads WHERE restaurant_id = restaurant_uuid;
    
    -- Delete meetings
    DELETE FROM meetings WHERE restaurant_id = restaurant_uuid;
    
    -- Delete order items first, then orders
    DELETE FROM order_items WHERE order_id IN (
      SELECT id FROM orders WHERE restaurant_id = restaurant_uuid
    );
    DELETE FROM orders WHERE restaurant_id = restaurant_uuid;
    
    -- Delete tasks
    DELETE FROM tasks WHERE restaurant_id = restaurant_uuid;
    
    -- Delete UCO collection items
    DELETE FROM uco_collection_items WHERE restaurant_id = restaurant_uuid;
    
    -- Delete visit tasks and related comments
    DELETE FROM visit_comments WHERE visit_task_id IN (
      SELECT id FROM visit_tasks WHERE restaurant_id = restaurant_uuid
    );
    DELETE FROM visit_tasks WHERE restaurant_id = restaurant_uuid;
    
    -- Delete voice notes
    DELETE FROM voice_notes WHERE restaurant_id = restaurant_uuid;
    
    -- Delete notes
    DELETE FROM notes WHERE target_type = 'restaurant' AND target_id = restaurant_uuid;
    
    -- Finally delete the restaurant
    DELETE FROM restaurants WHERE id = restaurant_uuid;

    -- Log the deletion
    INSERT INTO migration_log (action, table_name, details)
    VALUES (
      'DELETE_RESTAURANT',
      'restaurants',
      jsonb_build_object(
        'restaurant_id', restaurant_uuid,
        'restaurant_name', restaurant_name_var,
        'deleted_by', auth.uid(),
        'timestamp', NOW()
      )
    );

    RETURN QUERY SELECT TRUE, 'Restaurant "' || restaurant_name_var || '" and all related data deleted successfully';

  EXCEPTION WHEN OTHERS THEN
    -- Log the error
    INSERT INTO migration_log (action, table_name, details)
    VALUES (
      'DELETE_RESTAURANT_FAILED',
      'restaurants',
      jsonb_build_object(
        'restaurant_id', restaurant_uuid,
        'restaurant_name', restaurant_name_var,
        'error', SQLERRM,
        'attempted_by', auth.uid(),
        'timestamp', NOW()
      )
    );

    RETURN QUERY SELECT FALSE, 'Failed to delete restaurant: ' || SQLERRM;
  END;
END;
$function$;
