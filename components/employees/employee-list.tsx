// components/employees/employee-list.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { UsersIcon } from "@/components/icons";
import type { User } from "@/app/generated/prisma";

interface EmployeeListProps {
  employees: (User & { department: { id: string; name: string } | null })[];
  canManage: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onDelete: (id: string) => void;
  onDeactivate: (id: string) => void;
  deletingId: string | null;
}

const statusVariant = (s: string) => {
  if (s === "ACTIVE") return "success" as const;
  if (s === "INACTIVE") return "warning" as const;
  return "danger" as const;
};

export function EmployeeList({
  employees,
  canManage,
  search,
  onSearchChange,
  page,
  totalPages,
  onPageChange,
  onDelete,
  onDeactivate,
  deletingId,
}: EmployeeListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative max-w-sm w-full">
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div />
      </div>

      {employees.length === 0 ? (
        <EmptyState
          icon={<UsersIcon />}
          title="No employees found"
          description="Try adjusting your search or create a new employee."
        />
      ) : (
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar src={emp.profileImage} alt={emp.fullName} size="sm" />
                      <div>
                        <Link href={`/employees/${emp.id}`} className="font-medium text-slate-100 hover:text-indigo-400 transition">
                          {emp.fullName}
                        </Link>
                        <p className="text-xs text-slate-500">{emp.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">{emp.position || "—"}</TableCell>
                  <TableCell className="text-slate-300">{emp.department?.name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(emp.employmentStatus)}>
                      {emp.employmentStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/employees/${emp.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      {canManage && (
                        <>
                          <Link href={`/employees/${emp.id}/edit`}>
                            <Button variant="outline" size="sm">Edit</Button>
                          </Link>
                          {emp.employmentStatus === "ACTIVE" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeactivate(emp.id)}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(emp.id)}
                              className="text-red-400 hover:text-red-300"
                              disabled={deletingId === emp.id}
                            >
                              {deletingId === emp.id ? "Deleting..." : "Delete"}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="p-3 border-t border-slate-800">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}