// components/departments/department-detail-client.tsx
"use client";

import * as React from "react";
import { DepartmentForm } from "./department-form";
import { updateDepartment } from "@/app/(dashboard)/departments/actions";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { Department, User } from "@/app/generated/prisma";

interface DepartmentNode extends Department {
  head: User | null;
  employees: User[];
  parent: Department | null;
  children: DepartmentNode[];
}

interface DepartmentDetailClientProps {
  department: DepartmentNode;
  allDepartments: { id: string; name: string; parentId: string | null }[];
  canManage: boolean;
}

export default function DepartmentDetailClient({ department, allDepartments, canManage }: DepartmentDetailClientProps) {
  const [showEdit, setShowEdit] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{department.name}</h1>
          {department.description && (
            <p className="text-slate-400 text-sm mt-1">{department.description}</p>
          )}
        </div>
        {canManage && (
          <Button variant="outline" onClick={() => setShowEdit(true)}>Edit</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Head</p>
            <p className="text-sm text-slate-200">{department.head?.fullName || "No head assigned"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Employees</p>
            <p className="text-sm text-slate-200">{department.employees.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Parent</p>
            <p className="text-sm text-slate-200">{department.parent?.name || "Top-level"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees in this department</CardTitle>
        </CardHeader>
        <CardContent>
          {department.employees.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No employees assigned</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {department.employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <a href={`/employees/${emp.id}`} className="text-slate-100 hover:text-indigo-400 transition">
                        {emp.fullName}
                      </a>
                    </TableCell>
                    <TableCell className="text-slate-300">{emp.position || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        open={showEdit}
        onOpenChange={setShowEdit}
        title="Edit Department"
        description="Update department details."
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button form="dept-edit-form" type="submit">Save</Button>
          </>
        }
      >
        <DepartmentForm
          departments={allDepartments.filter((d) => d.id !== department.id).map((d) => ({ id: d.id, name: d.name }))}
          employees={department.employees.map((e) => ({ id: e.id, fullName: e.fullName, email: e.email }))}
          action={updateDepartment}
          submitLabel="Save Changes"
          defaultValues={{
            id: department.id,
            name: department.name,
            description: department.description || "",
            parentId: department.parentId || undefined,
            headId: department.headId || undefined,
          }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>
    </div>
  );
}