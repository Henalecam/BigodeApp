import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "border-transparent bg-primary text-primary-foreground",
        variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground",
        variant === "success" && "border-transparent bg-success/10 text-success",
        variant === "warning" && "border-transparent bg-warning/10 text-warning",
        variant === "danger" && "border-transparent bg-danger/10 text-danger",
        variant === "outline" && "border-primary/20 text-primary",
        className
      )}
      {...props}
    />
  )
}

export { Badge }

