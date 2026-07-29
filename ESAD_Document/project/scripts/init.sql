-- PostgreSQL initialisation script
-- Creates required extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- For accent-insensitive search

-- Create ENUM types
DO $$ BEGIN
  CREATE TYPE user_role       AS ENUM ('viewer','editor','admin','super_admin');
  CREATE TYPE vehicle_status  AS ENUM ('draft','published','unpublished','archived');
  CREATE TYPE vehicle_source  AS ENUM ('cms','google_sheets');
  CREATE TYPE lead_type       AS ENUM ('enquiry','booking','callback','sell_car');
  CREATE TYPE lead_status     AS ENUM ('new','notified','notification_failed','contacted','qualified','converted','lost','follow_up');
  CREATE TYPE sell_car_status AS ENUM ('new','reviewing','offer_made','accepted','rejected');
  CREATE TYPE sync_status     AS ENUM ('running','completed','failed','partial');
  CREATE TYPE job_status      AS ENUM ('pending','processing','completed','failed','dead_lettered');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
