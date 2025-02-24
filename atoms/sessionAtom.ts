"use client";

import { Session } from "@auth/core/types";
import { atom } from "jotai";

export const sessionAtom = atom<Session | null | undefined>(undefined);
