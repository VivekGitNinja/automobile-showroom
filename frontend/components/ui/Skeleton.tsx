import React from 'react'
import { cn } from '../../lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.02)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
