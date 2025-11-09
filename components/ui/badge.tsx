import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm",
        variant === "default" && "border-transparent bg-gradient-to-r from-primary to-primary-800 text-white",
        variant === "secondary" && "border-transparent bg-gradient-to-r from-secondary to-secondary-600 text-white shadow-md",
        variant === "success" && "border-success/30 bg-gradient-to-r from-success-light to-success/20 text-success-dark font-bold",
        variant === "warning" && "border-warning/30 bg-gradient-to-r from-warning-light to-warning/20 text-warning-dark font-bold",
        variant === "danger" && "border-danger/30 bg-gradient-to-r from-danger-light to-danger/20 text-danger-dark font-bold",
        variant === "outline" && "border-accent/40 text-accent bg-accent/5",
        className
      )}
      {...props}
    />
  )
}

export { Badge }

