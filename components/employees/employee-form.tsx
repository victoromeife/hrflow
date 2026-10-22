// components/employees/employee-form.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Department } from "@/app/generated/prisma";

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeInput> & { id?: string };
  departments: Department[];
  action: (formData: FormData) => Promise<{ error?: string; success?: string }>;
  submitLabel: string;
  onCancel?: () => void;
}

export function EmployeeForm({ defaultValues, departments, action, submitLabel, onCancel }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employmentStatus: "ACTIVE",
      ...defaultValues,
    },
  });

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);

  const onSubmit = async (data: EmployeeInput) => {
    setServerError(null);
    setServerSuccess(null);
    const fd = new FormData();
    fd.append("fullName", data.fullName);
    fd.append("email", data.email);
    if (data.phone) fd.append("phone", data.phone);
    fd.append("position", data.position);
    if (data.departmentId) fd.append("departmentId", data.departmentId);
    fd.append("employmentStatus", data.employmentStatus);
    if (defaultValues?.id) fd.append("id", defaultValues.id);

    const result = await action(fd);
    if (result?.error) {
      setServerError(result.error);
    } else if (result?.success) {
      setServerSuccess(result.success);
      reset();
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{submitLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full name" error={errors.fullName?.message} required>
              <Input {...register("fullName")} placeholder="Jane Doe" />
            </FormField>
            <FormField label="Email" error={errors.email?.message} required>
              <Input {...register("email")} type="email" placeholder="jane@company.com" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register("phone")} type="tel" placeholder="+1 555 000 0000" />
            </FormField>
            <FormField label="Position" error={errors.position?.message} required>
              <Input {...register("position")} placeholder="Software Engineer" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Department" error={errors.departmentId?.message}>
              <Select {...register("departmentId")}>
                <option value="">No department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Status" error={errors.employmentStatus?.message} required>
              <Select {...register("employmentStatus")}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TERMINATED">Terminated</option>
              </Select>
            </FormField>
          </div>

          {serverError && (
            <div className="text-sm text-red-400 bg-red-600/10 border border-red-600/30 rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}
          {serverSuccess && (
            <div className="text-sm text-emerald-300 bg-emerald-600/10 border border-emerald-600/30 rounded-lg px-4 py-3">
              {serverSuccess}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}