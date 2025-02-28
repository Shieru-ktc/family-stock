import { UserRole } from "@prisma/client"; // Prisma の UserRole をインポート

declare module "@auth/core/types" {
    interface Session {
        user: {
            role?: UserRole; // role を追加
        } & DefaultSession["user"];
    }

    interface User {
        role?: UserRole; // User に role を追加
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        role?: UserRole; // JWT に role を追加
    }
}
