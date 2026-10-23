// components/leave/leave-client.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { LeaveForm } from "./leave-form";
import { createLeaveRequest, approveLeaveRequest, rejectLeaveRequest, cancelLeaveRequest } from "@/app/(dashboard)/leave/actions";
import { CalendarIcon } from "@/components/icons";
import type { User, LeaveRequest } from "@/app/generated/prisma";

interface LeaveClientProps {
  user: { id: string; fullName: string; role: string };
  requests: (LeaveRequest & { user: { id: string; fullName: string; email: string }; reviewedBy: { id: string; fullName: string } | null })[];
  pendingCount: number;
  canApprove: boolean;
}

const statusVariant = (s: string) => {
  if (s === "APPROVED") return "success" as const;
  if (s === "REJECTED") return "danger" as const;
  if (s === "CANCELLED") return "secondary" as const;
  return "warning" as const;
};

export function LeaveClient({ user, requests, pendingCount, canApprove }: LeaveClientProps) {
  const [showRequest, setShowRequest] = React.useState(false);

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this leave request?")) return;
    const res = await approveLeaveRequest(id);
    if (res?.error) alert(res.error);
  };

  const handleReject = async (id: string) => {
    const note = prompt("Rejection note (optional):") || undefined;
    const res = await rejectLeaveRequest(id, note);
    if (res?.error) alert(res.error);
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this leave request?")) return;
    const res = await cancelLeaveRequest(id);
    if (res?.error) alert(res.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
          <p className="text-slate-400 text-sm mt-1">
            {canApprove ? `${pendingCount} pending request(s) awaiting approval` : "Manage your leave requests"}
          </p>
        </div>
        <Button onClick={() => setShowRequest(true)}>+ Request Leave</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{canApprove ? "All Leave Requests" : "Your Leave Requests"}</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <EmptyState icon={<CalendarIcon className="w-8 h-8" />} title="No leave requests" description="Submit a leave request to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {canApprove && <TableHead>Employee</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    {canApprove && (
                      <TableCell>
                        <a href={`/employees/${r.user.id}`} className="text-slate-100 hover:text-indigo-400 transition">
                          {r.user.fullName}
                        </a>
                      </TableCell>
                    )}
                    <TableCell>{r.leaveType.replace("_", " ")}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-300 max-w-xs truncate">{r.reason}</TableCell>
                    <TableCell><Badge variant={statusVariant(r.status)}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canApprove && r.status === "PENDING" && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(r.id)}>Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(r.id)}>Reject</Button>
                          </>
                        )}
                        {!canApprove && r.status === "PENDING" && (
                          <Button size="sm" variant="ghost" onClick={() => handleCancel(r.id)}>Cancel</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        open={showRequest}
        onOpenChange={setShowRequest}
        title="Request Leave"
        description="Submit a new leave request for approval."
      >
        <LeaveForm action={createLeaveRequest} submitLabel="Submit Request" onCancel={() => setShowRequest(false)} />
      </Modal>
    </div>
  );
}