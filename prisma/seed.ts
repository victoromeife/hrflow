import { PrismaClient, Role, EmploymentStatus, LeaveType, LeaveStatus, ConversationType } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const empPassword = await bcrypt.hash("Welcome@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@hrflow.com" },
    update: { role: Role.ADMIN },
    create: {
      email: "admin@hrflow.com",
      password: adminPassword,
      fullName: "System Admin",
      role: Role.ADMIN,
      employmentStatus: EmploymentStatus.ACTIVE,
      position: "Administrator",
    },
  });

  const hrManager = await prisma.user.upsert({
    where: { email: "hr@hrflow.com" },
    update: {},
    create: {
      email: "hr@hrflow.com",
      password: empPassword,
      fullName: "Sarah HR",
      role: Role.HR_MANAGER,
      employmentStatus: EmploymentStatus.ACTIVE,
      position: "HR Manager",
    },
  });

  const org = await prisma.department.upsert({
    where: { id: "org-root" },
    update: {},
    create: { id: "org-root", name: "Organization", description: "Root department" },
  });

  const hr = await prisma.department.upsert({
    where: { id: "dept-hr" },
    update: {},
    create: { id: "dept-hr", name: "Human Resources", description: "HR department", parentId: "org-root", headId: hrManager.id },
  });

  const ops = await prisma.department.upsert({
    where: { id: "dept-ops" },
    update: {},
    create: { id: "dept-ops", name: "Operations", description: "Operations department", parentId: "org-root" },
  });

  const finance = await prisma.department.upsert({
    where: { id: "dept-fin" },
    update: {},
    create: { id: "dept-fin", name: "Finance", description: "Finance department", parentId: "org-root" },
  });

  const recruitment = await prisma.department.upsert({
    where: { id: "dept-rec" },
    update: {},
    create: { id: "dept-rec", name: "Recruitment", description: "Recruitment team", parentId: "dept-hr" },
  });

  const employees = [
    { email: "alice@hrflow.com", fullName: "Alice Johnson", position: "Recruiter", departmentId: "dept-rec" },
    { email: "bob@hrflow.com", fullName: "Bob Smith", position: "Field Operator", departmentId: "dept-ops" },
    { email: "carol@hrflow.com", fullName: "Carol White", position: "Accountant", departmentId: "dept-fin" },
    { email: "dave@hrflow.com", fullName: "Dave Brown", position: "HR Specialist", departmentId: "dept-hr" },
  ];

  for (const emp of employees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email: emp.email,
        password: empPassword,
        fullName: emp.fullName,
        role: Role.EMPLOYEE,
        employmentStatus: EmploymentStatus.ACTIVE,
        position: emp.position,
        departmentId: emp.departmentId,
      },
    });
  }

  // Sample leave request
  const alice = await prisma.user.findUnique({ where: { email: "alice@hrflow.com" } });
  if (alice) {
    const existingLeave = await prisma.leaveRequest.findFirst({ where: { userId: alice.id } });
    if (!existingLeave) {
      const start = new Date();
      start.setDate(start.getDate() + 5);
      const end = new Date(start);
      end.setDate(end.getDate() + 2);
      await prisma.leaveRequest.create({
        data: {
          userId: alice.id,
          leaveType: LeaveType.ANNUAL,
          startDate: start,
          endDate: end,
          reason: "Annual vacation",
          status: LeaveStatus.PENDING,
        },
      });
    }
  }

  // Sample attendance for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existingAtt = await prisma.attendance.findUnique({ where: { userId_date: { userId: admin.id, date: today } } });
  if (!existingAtt) {
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    await prisma.attendance.create({
      data: { userId: admin.id, date: today, clockIn: now, status: "PRESENT" },
    });
  }

  // Sample conversation
  const existingConv = await prisma.conversation.findFirst({ where: { type: ConversationType.PRIVATE } });
  if (!existingConv && alice) {
    await prisma.conversation.create({
      data: {
        type: ConversationType.PRIVATE,
        participants: { create: [{ userId: admin.id }, { userId: alice.id }] },
        messages: {
          create: {
            senderId: admin.id,
            content: "Welcome to HRFlow!",
            createdAt: new Date(),
          },
        },
      },
    });
  }

  console.log("Seed completed successfully");
  console.log("Admin: admin@hrflow.com / Admin@123");
  console.log("Employees: Welcome@123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });