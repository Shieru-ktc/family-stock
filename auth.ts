import Github from "next-auth/providers/github";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { getServerSession, NextAuthOptions } from "next-auth";
import Discord from "next-auth/providers/discord";
import { redirect } from "next/navigation";
import { prisma } from "./lib/prisma";

const { GITHUB_ID, GITHUB_SECRET, DISCORD_ID, DISCORD_SECRET, SECRET } =
  process.env;
const providers = [];

if (GITHUB_ID && GITHUB_SECRET) {
  providers.push(
    Github({
      clientId: GITHUB_ID,
      clientSecret: GITHUB_SECRET,
    })
  );
}

if (DISCORD_ID && DISCORD_SECRET) {
  providers.push(
    Discord({
      clientId: DISCORD_ID,
      clientSecret: DISCORD_SECRET,
    })
  );
}

export const authConfig = {
  providers,
  secret: SECRET,
  pages: {
    signIn: "/auth/signIn",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email || !user.name || !user.image) {
        return redirect("/auth/signIn?error=unknown");
      }
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
          },
        });
        console.log("New user created: ", user.email);
      } else {
        if (!existingUser.active) {
          throw new Error("inactiveAccount");
        }
        await prisma.user.update({
          where: { email: user.email },
          data: {
            name: user.name,
          },
        });
        console.log("User updated: ", user.email);
      }
      return true;
    },
    async session({ session, token }) {
      console.log("called session callback");
      session.user.role = token.role as string;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        console.log("called jwt callback");
        token.role = "aaa";
      }
      return token;
    },
  },
} satisfies NextAuthOptions;

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authConfig);
}
