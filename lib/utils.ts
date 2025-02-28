import { Member, MemberRole, TagColor } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function tagColorToCn(color: TagColor) {
    switch (color) {
        case "RED":
            return "bg-red-500 dark:bg-red-400";
        case "ORANGE":
            return "bg-orange-500 dark:bg-orange-400";
        case "YELLOW":
            return "bg-yellow-500 dark:bg-yellow-400";
        case "GREEN":
            return "bg-green-500 dark:bg-green-400";
        case "BLUE":
            return "bg-blue-500 dark:bg-blue-400";
        case "PURPLE":
            return "bg-purple-500 dark:bg-purple-400";
        case "PINK":
            return "bg-pink-500 dark:bg-pink-400";
        case "BROWN":
            return "bg-yellow-800 dark:bg-yellow-700";
        case "GREY":
            return "bg-gray-500 dark:bg-gray-400";
        case "WHITE":
            return "bg-gray-100 dark:bg-white text-black";
        case "BLACK":
            return "bg-black dark:bg-gray-900 dark:text-white";
    }
}

export function getRole(member: Member, ownerId: string) {
    if (ownerId == member.userId) {
        return "OWNER";
    } else if (member.role == MemberRole.ADMIN) {
        return "ADMIN";
    } else {
        return "MEMBER";
    }
}

export function getRoleLabel(member: Member, ownerId: string) {
    switch (getRole(member, ownerId)) {
        case "OWNER":
            return "オーナー";
        case "ADMIN":
            return "管理者";
        case "MEMBER":
            return "メンバー";
    }
}
