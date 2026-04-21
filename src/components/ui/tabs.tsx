import * as TabsPrimitive from '@radix-ui/react-tabs'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-1 rounded-md bg-surface-muted p-1 text-sm',
        className
      )}
      {...props}
    />
  )
})

export const TabsTrigger = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-white data-[state=active]:text-brand-700 data-[state=active]:shadow',
        className
      )}
      {...props}
    />
  )
})

export const TabsContent = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn('mt-4 focus-visible:outline-none', className)}
      {...props}
    />
  )
})
