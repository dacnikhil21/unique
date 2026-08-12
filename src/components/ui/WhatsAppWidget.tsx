"use client"

import * as React from "react"
import { MessageCircle, X } from "lucide-react"

interface WhatsAppWidgetProps {
  phoneNumber?: string
  message?: string
}

export function WhatsAppWidget({
  phoneNumber = "917799747575",
  message = "Hello! I have an inquiry about Trilok services.",
}: WhatsAppWidgetProps) {
  const [showTooltip, setShowTooltip] = React.useState(true)

  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Optional Tooltip Bubble */}
      {showTooltip ? (
        <div className="relative flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 shadow-xl border border-[#E2E8F0] text-[12px] text-[#0F172A] max-w-[210px] animate-bounce">
          <span className="font-semibold">Chat directly on WhatsApp!</span>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="text-[#94A3B8] hover:text-[#0F172A]"
            aria-label="Close tooltip"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-[#E2E8F0] bg-white" />
        </div>
      ) : null}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping" />
        <MessageCircle className="relative h-7 w-7 fill-white text-[#25D366]" strokeWidth={1} />
      </a>
    </div>
  )
}
