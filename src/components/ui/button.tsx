"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", disabled, type = "button", ...props }, ref) => {
    return (
      <button
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
          {
            "bg-white text-black hover:bg-white/90 active:bg-white/80": variant === "default",
            "border border-white/20 bg-transparent hover:bg-white/10 active:bg-white/15": variant === "outline",
            "hover:bg-white/10 active:bg-white/15": variant === "ghost",
          },
          {
            "h-9 px-4 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-8": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
