/*
  Warnings:

  - A unique constraint covering the columns `[familyId,position]` on the table `StockItemMeta` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `position` to the `StockItemMeta` table without a default value. This is not possible if the table is not empty.

*/
-- -- AlterTable
-- ALTER TABLE "StockItemMeta" ADD COLUMN     "position" TEXT NOT NULL;

-- -- CreateIndex
-- CREATE UNIQUE INDEX "StockItemMeta_familyId_position_key" ON "StockItemMeta"("familyId", "position");

-- 既存データの兼ね合いがあるので手作業で修正
ALTER TABLE "StockItemMeta" ADD COLUMN "position" TEXT;

UPDATE "StockItemMeta"
SET "position" = '0:' || SUBSTRING("id" FROM LENGTH("id") - 4 FOR 5) || ':'
WHERE "position" IS NULL;

ALTER TABLE "StockItemMeta" ALTER COLUMN "position" SET NOT NULL;
ALTER TABLE "StockItemMeta" ADD CONSTRAINT "StockItemMeta_familyId_position_key" UNIQUE ("familyId", "position");
