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
                        username: `user_${credentials.phone.slice(-6)}`,
                        description: "",
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
            if (account?.provider === "google") {
                const email = user.email!;
                const existingUser = await prisma.user.findUnique({
                    where: { email },
                });

                if (existingUser) {
                    if (!existingUser.providerAccountId) {
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: {
                                provider: "google",
                                providerAccountId: account.providerAccountId,
                            },
                        });
                    }
                } else {
                    await prisma.user.create({
                        data: {
                            email,
                            username: email.split("@")[0],
                            description: "",
                            name: user.name,
                            avatarUrl: user.image,
                            provider: "google",
                            providerAccountId: account.providerAccountId,
                        },
                    });
                }
            }
            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.uid = user.id;
                token.username = user.username;
                token.role = user.role;
            }
            return token;
        },

        async session({ session, token }) {
            session.user.id = token.uid as string;
            session.user.username = token.username as string;
            session.user.role = token.role as string;
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
