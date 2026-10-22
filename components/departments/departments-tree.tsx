// components/departments/departments-tree.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuildingIcon, ChevronIcon } from "@/components/icons";
import type { Department, User } from "@/app/generated/prisma";

interface DepartmentNode extends Department {
  head: User | null;
  employees: User[];
  parent: Department | null;
  children: DepartmentNode[];
}

interface DepartmentsTreeProps {
  departments: DepartmentNode[];
  canManage: boolean;
  onEdit: (dept: DepartmentNode) => void;
  onDelete: (id: string) => void;
}

export function DepartmentsTree({ departments, canManage, onEdit, onDelete }: DepartmentsTreeProps) {
  if (departments.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No departments created yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {departments.map((dept) => (
        <DepartmentCard
          key={dept.id}
          dept={dept}
          canManage={canManage}
          onEdit={onEdit}
          onDelete={onDelete}
          level={0}
        />
      ))}
    </div>
  );
}

function DepartmentCard({
  dept,
  canManage,
  onEdit,
  onDelete,
  level,
}: {
  dept: DepartmentNode;
  canManage: boolean;
  onEdit: (dept: DepartmentNode) => void;
  onDelete: (id: string) => void;
  level: number;
}) {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <div className={cn("rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden", level > 0 && "ml-6")}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-500 hover:text-slate-300 transition"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronIcon expanded={expanded} />
          </button>
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-300 flex items-center justify-center font-semibold">
            <BuildingIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <Link href={`/departments/${dept.id}`} className="font-medium text-slate-100 hover:text-indigo-400 transition truncate block">
              {dept.name}
            </Link>
            <p className="text-xs text-slate-500">
              {dept.employees.length} employee{dept.employees.length !== 1 ? "s" : ""}
              {dept.head ? ` · Head: ${dept.head.fullName}` : " · No head"}
            </p>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(dept)}>Edit</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(dept.id)}
              className="text-red-400 hover:text-red-300"
              disabled={dept.children.length > 0}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {expanded && dept.children.length > 0 && (
        <div className="border-t border-slate-800 p-3 space-y-3">
          {dept.children.map((child) => (
            <DepartmentCard
              key={child.id}
              dept={child}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}