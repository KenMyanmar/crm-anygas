
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular"
  lines?: number
}

function SkeletonEnhanced({
  className,
  variant = "default",
  lines = 1,
  ...props
}: SkeletonProps) {
  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "skeleton-base rounded h-4",
              i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
              className
            )}
            {...props}
          />
        ))}
      </div>
    )
  }

  const variantClasses = {
    default: "rounded-md",
    text: "rounded h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-none"
  }

  return (
    <div
      className={cn(
        "skeleton-base bg-muted",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { SkeletonEnhanced }
