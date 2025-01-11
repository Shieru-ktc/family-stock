/*
  Warnings:

  - A unique constraint covering the columns `[shoppingId]` on the table `Family` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[familyId]` on the table `Shopping` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stockItemId]` on the table `ShoppingItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_familyId_fkey";

-- DropForeignKey
ALTER TABLE "Shopping" DROP CONSTRAINT "Shopping_familyId_fkey";

-- DropForeignKey
ALTER TABLE "ShoppingItem" DROP CONSTRAINT "ShoppingItem_shoppingId_fkey";

-- AlterTable
ALTER TABLE "Family" ADD COLUMN     "shoppingId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Family_shoppingId_key" ON "Family"("shoppingId");

-- CreateIndex
CREATE UNIQUE INDEX "Shopping_familyId_key" ON "Shopping"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingItem_stockItemId_key" ON "ShoppingItem"("stockItemId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shopping" ADD CONSTRAINT "Shopping_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_shoppingId_fkey" FOREIGN KEY ("shoppingId") REFERENCES "Shopping"("familyId") ON DELETE CASCADE ON UPDATE CASCADE;
