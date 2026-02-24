import * as React from "react"
import { cn } from "@/lib/utils"

const FeatureCard = React.forwardRef(({ 
  className, 
  icon, 
  title, 
  description, 
  variant = "default",
  size = "md",
  iconPosition = "top",
  href,
  ...props 
}, ref) => {
  const variants = {
    default: "bg-card text-card-foreground border shadow-sm hover:shadow-md transition-shadow",
    outline: "border-2 border-border hover:border-primary/50 transition-colors",
    ghost: "hover:bg-accent/50 transition-colors",
  }

  const sizes = {
    sm: "p-4 gap-3",
    md: "p-6 gap-4",
    lg: "p-8 gap-6",
  }

  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const titleSizes = {
    sm: "text-base font-semibold",
    md: "text-lg font-semibold",
    lg: "text-xl font-semibold",
  }

  const descriptionSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  const Content = () => (
    <div
      className={cn(
        "rounded-lg",
        variants[variant],
        sizes[size],
        iconPosition === "left" ? "flex items-start" : "flex flex-col",
        href && "cursor-pointer",
        className
      )}
      ref={ref}
      {...props}
    >
      {icon && (
        <div className={cn(
          "flex items-center justify-center",
          iconPosition === "left" ? "mr-4 shrink-0" : "mb-2",
          iconSizes[size]
        )}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h3 className={cn("mb-2", titleSizes[size])}>{title}</h3>
        <p className={cn("text-muted-foreground", descriptionSizes[size])}>
          {description}
        </p>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block no-underline">
        <Content />
      </a>
    )
  }

  return <Content />
})

FeatureCard.displayName = "FeatureCard"

// Interactive Feature Card with hover effects
const InteractiveFeatureCard = React.forwardRef(({ className, onClick, ...props }, ref) => (
  <FeatureCard
    ref={ref}
    className={cn(
      "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
      className
    )}
    onClick={onClick}
    {...props}
  />
))

InteractiveFeatureCard.displayName = "InteractiveFeatureCard"

// Gradient Feature Card
const GradientFeatureCard = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <FeatureCard
    ref={ref}
    variant={variant}
    className={cn(
      "bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20",
      className
    )}
    {...props}
  />
))

GradientFeatureCard.displayName = "GradientFeatureCard"

// Feature Card with Badge
const FeatureCardWithBadge = React.forwardRef(({ 
  className, 
  badge, 
  badgeVariant = "default", 
  children, 
  ...props 
}, ref) => (
  <div className="relative">
    {badge && (
      <span className={cn(
        "absolute -top-2 -right-2 px-2 py-1 text-xs font-semibold rounded-full",
        badgeVariant === "default" && "bg-primary text-primary-foreground",
        badgeVariant === "secondary" && "bg-secondary text-secondary-foreground",
        badgeVariant === "destructive" && "bg-destructive text-destructive-foreground",
        badgeVariant === "outline" && "border bg-background",
      )}>
        {badge}
      </span>
    )}
    <FeatureCard ref={ref} className={cn("pt-6", className)} {...props} />
  </div>
))

FeatureCardWithBadge.displayName = "FeatureCardWithBadge"

export { 
  FeatureCard, 
  InteractiveFeatureCard, 
  GradientFeatureCard, 
  FeatureCardWithBadge 
}