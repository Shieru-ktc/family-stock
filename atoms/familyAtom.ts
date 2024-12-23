"use client";

import { FamilyWithUserMember } from "@/types";
import { atom } from "jotai";

export const familyAtom = atom<FamilyWithUserMember | undefined>(undefined);
