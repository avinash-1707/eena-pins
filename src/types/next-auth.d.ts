import "next-auth";
import { DefaultUser } from "next-auth";

declare module "next-auth" {
    interface User {
        id?: string;
        role: string;
        avatarUrl: string;
        name: string;
        username: string;
    }

    interface Session {
        user: {
            id?: string;
            role: string;
            avatarUrl: string;
            name: string;
            username: string;
        } & DefaultUser["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: string;
        avatarUrl?: string;
        name?: string;
        username?: string;
    }
}