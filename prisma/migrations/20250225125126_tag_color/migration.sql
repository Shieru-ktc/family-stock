/*
  Warnings:

  - The `color` column on the `StockItemTag` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TagColor" AS ENUM ('RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE', 'PINK', 'BROWN', 'GREY', 'BLACK', 'WHITE');

-- AlterTable
ALTER TABLE "StockItemTag" DROP COLUMN "color",
ADD COLUMN     "color" "TagColor" NOT NULL DEFAULT 'WHITE';
