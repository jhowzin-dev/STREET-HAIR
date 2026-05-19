"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "default" }
>(({ className, size = "default", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-neutral-800 text-white shadow-sm",
      size === "sm" && "p-3",
      size === "default" && "p-6",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
Card.displayName = "Card"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 pt-4 border-t border-white/10", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardContent, CardFooter }
