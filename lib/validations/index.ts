import { z } from "zod";

export const employeeSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  departmentId: z.string().optional().nullable(),
  employmentStatus: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]),
});

export const departmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  headId: z.string().optional().nullable(),
});

export const leaveSchema = z.object({
  leaveType: z.enum(["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().min(1, "Reason is required"),
});

export const messageSchema = z.object({
  conversationId: z.string(),
  content: z.string().optional(),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type LeaveInput = z.infer<typeof leaveSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
