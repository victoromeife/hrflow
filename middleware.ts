import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);
const COOKIE_NAME = "hrflow_session";

const publicPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public auth pages
    if (publicPaths.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Protect everything under (dashboard)
    if (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/employees") ||
        pathname.startsWith("/departments") ||
        pathname.startsWith("/attendance") ||
        pathname.startsWith("/leave") ||
        pathname.startsWith("/messages")) {

        const token = request.cookies.get(COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            await jwtVerify(token, AUTH_SECRET);
            return NextResponse.next();
        } catch {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/employees/:path*",
        "/departments/:path*",
        "/attendance/:path*",
        "/leave/:path*",
        "/messages/:path*",
        "/login",
        "/register",
    ],
};