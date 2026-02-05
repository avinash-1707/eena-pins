import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    // 📱 PHONE + OTP
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
        username: { label: "Username", type: "text" },
        name: { label: "Name", type: "text" },
        description: { label: "Description", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const record = await prisma.phoneOTP.findFirst({
          where: { phone: credentials.phone, used: false },
        });

        if (!record) throw new Error("Invalid OTP");

        if (record.expiresAt < new Date()) throw new Error("OTP expired");

        if (record.attempts >= 3) throw new Error("Too many attempts");

        const valid = await bcrypt.compare(credentials.otp, record.otpHash);

        if (!valid) {
          await prisma.phoneOTP.update({
            where: { id: record.id },
            data: { attempts: { increment: 1 } },
          });
          throw new Error("Invalid OTP");
        }

        await prisma.phoneOTP.update({
          where: { id: record.id },
          data: { used: true },
        });

        const user = await prisma.user.upsert({
          where: { phone: credentials.phone },
          update: {},
          create: {
            phone: credentials.phone,
            username:
              credentials.username || `user_${credentials.phone.slice(-6)}`,
            name: credentials.name || undefined,
            description: credentials.description || "",
          },
        });

        return {
          id: user.id,
          phone: user.phone,
          username: user.username,
          role: user.role,
          name: user.name ?? user.username,
          avatarUrl: user.avatarUrl ?? "",
        };
      },
    }),

    // 🌐 GOOGLE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      // 🌐 GOOGLE
      if (account.provider === "google") {
        const email = user.email!;

        let dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              {
                accounts: {
                  some: {
                    provider: "google",
                    providerAccountId: account.providerAccountId,
                  },
                },
              },
            ],
          },
        });

        // 1️⃣ Create user if none exists
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email,
              username: email.split("@")[0],
              name: user.name,
              avatarUrl: user.image,
              description: "",
            },
          });
        }

        // 2️⃣ Link account if not linked
        const alreadyLinked = await prisma.account.findFirst({
          where: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        });

        if (!alreadyLinked) {
          await prisma.account.create({
            data: {
              userId: dbUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
            },
          });
        }
      }

      // 📱 PHONE OTP
      if (account.provider === "phone-otp") {
        // already handled in authorize()
        return true;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        // For Google login, fetch the actual DB user
        if (account?.provider === "google") {
          const dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: user.email! },
                {
                  accounts: {
                    some: {
                      provider: "google",
                      providerAccountId: account.providerAccountId,
                    },
                  },
                },
              ],
            },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.username = dbUser.username;
            token.role = dbUser.role;
            token.avatarUrl = dbUser.avatarUrl ?? undefined;
            token.name = dbUser.name ?? dbUser.username;
          }
        } else {
          // For phone-otp, the user object already has correct DB data
          token.id = user.id;
          token.username = user.username;
          token.role = user.role;
          token.avatarUrl = user.avatarUrl ?? undefined;
          token.name = user.name ?? user.username;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.role = token.role as string;
      session.user.avatarUrl = token.avatarUrl;
      session.user.name = token.name;
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
