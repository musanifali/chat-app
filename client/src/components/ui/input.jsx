import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full border-comic border-black bg-white px-4 py-2 text-base font-comic font-bold text-black placeholder:text-gray-500 transition-all",
          "focus:outline-none focus:shadow-glow-yellow focus:border-comic-yellow",
          "hover:shadow-comic-sm",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full border-comic border-black bg-white px-4 py-2 text-base font-comic font-bold text-black placeholder:text-gray-500 transition-all resize-none",
          "focus:outline-none focus:shadow-glow-yellow focus:border-comic-yellow",
          "hover:shadow-comic-sm",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Input, Textarea }
