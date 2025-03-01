import { prisma } from "@/lib/prisma";
import { Family, Member, MemberRole } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { createMiddleware } from "hono/factory";
import { FamilyNotFoundError, NoPermissionError } from "../errors";
import { defaultConfig, FamilyConfig } from "./config";

type Role = "OWNER" | MemberRole;

interface AuthUser {
    token: {
        sub: string;
    };
}

type FamilyBase = Prisma.FamilyGetPayload<{
    include: { FamilyOverrides: true };
}>;

type FamilyWithInclude<T extends Prisma.FamilyInclude | undefined> =
    T extends undefined ? FamilyBase : Prisma.FamilyGetPayload<{ include: T }>;

interface ContextVariables<T extends Prisma.FamilyInclude | undefined> {
    familyId: string;
    authUser: AuthUser;
    family: FamilyWithInclude<T> & { Config: FamilyConfig };
}

export const familyMiddleware = <
    T extends Prisma.FamilyInclude | undefined = undefined,
>(
    properties?: T,
    requiredRole: Role = "MEMBER",
) =>
    createMiddleware<{
        Variables: ContextVariables<T>;
    }>(async (c, next) => {
        const familyId = c.req.param("familyId");
        const { token } = c.var.authUser;
        console.log(
            `Accessing family with id: ${familyId} (required role: ${requiredRole})`,
        );
        const member = await prisma.member.findFirst({
            where: {
                familyId,
                userId: token?.sub,
            },
            include: {
                Family: {
                    include: {
                        ...(properties ?? {}),
                        FamilyOverrides: true,
                    },
                },
            },
        });
        if (!member) {
            throw new FamilyNotFoundError();
        }
        if (!checkRole(member, requiredRole)) {
            throw new NoPermissionError(requiredRole, member.role);
        }
        const { FamilyOverrides, ...familyWithoutOverrides } = member.Family;

        const familyObject = {
            ...familyWithoutOverrides,
            Config: {
                ...defaultConfig(),
                ...Object.fromEntries(
                    member.Family.FamilyOverrides.map((o) => {
                        const key = o.parameter as keyof FamilyConfig;
                        const defaultValue = defaultConfig()[key];

                        // FamilyConfig のプロパティが number 型ならキャスト
                        if (typeof defaultValue === "number") {
                            const parsedValue = Number(o.value);
                            if (isNaN(parsedValue)) {
                                console.warn(
                                    `Invalid FamilyOverride: ${o.parameter}=${o.value}`,
                                );
                                return [key, defaultValue]; // デフォルト値を使う
                            }
                            return [key, parsedValue];
                        }

                        return [key, o.value]; // number 以外はそのまま
                    }),
                ),
            },
        };
        c.set(
            "family",
            familyObject as unknown as FamilyWithInclude<T> & {
                Config: FamilyConfig;
            },
        );
        await next();
    });

export function checkRole(
    member: Member & { Family: Family },
    requiredRole: Role,
): boolean {
    if (requiredRole === "MEMBER") {
        return true;
    } else if (requiredRole === "OWNER") {
        return member.Family.ownerId === member.userId;
    } else {
        return (
            member.role === requiredRole ||
            member.Family.ownerId === member.userId
        );
    }
}
