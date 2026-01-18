import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge Component - CV Crush Design System
 *
 * Utilise les couleurs sémantiques pour clarté.
 * Variants: primary, success, warning, error, info, neutral, outline
 *
 * Features:
 * - Couleurs sémantiques claires
 * - Design tokens uniquement
 * - Sizes configurables
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neon-purple focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Primary: Gradient néon
        primary:
          "border-transparent bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-level-1",
        // Success: Vert
        success:
          "border-transparent bg-semantic-success/10 text-semantic-success border-semantic-success/20",
        // Warning: Ambre
        warning:
          "border-transparent bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20",
        // Error: Rouge
        error:
          "border-transparent bg-semantic-error/10 text-semantic-error border-semantic-error/20",
        // Info: Cyan
        info:
          "border-transparent bg-semantic-info/10 text-semantic-info border-semantic-info/20",
        // Neutral: Gris
        neutral:
          "border-transparent bg-surface-tertiary text-cvText-secondary",
        // Outline: Bordure uniquement
        outline:
          "border-cvBorder-medium text-cvText-primary bg-transparent",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-0.5",
        lg: "text-base px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "sm",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
