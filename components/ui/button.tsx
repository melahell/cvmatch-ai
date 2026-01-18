import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Button Component - CV Crush Design System
 *
 * Utilise les design tokens pour garantir la cohérence visuelle.
 * Variants: primary (néon), secondary, ghost, destructive, outline, link
 * Sizes: sm, md, lg, icon
 *
 * Features:
 * - Loading state avec spinner
 * - Full width option
 * - Design tokens uniquement (zéro hardcode)
 */
const buttonVariants = cva(
  // Base styles (communs à tous les variants)
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] hover:scale-[1.02]",
  {
    variants: {
      variant: {
        // Primary: Gradient néon (CTA principal)
        primary:
          "bg-gradient-to-r from-neon-pink via-neon-purple to-neon-indigo text-white shadow-level-3 hover:shadow-level-4 hover:opacity-90",
        // Secondary: Surface avec bordure
        secondary:
          "bg-surface-secondary text-cvText-primary border border-cvBorder-light hover:bg-surface-tertiary shadow-level-1 hover:shadow-level-2",
        // Ghost: Transparent avec hover
        ghost:
          "text-cvText-secondary hover:bg-surface-secondary hover:text-cvText-primary",
        // Destructive: Rouge sémantique
        destructive:
          "bg-semantic-error text-white shadow-level-2 hover:shadow-level-3 hover:opacity-90",
        // Outline: Bordure uniquement
        outline:
          "border-2 border-neon-purple text-neon-purple bg-transparent hover:bg-neon-purple/10",
        // Link: Style texte
        link:
          "text-neon-purple underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-md",
        md: "h-10 px-4 text-base rounded-lg",
        lg: "h-12 px-6 text-lg rounded-xl",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    type = "button",
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        type={asChild ? undefined : type}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && leftIcon && <span>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span>{rightIcon}</span>}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
