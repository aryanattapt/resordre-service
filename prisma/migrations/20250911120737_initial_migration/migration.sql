-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('dine_in', 'delivery');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('pending', 'in_progress', 'ready', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "public"."Business" (
    "business_id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "business_address" TEXT,
    "business_phone_num" VARCHAR(20),
    "register_date" DATE NOT NULL,
    "soft_opening_date" DATE,
    "close_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("business_id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."MenuCategory" (
    "category_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "public"."MenuItem" (
    "item_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "image_url" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "public"."MenuItemOption" (
    "option_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuItemOption_pkey" PRIMARY KEY ("option_id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "order_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "table_id" TEXT,
    "customer_id" TEXT,
    "type" "public"."OrderType" NOT NULL,
    "status" "public"."OrderStatus" NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "tax" DECIMAL(65,30) NOT NULL,
    "delivery_fee" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "grand_total" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "order_item_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "public"."OrderItemOption" (
    "id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "idx_category_business_id" ON "public"."MenuCategory"("business_id");

-- CreateIndex
CREATE INDEX "idx_menu_item_business_id" ON "public"."MenuItem"("business_id");

-- CreateIndex
CREATE INDEX "idx_menu_item_category_id" ON "public"."MenuItem"("category_id");

-- CreateIndex
CREATE INDEX "idx_menu_item_is_available" ON "public"."MenuItem"("is_available");

-- CreateIndex
CREATE INDEX "idx_menu_item_option_item_id" ON "public"."MenuItemOption"("item_id");

-- CreateIndex
CREATE INDEX "idx_orders_business_id" ON "public"."Order"("business_id");

-- CreateIndex
CREATE INDEX "idx_orders_status" ON "public"."Order"("status");

-- CreateIndex
CREATE INDEX "idx_orders_type" ON "public"."Order"("type");

-- CreateIndex
CREATE INDEX "idx_order_item_order_id" ON "public"."OrderItem"("order_id");

-- CreateIndex
CREATE INDEX "idx_order_item_option_order_item_id" ON "public"."OrderItemOption"("order_item_id");

-- AddForeignKey
ALTER TABLE "public"."MenuCategory" ADD CONSTRAINT "MenuCategory_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuItem" ADD CONSTRAINT "MenuItem_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuItem" ADD CONSTRAINT "MenuItem_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."MenuCategory"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuItemOption" ADD CONSTRAINT "MenuItemOption_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."MenuItem"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."MenuItem"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItemOption" ADD CONSTRAINT "OrderItemOption_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "public"."OrderItem"("order_item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItemOption" ADD CONSTRAINT "OrderItemOption_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."MenuItemOption"("option_id") ON DELETE RESTRICT ON UPDATE CASCADE;
