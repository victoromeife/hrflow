import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Role, EmploymentStatus } from "../app/generated/prisma";

const AUTH_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);
const COOKIE_NAME = "hrflow_session";

export type SessionUser = {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    departmentId: string | null;
};

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashed: string) {
    return bcrypt.compare(password, hashed);
}

export async function createSession(user: SessionUser) {
    const token = await new SignJWT({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        departmentId: user.departmentId,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(AUTH_SECRET);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });
}

export async function getSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, AUTH_SECRET);
        return payload as unknown as SessionUser;
    } catch {
        return null;
    }
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(): Promise<SessionUser> {
    const session = await getSession();
    if (!session) {
        throw new Error("UNAUTHORIZED");
    }
    return session;
}

// Helper used in Server Actions / Route Handlers
export async function getCurrentUser() {
    const session = await getSession();
    if (!session) return null;

    // Always re-fetch from DB so we have fresh employmentStatus + role
    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            departmentId: true,
            employmentStatus: true,
            position: true,
            profileImage: true,
        },
    });

    if (!user || user.employmentStatus !== EmploymentStatus.ACTIVE) {
        return null;
    }

    return user;
}