"use client"

import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "light" | "dark"
  className?: string
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-4",
  xl: "w-12 h-12 border-4",
}

const variantMap = {
  light: "border-white/20 border-t-white",
  dark: "border-black/20 border-t-black",
}

export function Spinner({ size = "md", variant = "light", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full animate-spin",
        sizeMap[size],
        variantMap[variant],
        className
      )}
    />
  )
}
