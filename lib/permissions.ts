import { Role } from "../app/generated/prisma";
import { SessionUser } from "./auth";

export function canManageEmployees(user: SessionUser) {
    return user.role === Role.ADMIN || user.role === Role.HR_MANAGER;
}

export function canManageDepartments(user: SessionUser) {
    return user.role === Role.ADMIN || user.role === Role.HR_MANAGER;
}

export function canApproveLeave(user: SessionUser) {
    return user.role === Role.ADMIN || user.role === Role.HR_MANAGER;
}

export function canViewAllAttendance(user: SessionUser) {
    return user.role === Role.ADMIN || user.role === Role.HR_MANAGER;
}

export function canAccessDashboardStats(user: SessionUser) {
    return user.role === Role.ADMIN || user.role === Role.HR_MANAGER;
}

// Private messages stay private – only participants
export function canViewConversation(
    user: SessionUser,
    participantUserIds: string[],
    participantDepartmentIds: string[]
) {
    // Simple version for now – we will expand for departmental visibility later
    return participantUserIds.includes(user.id);
}