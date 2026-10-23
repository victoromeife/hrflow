// components/departments/departments-client.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DepartmentForm } from "./department-form";
import { DepartmentsTree } from "./departments-tree";
import { createDepartment, deleteDepartment } from "@/app/(dashboard)/departments/actions";
import type { Department, User } from "@/app/generated/prisma";

interface DepartmentNode extends Department {
  head: User | null;
  employees: User[];
  parent: Department | null;
  children: DepartmentNode[];
}

interface DepartmentsClientProps {
  departments: DepartmentNode[];
  employees: { id: string; fullName: string; email: string }[];
  canManage: boolean;
}

export function DepartmentsClient({ departments, employees, canManage }: DepartmentsClientProps) {
  const [showCreate, setShowCreate] = React.useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    const res = await deleteDepartment(id);
    if (res?.error) alert(res.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-slate-400 text-sm mt-1">Hierarchical organizational structure</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreate(true)}>+ New Department</Button>
        )}
      </div>

      <DepartmentsTree
        departments={departments}
        canManage={canManage}
        onEdit={() => {}}
        onDelete={handleDelete}
      />

      <Modal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Create Department"
        description="Add a new department to the organization hierarchy."
      >
        <DepartmentForm
          departments={departments.map((d) => ({ id: d.id, name: d.name }))}
          employees={employees}
          action={createDepartment}
          submitLabel="Create Department"
          onCancel={() => setShowCreate(false)}
        />
      </Modal>
    </div>
  );
}