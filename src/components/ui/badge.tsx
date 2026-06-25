import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-black text-white",
    success: "bg-black text-white",
    warning: "bg-gray-700 text-white",
    danger: "bg-gray-900 text-white border border-white",
    outline: "border border-black text-black bg-white",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
