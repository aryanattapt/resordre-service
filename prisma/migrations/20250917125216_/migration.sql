/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[user_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('super_admin', 'admin', 'owner', 'manager', 'staff', 'cashier');

-- AlterEnum
ALTER TYPE "public"."BusinessRole" ADD VALUE 'cashier';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "locked_until" TIMESTAMP(3),
DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'staff';

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "token_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("token_id")
);

-- CreateTable
CREATE TABLE "public"."PasswordReset" (
    "reset_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("reset_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "public"."RefreshToken"("token");

-- CreateIndex
CREATE INDEX "idx_refresh_token_user_id" ON "public"."RefreshToken"("user_id");

-- CreateIndex
CREATE INDEX "idx_refresh_token_token" ON "public"."RefreshToken"("token");

-- CreateIndex
CREATE INDEX "idx_refresh_token_expires_at" ON "public"."RefreshToken"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "public"."PasswordReset"("token");

-- CreateIndex
CREATE INDEX "idx_password_reset_user_id" ON "public"."PasswordReset"("user_id");

-- CreateIndex
CREATE INDEX "idx_password_reset_token" ON "public"."PasswordReset"("token");

-- CreateIndex
CREATE INDEX "idx_password_reset_expires_at" ON "public"."PasswordReset"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_name_key" ON "public"."User"("user_name");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "idx_user_username" ON "public"."User"("user_name");

-- CreateIndex
CREATE INDEX "idx_user_is_active" ON "public"."User"("is_active");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordReset" ADD CONSTRAINT "PasswordReset_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
