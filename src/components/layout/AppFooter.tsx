"use client"

import * as React from "react"
import { Globe, Phone, Mail, MessageCircle, ShieldCheck } from "lucide-react"

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

export function AppFooter() {
  const whatsappUrl = "https://wa.me/917799747575?text=Hello%20Trilok%20Support"

  return (
    <footer className="w-full bg-[#0F172A] text-white border-t border-[#1E293B] mt-10">
      {/* Worldwide Shipping Banner */}
      <div className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0A5C36] px-4 py-3 text-center shadow-inner">
        <div className="mx-auto flex max-w-md items-center justify-center gap-2 text-[13px] font-bold tracking-wide text-white">
          <Globe className="h-4 w-4 animate-spin-slow" />
          <span>Worldwide Shipping Available Across The Globe 🌍</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Top Info & Social Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#1E293B] text-center md:text-left">
          {/* Brand Info */}
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[20px] font-extrabold tracking-tight text-white">TRILOK</span>
              <span className="rounded-full bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                B2C & C2C Portal
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[#94A3B8]">
              Legally compliant eAgreement & digital storefront solution.
            </p>
          </div>

          {/* Social Media Links (Bottom Youtube, Facebook, Instagram) */}
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all duration-200"
              aria-label="YouTube"
              title="Watch on YouTube"
            >
              <YoutubeIcon className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-200"
              aria-label="Facebook"
              title="Follow on Facebook"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all duration-200"
              aria-label="Instagram"
              title="Follow on Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-200"
              aria-label="WhatsApp"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] text-[#94A3B8]">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Phone className="h-4 w-4 text-[#2563EB]" />
            <span>Support Helpline: <strong className="text-white">+91 77997 47575</strong></span>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Mail className="h-4 w-4 text-[#2563EB]" />
            <span>Email Contact: <strong className="text-white">support@trilok.com</strong></span>
          </div>
        </div>

        {/* Trust Badges & Copyright */}
        <div className="pt-4 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#22C55E]" />
            <span>Encrypted & Aadhaar Verified eSign Portal</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
