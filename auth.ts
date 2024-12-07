import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { getServerSession, NextAuthOptions } from "next-auth";
import Discord from "next-auth/providers/discord";
import Github from "next-auth/providers/github";
import { prisma } from "./lib/prisma";

const {
  GITHUB_ID,
  GITHUB_SECRET,
  DISCORD_ID,
  DISCORD_SECRET,
  NEXTAUTH_SECRET,
} = process.env;
const providers = [];

if (GITHUB_ID && GITHUB_SECRET) {
  providers.push(
    Github({
      clientId: GITHUB_ID,
      clientSecret: GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (DISCORD_ID && DISCORD_SECRET) {
  providers.push(
    Discord({
      clientId: DISCORD_ID,
      clientSecret: DISCORD_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authConfig = {
  providers,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signIn",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
} satisfies NextAuthOptions;

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authConfig);
}
