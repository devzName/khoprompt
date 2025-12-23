-- Enable required extensions if available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_redis') THEN
    CREATE EXTENSION IF NOT EXISTS pg_redis;
  END IF;
END$$;

-- Add more extensions here if needed
