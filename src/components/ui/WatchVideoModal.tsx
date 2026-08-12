"use client"

import * as React from "react"
import { Play, X, ShieldCheck, FileCheck, CheckCircle2 } from "lucide-react"

interface WatchVideoModalProps {
  isOpen?: boolean
  onClose?: () => void
  videoUrl?: string
  title?: string
}

export function WatchVideoModal({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
  title = "How Trilok B2C & C2C eAgreements Work",
}: WatchVideoModalProps) {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false)

  const isControlled = externalIsOpen !== undefined
  const isOpen = isControlled ? externalIsOpen : internalIsOpen
  const handleClose = externalOnClose || (() => setInternalIsOpen(false))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-[20px] bg-[#0F172A] p-4 sm:p-6 shadow-2xl text-white border border-[#1E293B] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-white">
              <Play className="h-4 w-4 fill-white ml-0.5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-white leading-tight">{title}</h2>
              <p className="text-[11px] text-[#94A3B8]">Watch the 60-second video demo walkthrough</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155] hover:text-white transition-colors"
            aria-label="Close video player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Embed Frame Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-[14px] bg-black border border-[#1E293B] shadow-inner">
          <iframe
            className="h-full w-full"
            src={videoUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Highlights Strip */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-[#94A3B8] border-t border-[#1E293B] pt-4">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-[#22C55E]" />
            <span>Aadhaar Verified</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FileCheck className="h-4 w-4 text-[#2563EB]" />
            <span>Instant Digital eSign</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-[#A855F7]" />
            <span>Audit Trail Stored</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Standalone Watch Video Trigger Button */
export function WatchVideoButton({
  onClick,
  className = "",
}: {
  onClick?: () => void
  className?: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      setIsOpen(true)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-full border border-[#2563EB] bg-[#EFF6FF] px-4 py-2 text-[13px] font-bold text-[#2563EB] shadow-xs hover:bg-[#2563EB] hover:text-white active:scale-95 transition-all duration-200 ${className}`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-white group-hover:bg-white group-hover:text-[#2563EB]">
          <Play className="h-3 w-3 fill-current ml-0.5" />
        </span>
        <span>Watch Video</span>
      </button>

      <WatchVideoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
