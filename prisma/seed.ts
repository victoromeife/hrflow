import { PrismaClient, Role, EmploymentStatus } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash("Admin@123", 12);

    const admin = await prisma.user.upsert({
        where: { email: "admin@hrflow.com" },
        update: {},
        create: {
            email: "admin@hrflow.com",
            password,
            fullName: "System Admin",
            role: Role.ADMIN,
            employmentStatus: EmploymentStatus.ACTIVE,
            position: "Administrator",
        },
    });

    console.log("Admin created:", admin.email);
    console.log("Password: Admin@123");
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });