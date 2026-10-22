// components/employees/employees-client.tsx
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmployeeList } from "./employee-list";
import { Modal } from "@/components/ui/modal";
import { EmployeeForm } from "./employee-form";
import { createEmployee, deactivateEmployee, deleteEmployee } from "@/app/(dashboard)/employees/actions";
import type { User, Department } from "@/app/generated/prisma";

interface EmployeesClientProps {
  user: { fullName: string; role: string };
  employees: (User & { department: { id: string; name: string } | null })[];
  departments: Department[];
  canManage: boolean;
}

export function EmployeesClient({ employees, departments, canManage }: EmployeesClientProps) {
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [page, setPage] = React.useState(1);
  const [showCreate, setShowCreate] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const pageSize = 10;
  const filtered = employees.filter((e) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      e.fullName.toLowerCase().includes(s) ||
      e.email.toLowerCase().includes(s) ||
      (e.position || "").toLowerCase().includes(s) ||
      (e.department?.name || "").toLowerCase().includes(s)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee? This cannot be undone.")) return;
    setDeletingId(id);
    const res = await deleteEmployee(id);
    if (res?.error) alert(res.error);
    setDeletingId(null);
  };

  const handleDeactivate = async (id: string) => {
    const res = await deactivateEmployee(id);
    if (res?.error) alert(res.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your organization's workforce</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreate(true)}>+ New</Button>
        )}
      </div>

      <EmployeeList
        employees={paginated}
        canManage={canManage}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onDelete={handleDelete}
        onDeactivate={handleDeactivate}
        deletingId={deletingId}
      />

      <Modal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Create Employee"
        description="Add a new employee to the organization."
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button form="employee-create-form" type="submit">Create</Button>
          </>
        }
      >
        <EmployeeForm
          departments={departments}
          action={createEmployee}
          submitLabel="Create Employee"
          onCancel={() => setShowCreate(false)}
        />
      </Modal>
    </div>
  );
}