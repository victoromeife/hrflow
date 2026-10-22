// app/(auth)/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import { z } from "zod";
import { redirect } from "next/navigation";
import { Role, EmploymentStatus } from "@/app/generated/prisma";

const registerSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});

export async function registerAction(formData: FormData) {
    const raw = {
        fullName: formData.get("fullName") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        phone: formData.get("phone") as string | undefined,
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { fullName, email, password, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return { error: "Email already registered" };
    }

    const hashed = await hashPassword(password);

    // First user becomes ADMIN, others are EMPLOYEE (simple rule for demo)
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? Role.ADMIN : Role.EMPLOYEE;

    const user = await prisma.user.create({
        data: {
            fullName,
            email,
            password: hashed,
            phone: phone || null,
            role,
            employmentStatus: EmploymentStatus.ACTIVE,
        },
    });

    await createSession({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        departmentId: user.departmentId,
    });

    redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
    const raw = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { error: "Invalid email or password" };
    }

    if (user.employmentStatus !== EmploymentStatus.ACTIVE) {
        return { error: "Account is inactive. Contact HR." };
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
        return { error: "Invalid email or password" };
    }

    await createSession({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        departmentId: user.departmentId,
    });

    redirect("/dashboard");
}

export async function logoutAction() {
    await destroySession();
    redirect("/login");
}