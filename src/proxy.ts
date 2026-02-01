import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

/**
 * Role → Allowed route prefixes
 * Add new roles or routes here in future
 */
const ROLE_ACCESS_MAP: Record<string, string[]> = {
    ADMIN: ["/dashboard"],
    BRAND: ["/brand-dashboard"],
};

function isAuthorizedForPath(role: string | undefined, pathname: string) {
    if (!role) return false;

    const allowedPaths = ROLE_ACCESS_MAP[role];
    if (!allowedPaths) return false;

    return allowedPaths.some((path) =>
        pathname === path || pathname.startsWith(`${path}/`)
    );
}

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const role = req.nextauth.token?.role as string | undefined;

        // Block access if role is not allowed for this path
        if (!isAuthorizedForPath(role, pathname)) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // must be logged in
        },
        pages: {
            signIn: "/sign-in",
        },
        secret: process.env.NEXTAUTH_SECRET,
    }
);

/**
 * Only run middleware on protected dashboard routes
 */
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/brand-dashboard/:path*",
    ],
};
