-- 孤児Metaの削除
DELETE FROM "StockItemMeta"
WHERE "id" NOT IN (SELECT "metaId" FROM "StockItem");

-- DropForeignKey
ALTER TABLE "StockItem" DROP CONSTRAINT "StockItem_metaId_fkey";

-- DropIndex
DROP INDEX "StockItem_metaId_key";

-- AlterTable: 新しい stockItemId カラムを追加
ALTER TABLE "StockItemMeta" ADD COLUMN "stockItemId" TEXT;

-- 既存データの stockItemId を更新
UPDATE "StockItemMeta" SET "stockItemId" = (
  SELECT "id" FROM "StockItem" WHERE "StockItem"."metaId" = "StockItemMeta"."id"
);

-- stockItemId を NOT NULL 制約付きに変更
ALTER TABLE "StockItemMeta" ALTER COLUMN "stockItemId" SET NOT NULL;

-- metaId の削除
ALTER TABLE "StockItem" DROP COLUMN "metaId";

-- CreateIndex
CREATE UNIQUE INDEX "StockItemMeta_stockItemId_key" ON "StockItemMeta"("stockItemId");

-- AddForeignKey
ALTER TABLE "StockItemMeta" ADD CONSTRAINT "StockItemMeta_stockItemId_fkey" 
FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;
