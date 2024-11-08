import { Family, StockItem, StockItemMeta, StockItemTag } from "@prisma/client";

export type StockItemWithPartialMeta = StockItem & { Meta: StockItemMeta };
export type StockItemWithMeta = StockItemWithPartialMeta & {
  Meta: { Family: Family };
};
export type StockItemWithFullMeta = StockItemWithMeta & {
  Tags: StockItemTag[];
};
export interface FailureResponse {
  success: false;
  error: string;
}
export interface SuccessResponse {
  success: true;
}
