// components/employees/employee-detail-view.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { User, Attendance, LeaveRequest } from "@/app/generated/prisma";

interface EmployeeDetailViewProps {
  employee: User & { department: { id: string; name: string } | null };
  attendances: Attendance[];
  leaves: LeaveRequest[];
  canManage: boolean;
}

const statusVariant = (s: string) => {
  if (s === "ACTIVE") return "success" as const;
  if (s === "INACTIVE") return "warning" as const;
  return "danger" as const;
};

const leaveVariant = (s: string) => {
  if (s === "APPROVED") return "success" as const;
  if (s === "REJECTED") return "danger" as const;
  return "warning" as const;
};

export function EmployeeDetailView({ employee, attendances, leaves, canManage }: EmployeeDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={employee.profileImage} alt={employee.fullName} size="lg" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{employee.fullName}</h2>
            <p className="text-slate-400">{employee.position || "—"}</p>
          </div>
        </div>
        {canManage && (
          <Link href={`/employees/${employee.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
            <p className="text-sm text-slate-200">{employee.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Phone</p>
            <p className="text-sm text-slate-200">{employee.phone || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
            <Badge variant={statusVariant(employee.employmentStatus)}>
              {employee.employmentStatus.replace("_", " ")}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {attendances.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No attendance records</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendances.slice(0, 10).map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                      <TableCell>{a.clockIn ? new Date(a.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                      <TableCell>{a.clockOut ? new Date(a.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {leaves.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No leave requests</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.slice(0, 10).map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.leaveType.replace("_", " ")}</TableCell>
                      <TableCell><Badge variant={leaveVariant(l.status)}>{l.status}</Badge></TableCell>
                      <TableCell className="text-xs">
                        {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}