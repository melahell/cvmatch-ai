import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Card Component - CV Crush Design System
 *
 * Utilise les design tokens pour cohérence visuelle.
 * Variants: default, glass (glassmorphism), flat
 * Padding: none, sm, md, lg
 * Hover: none, lift, glow
 *
 * Features:
 * - Design tokens uniquement
 * - Glassmorphism moderne
 * - Hover effects configurables
 * - Accessibilité complète
 */
const cardVariants = cva(
  "rounded-lg transition-all duration-300",
  {
    variants: {
      variant: {
        // Default: Card standard avec ombre
        default:
          "bg-surface-primary border border-cvBorder-light shadow-level-2",
        // Glass: Glassmorphism moderne
        glass:
          "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-neon-purple/10 shadow-level-3",
        // Flat: Sans ombre ni bordure
        flat:
          "bg-surface-secondary",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      hover: {
        none: "",
        // Lift: Élévation au hover
        lift: "hover:shadow-level-3 hover:-translate-y-1",
        // Glow: Effet lumineux au hover
        glow: "hover:shadow-level-4 hover:border-neon-purple/30",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      hover: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hover, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-heading font-semibold text-cvText-primary leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-cvText-secondary", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const DataListCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn("group hover:shadow-md transition-all", className)}
    {...props}
  />
))
DataListCard.displayName = "DataListCard"

const DataListContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContent ref={ref} className={cn("p-4", className)} {...props} />
))
DataListContent.displayName = "DataListContent"

const DataListRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3", className)}
    {...props}
  />
))
DataListRow.displayName = "DataListRow"

const DataListMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 min-w-0", className)} {...props} />
))
DataListMain.displayName = "DataListMain"

const DataListActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-1", className)} {...props} />
))
DataListActions.displayName = "DataListActions"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, DataListCard, DataListContent, DataListRow, DataListMain, DataListActions, cardVariants }
