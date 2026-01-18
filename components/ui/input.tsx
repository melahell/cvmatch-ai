import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input Component - CV Crush Design System
 *
 * Features:
 * - Focus néon avec ring
 * - Design tokens (borders, colors)
 * - États disabled/error
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-cvBorder-light bg-surface-primary px-3 py-2 text-sm text-cvText-primary shadow-level-1 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-cvText-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple focus-visible:ring-offset-2 focus-visible:border-neon-purple disabled:cursor-not-allowed disabled:opacity-50 hover:border-cvBorder-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
