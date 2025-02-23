import {
    Family,
    Member,
    Shopping,
    ShoppingItem,
    StockItem,
    StockItemMeta,
    StockItemTag,
    User,
} from "@prisma/client";

export type StockItemWithPartialMeta = StockItem & { Meta: StockItemMeta };
export type StockItemWithMeta = StockItemWithPartialMeta & {
    Meta: { Family: Family };
};
export type StockItemWithFullMeta = StockItemWithMeta & {
    Meta: { Tags: StockItemTag[] };
};
export interface FailureResponse {
    success: false;
    error: string;
}
export interface SuccessResponse {
    success: true;
}

export type FamilyWithMember = { Members: Member[] } & Family;
export type MemberWithUser = { User: User } & Member;
export type FamilyWithUserMember = {
    Members: MemberWithUser[];
} & FamilyWithMember;

export type PartialShopping = Shopping & {
    Items: PartialShoppingItemWithStockItemMeta[]
}
export type PartialShoppingWithFamily = PartialShopping & {
    Family: Family;
};
export type PartialShoppingItem = ShoppingItem;
export type PartialShoppingItemWithStockItem = PartialShoppingItem & {
    StockItem: StockItem;
};
export type PartialShoppingItemWithStockItemMeta =
    PartialShoppingItemWithStockItem & {
        StockItem: StockItemWithPartialMeta;
    };
export type FullShopping = PartialShoppingWithFamily & {
    Items: PartialShoppingItemWithStockItemMeta[];
};
