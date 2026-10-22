// components/attendance/attendance-client.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { clockIn, clockOut } from "@/app/(dashboard)/attendance/actions";
import { ClockIcon } from "@/components/icons";
import type { User, Attendance } from "@/app/generated/prisma";

interface AttendanceClientProps {
  user: { id: string; fullName: string; role: string };
  records: (Attendance & { user: { id: string; fullName: string; email: string } })[];
  presentToday: number;
  todayRecord: Attendance | null;
  canViewAll: boolean;
}

export function AttendanceClient({ user, records, presentToday, todayRecord, canViewAll }: AttendanceClientProps) {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleClockIn = async () => {
    setLoading(true);
    setMessage(null);
    const res = await clockIn();
    setMessage(res.error || res.success || null);
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    setMessage(null);
    const res = await clockOut();
    setMessage(res.error || res.success || null);
    setLoading(false);
  };

  const hasClockedIn = !!todayRecord?.clockIn;
  const hasClockedOut = !!todayRecord?.clockOut;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-slate-400 text-sm mt-1">Clock in and out, view attendance history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-400">Your status today</p>
            <div className="mt-2">
              {hasClockedOut ? (
                <Badge variant="success">Clocked out</Badge>
              ) : hasClockedIn ? (
                <Badge variant="warning">Clocked in</Badge>
              ) : (
                <Badge variant="secondary">Not clocked in</Badge>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={handleClockIn} disabled={loading || hasClockedIn}>
                Clock In
              </Button>
              <Button size="sm" variant="outline" onClick={handleClockOut} disabled={loading || !hasClockedIn || hasClockedOut}>
                Clock Out
              </Button>
            </div>
            {message && (
              <p className={cn("text-xs mt-3", message.includes("error") || message.includes("not") ? "text-red-400" : "text-emerald-400")}>
                {message}
              </p>
            )}
          </CardContent>
        </Card>

        {canViewAll && (
          <Card className="md:col-span-2">
            <CardContent className="p-5">
              <p className="text-sm text-slate-400">Employees present today</p>
              <p className="text-3xl font-bold mt-2 tracking-tight">{presentToday}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{canViewAll ? "Recent Attendance" : "Your Attendance History"}</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <EmptyState icon={<ClockIcon className="w-8 h-8" />} title="No attendance records" description="Clock in to start tracking your attendance." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {canViewAll && <TableHead>Employee</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    {canViewAll && (
                      <TableCell>
                        <a href={`/employees/${r.user.id}`} className="text-slate-100 hover:text-indigo-400 transition">
                          {r.user.fullName}
                        </a>
                      </TableCell>
                    )}
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                    <TableCell>{r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={r.clockOut ? "success" : r.clockIn ? "warning" : "secondary"}>
                        {r.clockOut ? "Completed" : r.clockIn ? "In progress" : "Absent"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}