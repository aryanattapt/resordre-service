/*
  Warnings:

  - The values [in_progress] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `note` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `OrderItemOption` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `OrderItemOptionVariant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_number]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_number` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base_price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `option_name` to the `OrderItemOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_price` to the `OrderItemOptionVariant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pending', 'partial', 'paid', 'refunded');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('cash', 'card', 'digital_wallet', 'bank_transfer', 'credit');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrderStatus_new" AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled');
ALTER TABLE "public"."Order" ALTER COLUMN "status" TYPE "public"."OrderStatus_new" USING ("status"::text::"public"."OrderStatus_new");
ALTER TYPE "public"."OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "public"."OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
COMMIT;

-- AlterEnum
ALTER TYPE "public"."OrderType" ADD VALUE 'takeaway';

-- AlterTable
ALTER TABLE "public"."Business" ADD COLUMN     "order_counter" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "customer_name" TEXT,
ADD COLUMN     "customer_phone" TEXT,
ADD COLUMN     "estimated_time" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "order_number" TEXT NOT NULL,
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "tip_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "public"."OrderItem" DROP COLUMN "note",
DROP COLUMN "price",
ADD COLUMN     "base_price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "special_instructions" TEXT,
ADD COLUMN     "total_price" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrderItemOption" DROP COLUMN "name",
ADD COLUMN     "option_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."OrderItemOptionVariant" DROP COLUMN "price",
ADD COLUMN     "variant_price" DECIMAL(65,30) NOT NULL;

-- CreateTable
CREATE TABLE "public"."Payment" (
    "payment_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "payment_method" "public"."PaymentMethod" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'pending',
    "transaction_id" TEXT,
    "reference" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateIndex
CREATE INDEX "idx_payment_order_id" ON "public"."Payment"("order_id");

-- CreateIndex
CREATE INDEX "idx_payment_status" ON "public"."Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_number_key" ON "public"."Order"("order_number");

-- CreateIndex
CREATE INDEX "idx_orders_order_number" ON "public"."Order"("order_number");

-- CreateIndex
CREATE INDEX "idx_orders_created_at" ON "public"."Order"("created_at");

-- CreateIndex
CREATE INDEX "idx_order_item_item_id" ON "public"."OrderItem"("item_id");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;
