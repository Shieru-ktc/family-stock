import {
  Family,
  Member,
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
