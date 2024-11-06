-- CreateTable
CREATE TABLE "_StockItemMetaToStockItemTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StockItemMetaToStockItemTag_AB_unique" ON "_StockItemMetaToStockItemTag"("A", "B");

-- CreateIndex
CREATE INDEX "_StockItemMetaToStockItemTag_B_index" ON "_StockItemMetaToStockItemTag"("B");

-- AddForeignKey
ALTER TABLE "_StockItemMetaToStockItemTag" ADD CONSTRAINT "_StockItemMetaToStockItemTag_A_fkey" FOREIGN KEY ("A") REFERENCES "StockItemMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StockItemMetaToStockItemTag" ADD CONSTRAINT "_StockItemMetaToStockItemTag_B_fkey" FOREIGN KEY ("B") REFERENCES "StockItemTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
