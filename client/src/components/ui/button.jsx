import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-comic-red text-white border-comic border-black shadow-comic hover:bg-comic-yellow hover:text-black",
      secondary:
        "bg-comic-blue text-white border-comic border-black shadow-comic hover:bg-comic-yellow hover:text-black",
      success:
        "bg-comic-green text-black border-comic border-black shadow-comic hover:bg-comic-yellow",
      yellow:
        "bg-comic-yellow text-black border-comic border-black shadow-comic hover:bg-comic-red hover:text-white",
      outline:
        "border-comic border-black text-black hover:bg-comic-yellow bg-white shadow-comic",
      ghost:
        "hover:bg-comic-yellow text-black border-2 border-transparent hover:border-black",
      magenta:
        "bg-comic-magenta text-white border-comic border-black shadow-comic hover:bg-comic-yellow hover:text-black",
      cyan:
        "bg-comic-cyan text-black border-comic border-black shadow-comic hover:bg-comic-yellow",
    }

    const sizes = {
      default: "h-12 px-6 py-2",
      sm: "h-10 px-4 text-sm",
      lg: "h-14 px-8 text-xl",
      icon: "h-12 w-12",
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-bangers uppercase tracking-widest transition-all",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-comic-yellow",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95 active:shadow-comic-sm hover:animate-comic-pop",
          "touch-manipulation",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        style={{
          WebkitTapHighlightColor: 'transparent',
          ...props.style
        }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
