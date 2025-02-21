import { prisma } from "@/lib/prisma";
import { Family, Member, MemberRole } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { createMiddleware } from "hono/factory";
import { FamilyNotFoundError, NoPermissionError } from "../errors";

type Role = "OWNER" | MemberRole;

interface AuthUser {
    token: {
        sub: string;
    };
}

type FamilyBase = Prisma.FamilyGetPayload<{ include: { Members: true } }>;

type FamilyWithInclude<T extends Prisma.FamilyInclude | undefined> =
    T extends undefined
        ? FamilyBase // include なしの場合は基本型のみ
        : Prisma.FamilyGetPayload<{ include: T & { Members: true } }>;

interface ContextVariables<T extends Prisma.FamilyInclude | undefined> {
    familyId: string;
    authUser: AuthUser;
    family: FamilyWithInclude<T> | undefined; // `undefined` を許容
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
                        Members: true,
                        ...(properties ?? {}),
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
        c.set("family", member?.Family as FamilyWithInclude<T>);
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
        return member.role === requiredRole;
    }
}
