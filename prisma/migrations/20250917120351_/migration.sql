/*
  Warnings:

  - You are about to drop the column `price` on the `MenuItemOption` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `OrderItemOption` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."MenuItemOption" DROP COLUMN "price",
ADD COLUMN     "is_required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_selections" INTEGER;

-- AlterTable
ALTER TABLE "public"."OrderItemOption" DROP COLUMN "price";

-- CreateTable
CREATE TABLE "public"."MenuItemOptionVariant" (
    "variant_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "variant_name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuItemOptionVariant_pkey" PRIMARY KEY ("variant_id")
);

-- CreateTable
CREATE TABLE "public"."OrderItemOptionVariant" (
    "id" TEXT NOT NULL,
    "order_item_option_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "variant_name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemOptionVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_menu_item_option_variant_option_id" ON "public"."MenuItemOptionVariant"("option_id");

-- CreateIndex
CREATE INDEX "idx_order_item_option_variant_order_item_option_id" ON "public"."OrderItemOptionVariant"("order_item_option_id");

-- AddForeignKey
ALTER TABLE "public"."MenuItemOptionVariant" ADD CONSTRAINT "MenuItemOptionVariant_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."MenuItemOption"("option_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItemOptionVariant" ADD CONSTRAINT "OrderItemOptionVariant_order_item_option_id_fkey" FOREIGN KEY ("order_item_option_id") REFERENCES "public"."OrderItemOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItemOptionVariant" ADD CONSTRAINT "OrderItemOptionVariant_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."MenuItemOptionVariant"("variant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
