-- DropForeignKey
ALTER TABLE "ShoppingItem" DROP CONSTRAINT "ShoppingItem_shoppingId_fkey";

-- AlterTable
ALTER TABLE "_StockItemMetaToStockItemTag" ADD CONSTRAINT "_StockItemMetaToStockItemTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_StockItemMetaToStockItemTag_AB_unique";

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_shoppingId_fkey" FOREIGN KEY ("shoppingId") REFERENCES "Shopping"("id") ON DELETE CASCADE ON UPDATE CASCADE;
