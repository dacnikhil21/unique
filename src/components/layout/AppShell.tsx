"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AppShellProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  bottomBar?: React.ReactNode
  className?: string
  contentClassName?: string
  backgroundClassName?: string
}

import { WhatsAppWidget } from "@/components/ui/WhatsAppWidget"
import { AppFooter } from "@/components/layout/AppFooter"

/**
 * Canonical mobile app shell — SafeArea + header + scroll + footer/bottomBar.
 * Maps to RN: SafeAreaView + View + ScrollView + bottom tabs.
 */
export function AppShell({
  children,
  header,
  footer,
  bottomBar,
  className,
  contentClassName,
  backgroundClassName = "bg-white",
}: AppShellProps) {
  return (
    <div className={cn("mobile-app-shell flex flex-col relative", backgroundClassName, className)}>
      <div className="shrink-0 pt-[env(safe-area-inset-top,0px)]" aria-hidden="true" />

      {header ? <header className="w-full shrink-0 bg-white">{header}</header> : null}

      <main
        className={cn(
          "w-full flex-1 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col justify-between",
          !footer && !bottomBar && "pb-[max(16px,env(safe-area-inset-bottom))]",
          contentClassName
        )}
      >
        <div>{children}</div>
        {footer ? footer : <AppFooter />}
      </main>

      {bottomBar ? <div className="relative z-20 w-full shrink-0 bg-white">{bottomBar}</div> : null}

      {/* Floating WhatsApp contact button */}
      <WhatsAppWidget />
    </div>
  )
}
