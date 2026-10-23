// components/departments/department-form.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema, type DepartmentInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActionState } from "react";

interface DepartmentFormProps {
  departments: { id: string; name: string }[];
  employees: { id: string; fullName: string; email: string }[];
  action: (prevState: any, formData: FormData) => Promise<{ error?: string; success?: string }>;
  submitLabel: string;
  defaultValues?: Partial<DepartmentInput> & { id?: string };
  onCancel?: () => void;
}

export function DepartmentForm({ departments, employees, action, submitLabel, defaultValues, onCancel }: DepartmentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues,
  });

  const [state, formAction] = useActionState(action, {});

  React.useEffect(() => {
    if (state?.success) {
      reset();
    }
  }, [state?.success, reset]);

  const onSubmit = (data: DepartmentInput) => {
    const fd = new FormData();
    fd.append("name", data.name);
    if (data.description) fd.append("description", data.description);
    if (data.parentId) fd.append("parentId", data.parentId);
    if (data.headId) fd.append("headId", data.headId);
    if (defaultValues?.id) fd.append("id", defaultValues.id);

    formAction(fd);
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{submitLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Department name" error={errors.name?.message} required>
            <Input {...register("name")} placeholder="Human Resources" />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <Input {...register("description")} placeholder="Optional description" />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Parent department" error={errors.parentId?.message}>
              <Select {...register("parentId")}>
                <option value="">None (top-level)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Department head" error={errors.headId?.message}>
              <Select {...register("headId")}>
                <option value="">No head</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.fullName} ({e.email})</option>
                ))}
              </Select>
            </FormField>
          </div>

          {state?.error && (
            <div className="text-sm text-red-400 bg-red-600/10 border border-red-600/30 rounded-lg px-4 py-3">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="text-sm text-emerald-300 bg-emerald-600/10 border border-emerald-600/30 rounded-lg px-4 py-3">
              {state.success}
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