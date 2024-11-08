// next-auth.d.ts
import { User } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }

  interface JWT {
    id: string;
    role: string;
  }
}
