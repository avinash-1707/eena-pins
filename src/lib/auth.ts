import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "sqlite",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        apple: {
            clientId: process.env.APPLE_CLIENT_ID as string,
            clientSecret: process.env.APPLE_CLIENT_SECRET as string,
            // Optional
            appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
        },
    },
    // Add appleid.apple.com to trustedOrigins for Sign In with Apple flows
    trustedOrigins: ["https://appleid.apple.com"],
});