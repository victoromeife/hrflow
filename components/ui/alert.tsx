// components/ui/alert.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error";
}

const alertVariants = {
  default: "bg-slate-800/50 text-slate-200 border-slate-700",
  success: "bg-emerald-600/10 text-emerald-300 border-emerald-600/30",
  warning: "bg-amber-600/10 text-amber-300 border-amber-600/30",
  error: "bg-red-600/10 text-red-300 border-red-600/30",
};

export function Alert({ variant = "default", className, ...props }: AlertProps) {
  return (
    <div className={cn("rounded-lg border p-4 text-sm", alertVariants[variant], className)} {...props} />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("font-semibold mb-1", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-inherit opacity-90", className)} {...props} />;
}