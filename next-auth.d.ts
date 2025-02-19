// next-auth.d.ts
import "next-auth";

declare module "@auth/core/types" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
        } | undefined;
    }

    interface JWT {
        id: string;
        role: string;
    }
}
