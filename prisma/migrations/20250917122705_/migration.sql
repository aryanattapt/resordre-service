/*
  Warnings:

  - A unique constraint covering the columns `[business_email]` on the table `Business` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."BusinessType" AS ENUM ('restaurant', 'cafe', 'fast_food', 'food_truck', 'bakery', 'bar', 'catering');

-- CreateEnum
CREATE TYPE "public"."BusinessRole" AS ENUM ('owner', 'manager', 'staff', 'admin');

-- AlterTable
ALTER TABLE "public"."Business" ADD COLUMN     "business_email" TEXT,
ADD COLUMN     "business_logo" TEXT,
ADD COLUMN     "business_type" "public"."BusinessType" NOT NULL DEFAULT 'restaurant',
ADD COLUMN     "business_website" TEXT,
ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
ADD COLUMN     "owner_id" TEXT,
ADD COLUMN     "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.00,
ADD COLUMN     "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC';

-- CreateTable
CREATE TABLE "public"."BusinessUser" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "public"."BusinessRole" NOT NULL DEFAULT 'staff',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_business_user_business_id" ON "public"."BusinessUser"("business_id");

-- CreateIndex
CREATE INDEX "idx_business_user_user_id" ON "public"."BusinessUser"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUser_business_id_user_id_key" ON "public"."BusinessUser"("business_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Business_business_email_key" ON "public"."Business"("business_email");

-- CreateIndex
CREATE INDEX "idx_business_is_active" ON "public"."Business"("is_active");

-- CreateIndex
CREATE INDEX "idx_business_type" ON "public"."Business"("business_type");

-- AddForeignKey
ALTER TABLE "public"."BusinessUser" ADD CONSTRAINT "BusinessUser_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessUser" ADD CONSTRAINT "BusinessUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
