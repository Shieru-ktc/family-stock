"use client";

import { FamilyConfig } from "@/api/src/family/config";
import { FamilyWithUserMember } from "@/types";
import { atom } from "jotai";

export const familyAtom = atom<
    (FamilyWithUserMember & { Config: FamilyConfig }) | undefined
>(undefined);
