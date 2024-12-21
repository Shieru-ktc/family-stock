-- AlterTable
ALTER TABLE "StockItemMeta" ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "StockItemTag" ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "_StockItemMetaToStockItemTag" ADD CONSTRAINT "_StockItemMetaToStockItemTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_StockItemMetaToStockItemTag_AB_unique";
