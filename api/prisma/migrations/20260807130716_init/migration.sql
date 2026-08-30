-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('viewer', 'editor', 'admin', 'super_admin');

-- CreateEnum
CREATE TYPE "vehicle_status" AS ENUM ('draft', 'published', 'unpublished', 'archived');

-- CreateEnum
CREATE TYPE "vehicle_source" AS ENUM ('cms', 'google_sheets');

-- CreateEnum
CREATE TYPE "lead_type" AS ENUM ('enquiry', 'booking', 'callback', 'sell_car');

-- CreateEnum
CREATE TYPE "lead_status" AS ENUM ('new', 'notified', 'notification_failed', 'contacted', 'qualified', 'converted', 'lost', 'follow_up');

-- CreateEnum
CREATE TYPE "sell_car_status" AS ENUM ('new', 'reviewing', 'offer_made', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "sync_status" AS ENUM ('running', 'completed', 'failed', 'partial');

-- CreateEnum
CREATE TYPE "job_status" AS ENUM ('pending', 'processing', 'completed', 'failed', 'dead_lettered');

-- CreateEnum
CREATE TYPE "sync_quarantine_status" AS ENUM ('PENDING', 'RESOLVED', 'IGNORED');

-- CreateEnum
CREATE TYPE "journal_status" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'viewer',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "logo_url" VARCHAR(500),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "brand_id" UUID,
    "make" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "trim" VARCHAR(100),
    "year" INTEGER NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'AED',
    "mileage" VARCHAR(50),
    "transmission" VARCHAR(50),
    "fuel_type" VARCHAR(50),
    "body_type" VARCHAR(50),
    "exterior_color" VARCHAR(50),
    "interior_color" VARCHAR(50),
    "engine" VARCHAR(100),
    "doors" INTEGER DEFAULT 4,
    "description" TEXT,
    "specs_json" JSONB,
    "status" "vehicle_status" NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "source" "vehicle_source" NOT NULL DEFAULT 'cms',
    "sheet_row_id" VARCHAR(100),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "is_certified" BOOLEAN DEFAULT false,
    "has_service_history" BOOLEAN DEFAULT false,
    "has_inspection_report" BOOLEAN DEFAULT false,
    "has_warranty" BOOLEAN DEFAULT false,
    "finance_available" BOOLEAN DEFAULT false,
    "export_available" BOOLEAN DEFAULT false,
    "gcc_verified" BOOLEAN DEFAULT false,
    "no_accidents" BOOLEAN DEFAULT false,
    "original_paint" BOOLEAN DEFAULT false,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_images" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "url_original" VARCHAR(500) NOT NULL,
    "url_lg" VARCHAR(500),
    "url_md" VARCHAR(500),
    "url_sm" VARCHAR(500),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "media_category" TEXT NOT NULL DEFAULT 'Exterior',
    "title" VARCHAR(255),
    "description" TEXT,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_hotspots" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "subtitle" VARCHAR(100) NOT NULL,
    "details" TEXT NOT NULL,
    "stat" VARCHAR(100) NOT NULL,
    "x_position" DOUBLE PRECISION NOT NULL,
    "y_position" DOUBLE PRECISION NOT NULL,
    "icon_type" VARCHAR(50) NOT NULL,
    "part_image_url" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vehicle_hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_spec_configs" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "hex_color" VARCHAR(20) NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vehicle_spec_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "country_code" VARCHAR(10) DEFAULT '+971',
    "lead_type" "lead_type" NOT NULL DEFAULT 'enquiry',
    "status" "lead_status" NOT NULL DEFAULT 'new',
    "message" TEXT,
    "utm_source" VARCHAR(100),
    "utm_medium" VARCHAR(100),
    "utm_campaign" VARCHAR(100),
    "metadata" JSONB,
    "assigned_to" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_car_submissions" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "car_make" VARCHAR(100) NOT NULL,
    "car_model" VARCHAR(100) NOT NULL,
    "car_year" INTEGER NOT NULL,
    "car_mileage" VARCHAR(50),
    "description" TEXT,
    "asking_price" VARCHAR(50),
    "image_urls" JSONB,
    "status" "sell_car_status" NOT NULL DEFAULT 'new',
    "assigned_to" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sell_car_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_categories" (
    "id" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(100),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "faq_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" JSONB,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "rows_processed" INTEGER NOT NULL DEFAULT 0,
    "rows_inserted" INTEGER NOT NULL DEFAULT 0,
    "rows_updated" INTEGER NOT NULL DEFAULT 0,
    "status" "sync_status" NOT NULL DEFAULT 'running',
    "errors_json" JSONB,
    "triggered_by" VARCHAR(50) NOT NULL DEFAULT 'cron',

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_quarantines" (
    "id" UUID NOT NULL,
    "sheet_row_id" VARCHAR(100),
    "raw_row_data" JSONB NOT NULL,
    "validation_errors" JSONB NOT NULL,
    "status" "sync_quarantine_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sync_quarantines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journals" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "snippet" TEXT NOT NULL,
    "content" TEXT,
    "image_url" VARCHAR(500) NOT NULL,
    "read_time" VARCHAR(50) NOT NULL,
    "status" "journal_status" NOT NULL DEFAULT 'DRAFT',
    "author_id" UUID,
    "tags" TEXT[],
    "published_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_stories" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "section_type" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vehicle_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_360_frames" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_360_frames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_sounds" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "sound_type" VARCHAR(100) NOT NULL,
    "audio_url" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_sounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" VARCHAR(50) NOT NULL DEFAULT 'global',
    "showroom_name" VARCHAR(200) NOT NULL,
    "address" TEXT NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "whatsapp_number" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "opening_hours" TEXT NOT NULL,
    "map_embed_url" TEXT,
    "social_links" JSONB,
    "hero_banner" JSONB,
    "featured_vehicle_selection_rules" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_slug_key" ON "vehicles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_sheet_row_id_key" ON "vehicles"("sheet_row_id");

-- CreateIndex
CREATE INDEX "vehicles_slug_idx" ON "vehicles"("slug");

-- CreateIndex
CREATE INDEX "vehicles_status_deleted_at_idx" ON "vehicles"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "vehicles_brand_id_status_idx" ON "vehicles"("brand_id", "status");

-- CreateIndex
CREATE INDEX "vehicles_is_featured_status_idx" ON "vehicles"("is_featured", "status");

-- CreateIndex
CREATE INDEX "vehicles_make_model_year_idx" ON "vehicles"("make", "model", "year");

-- CreateIndex
CREATE UNIQUE INDEX "faq_categories_slug_key" ON "faq_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "journals_slug_key" ON "journals"("slug");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_images" ADD CONSTRAINT "vehicle_images_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_hotspots" ADD CONSTRAINT "vehicle_hotspots_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_spec_configs" ADD CONSTRAINT "vehicle_spec_configs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_car_submissions" ADD CONSTRAINT "sell_car_submissions_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "faq_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_stories" ADD CONSTRAINT "vehicle_stories_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_360_frames" ADD CONSTRAINT "vehicle_360_frames_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_sounds" ADD CONSTRAINT "vehicle_sounds_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
