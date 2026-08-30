-- CreateEnum
CREATE TYPE "PartCondition" AS ENUM ('NEW', 'REFURBISHED', 'USED');

-- CreateEnum
CREATE TYPE "PartStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "video_url" VARCHAR(500);

-- CreateTable
CREATE TABLE "part_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "part_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "sku" VARCHAR(80) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category_id" UUID,
    "brand_name" VARCHAR(100),
    "compatible_makes" JSONB,
    "condition" "PartCondition" NOT NULL DEFAULT 'NEW',
    "price" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'AED',
    "stock_qty" INTEGER NOT NULL DEFAULT 0,
    "image_url" VARCHAR(500),
    "status" "PartStatus" NOT NULL DEFAULT 'DRAFT',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "part_categories_slug_key" ON "part_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "parts_slug_key" ON "parts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "parts_sku_key" ON "parts"("sku");

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "part_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
