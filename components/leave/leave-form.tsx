// components/leave/leave-form.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaveSchema, type LeaveInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActionState } from "react";

interface LeaveFormProps {
  action: (prevState: any, formData: FormData) => Promise<{ error?: string; success?: string }>;
  submitLabel: string;
  onCancel?: () => void;
}

export function LeaveForm({ action, submitLabel, onCancel }: LeaveFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveInput>({
    resolver: zodResolver(leaveSchema),
  });

  const [state, formAction] = useActionState(action, {});

  React.useEffect(() => {
    if (state?.success) {
      reset();
    }
  }, [state?.success, reset]);

  const onSubmit = (data: LeaveInput) => {
    const fd = new FormData();
    fd.append("leaveType", data.leaveType);
    fd.append("startDate", data.startDate);
    fd.append("endDate", data.endDate);
    fd.append("reason", data.reason);

    formAction(fd);
  };

  const today = new Date().toISOString().slice(0, 16);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{submitLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Leave type" error={errors.leaveType?.message} required>
            <Select {...register("leaveType")}>
              <option value="ANNUAL">Annual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="MATERNITY">Maternity Leave</option>
              <option value="PATERNITY">Paternity Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
              <option value="OTHER">Other</option>
            </Select>
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Start date" error={errors.startDate?.message} required>
              <Input {...register("startDate")} type="datetime-local" min={today} />
            </FormField>
            <FormField label="End date" error={errors.endDate?.message} required>
              <Input {...register("endDate")} type="datetime-local" min={today} />
            </FormField>
          </div>

          <FormField label="Reason" error={errors.reason?.message} required>
            <Textarea {...register("reason")} placeholder="Explain the reason for your leave..." rows={3} />
          </FormField>

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
              {isSubmitting ? "Submitting..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}