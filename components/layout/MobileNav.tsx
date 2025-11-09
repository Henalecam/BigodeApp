"use client"

import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { navItems, NavItem } from "./Sidebar"

type MobileNavProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: "ADMIN" | "BARBER"
}

function renderItems(items: NavItem[], role: "ADMIN" | "BARBER", onSelect: () => void) {
  return items
    .filter(item => item.roles.includes(role))
    .map(item => (
      <div key={item.href} className="flex flex-col gap-1">
        <Link
          href={item.href as "/"}
          onClick={onSelect}
          className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-primary/5 hover:text-primary"
        >
          {item.label}
        </Link>
        {item.children ? (
          <div className="ml-4 flex flex-col gap-1">
            {item.children
              .filter(child => child.roles.includes(role))
              .map(child => (
                <Link
                  key={child.href}
                  href={child.href as "/"}
                  onClick={onSelect}
                  className="rounded-md px-3 py-1 text-xs text-neutral-500 transition hover:bg-primary/5 hover:text-primary"
                >
                  {child.label}
                </Link>
              ))}
          </div>
        ) : null}
      </div>
    ))
}

export function MobileNav({ open, onOpenChange, role }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-4">
        <SheetHeader>
          <SheetTitle className="text-left text-lg font-semibold text-primary">BarberPro</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-2">
          {renderItems(navItems, role, () => onOpenChange(false))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

