import { User } from "@prisma/client";

export function dummyUser(): User {
    return {
        id: "unknown",
        email: "unknown@example.com",
        name: "Unknown User",
        active: false,
        emailVerified: null,
        createdAt: new Date(2021, 0, 1, 0, 0, 0),
        image: null,
        role: "USER",
    };
}
