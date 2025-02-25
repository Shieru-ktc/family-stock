/*
  Warnings:

  - The primary key for the `_StockItemMetaToStockItemTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_StockItemMetaToStockItemTag` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_StockItemMetaToStockItemTag" DROP CONSTRAINT "_StockItemMetaToStockItemTag_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_StockItemMetaToStockItemTag_AB_unique" ON "_StockItemMetaToStockItemTag"("A", "B");
