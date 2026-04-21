import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const RadioGroup = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(function RadioGroup({ className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn('grid gap-2', className)}
      {...props}
    />
  )
})

export const RadioGroupItem = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(function RadioGroupItem({ className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-5 w-5 rounded-full border border-border text-brand-500',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-brand-500',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-brand-500 text-brand-500" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
