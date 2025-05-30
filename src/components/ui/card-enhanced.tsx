
import * as React from "react"
import { cn } from "@/lib/utils"

const CardEnhanced = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    interactive?: boolean
    hover?: boolean
    elevated?: boolean
  }
>(({ className, interactive, hover, elevated, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      elevated && "shadow-lg",
      interactive && "card-interactive cursor-pointer",
      hover && "hover:shadow-md transition-shadow duration-200",
      "generous-padding",
      className
    )}
    {...props}
  />
))
CardEnhanced.displayName = "CardEnhanced"

const CardEnhancedHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-6", className)}
    {...props}
  />
))
CardEnhancedHeader.displayName = "CardEnhancedHeader"

const CardEnhancedTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-hierarchy-heading", className)}
    {...props}
  />
))
CardEnhancedTitle.displayName = "CardEnhancedTitle"

const CardEnhancedDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-hierarchy-caption", className)}
    {...props}
  />
))
CardEnhancedDescription.displayName = "CardEnhancedDescription"

const CardEnhancedContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
CardEnhancedContent.displayName = "CardEnhancedContent"

const CardEnhancedFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
))
CardEnhancedFooter.displayName = "CardEnhancedFooter"

export { 
  CardEnhanced, 
  CardEnhancedHeader, 
  CardEnhancedFooter, 
  CardEnhancedTitle, 
  CardEnhancedDescription, 
  CardEnhancedContent 
}
