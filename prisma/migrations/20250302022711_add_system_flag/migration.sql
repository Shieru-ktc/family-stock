-- AlterTable
ALTER TABLE "StockItemMeta" ADD COLUMN     "system" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StockItemTag" ADD COLUMN     "system" BOOLEAN NOT NULL DEFAULT false;
