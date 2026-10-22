import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline";
}

const badgeVariants = {
  default: "bg-indigo-600/20 text-indigo-300",
  secondary: "bg-slate-800 text-slate-300",
  success: "bg-emerald-600/20 text-emerald-300",
  warning: "bg-amber-600/20 text-amber-300",
  danger: "bg-red-600/20 text-red-300",
  outline: "border border-slate-700 text-slate-300",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}