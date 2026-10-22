// components/employees/employee-detail-client.tsx
"use client";

import * as React from "react";
import { EmployeeDetailView } from "./employee-detail-view";
import { Modal } from "@/components/ui/modal";
import { EmployeeForm } from "./employee-form";
import { updateEmployee } from "@/app/(dashboard)/employees/actions";
import { Button } from "@/components/ui/button";
import type { User, Department, Attendance, LeaveRequest } from "@/app/generated/prisma";

interface EmployeeDetailClientProps {
  employee: User & { department: { id: string; name: string } | null };
  attendances: Attendance[];
  leaves: LeaveRequest[];
  canManage: boolean;
  departments: Department[];
}

export default function EmployeeDetailClient({ employee, attendances, leaves, canManage, departments }: EmployeeDetailClientProps) {
  const [showEdit, setShowEdit] = React.useState(false);

  return (
    <div>
      <EmployeeDetailView employee={employee} attendances={attendances} leaves={leaves} canManage={canManage} />

      <Modal
        open={showEdit}
        onOpenChange={setShowEdit}
        title="Edit Employee"
        description="Update employee information."
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button form="employee-edit-form" type="submit">Save</Button>
          </>
        }
      >
        <EmployeeForm
          defaultValues={{
            id: employee.id,
            fullName: employee.fullName,
            email: employee.email,
            phone: employee.phone || undefined,
            position: employee.position || "",
            departmentId: employee.departmentId || undefined,
            employmentStatus: employee.employmentStatus,
          }}
          departments={departments}
          action={updateEmployee}
          submitLabel="Save Changes"
          onCancel={() => setShowEdit(false)}
        />
      </Modal>
    </div>
  );
}