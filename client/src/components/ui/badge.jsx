import * as React from "react"
import { cn } from "../../lib/utils"

const Badge = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-comic-red text-white border-2 border-black shadow-comic-sm",
      secondary:
        "bg-comic-blue text-white border-2 border-black shadow-comic-sm",
      yellow:
        "bg-comic-yellow text-black border-2 border-black shadow-comic-sm",
      success:
        "bg-comic-green text-black border-2 border-black shadow-comic-sm",
      warning:
        "bg-orange-500 text-black border-2 border-black shadow-comic-sm",
      destructive:
        "bg-comic-magenta text-white border-2 border-black shadow-comic-sm",
      outline:
        "border-2 border-black text-black bg-white shadow-comic-sm",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-bangers uppercase tracking-widest transition-all",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
