"use client"

import * as React from "react"
import * as RadixSelect from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = RadixSelect.Root
const SelectGroup = RadixSelect.Group
const SelectValue = RadixSelect.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 focus:ring-offset-0 transition-all",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </RadixSelect.Trigger>
))
SelectTrigger.displayName = RadixSelect.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-primary/10 bg-white/95 backdrop-blur-md shadow-xl",
        position === "popper" && "translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
    </RadixSelect.Content>
  </RadixSelect.Portal>
))
SelectContent.displayName = RadixSelect.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Label>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Label>
>(({ className, ...props }, ref) => (
  <RadixSelect.Label ref={ref} className={cn("px-3 py-1.5 text-sm font-semibold", className)} {...props} />
))
SelectLabel.displayName = RadixSelect.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Item>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-md px-3 py-2 text-sm focus:bg-gradient-to-r focus:from-secondary/10 focus:to-accent/10 focus:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <RadixSelect.ItemIndicator>
        <Check className="h-4 w-4 text-accent" />
      </RadixSelect.ItemIndicator>
    </span>
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
  </RadixSelect.Item>
))
SelectItem.displayName = RadixSelect.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Separator>
>(({ className, ...props }, ref) => (
  <RadixSelect.Separator ref={ref} className={cn("my-1 h-px bg-primary/10", className)} {...props} />
))
SelectSeparator.displayName = RadixSelect.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator
}

