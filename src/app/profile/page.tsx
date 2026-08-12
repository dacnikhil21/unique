"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronRight, Building2, Phone, Mail, Shield, LogOut, Tags, User } from "lucide-react"
import { AppShell } from "@/components/layout/AppShell"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppBottomNav } from "@/components/layout/AppBottomNav"
import { getB2CCreateUrl } from "@/lib/b2c-dashboard-routes"
import { getB2CDashboard, getB2CProfile } from "@/lib/b2c-session"
import { getC2CProfile } from "@/lib/c2c-session"
import { getCategoryById } from "@/lib/categories"
import { resolveAppModule, type AppModule } from "@/lib/app-module"

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const moduleType: AppModule = resolveAppModule(searchParams.get("module"))
  const isB2C = moduleType === "b2c"
  const [b2cDashboard, setB2cDashboard] = React.useState("mobile")
  const [b2cProfile, setB2cProfile] = React.useState(getB2CProfile)
  const [c2cProfile, setC2cProfile] = React.useState(getC2CProfile)

  React.useEffect(() => {
    if (isB2C) {
      setB2cDashboard(getB2CDashboard())
      setB2cProfile(getB2CProfile())
    } else {
      setC2cProfile(getC2CProfile())
    }
  }, [isB2C])

  const category = getCategoryById(b2cProfile.categoryId)
  const b2cHomePath = `/dashboard/${b2cDashboard}`
  const b2cCreatePath = getB2CCreateUrl(b2cDashboard)
  const moduleQuery = `module=${moduleType}`

  const displayName = isB2C ? b2cProfile.businessName : c2cProfile.fullName
  const displayMobile = isB2C ? b2cProfile.mobile : c2cProfile.mobile
  const displayEmail = isB2C ? b2cProfile.email : c2cProfile.email
  const verified = isB2C ? b2cProfile.verified : c2cProfile.verified

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const rows = isB2C
    ? [
        {
          icon: Building2,
          label: "Business Details",
          sub: b2cProfile.businessName,
          href: `/profile/business-details?${moduleQuery}`,
        },
        {
          icon: Tags,
          label: "Manage Categories",
          sub: "Edit categories, subcategories & visibility",
          href: `/categories?${moduleQuery}`,
        },
        {
          icon: Tags,
          label: "Change Business Category",
          sub: category?.title ?? "Mobile & Electronics",
          href: `/profile/change-category?${moduleQuery}`,
        },
        {
          icon: Phone,
          label: "Mobile Number",
          sub: displayMobile,
          href: `/profile/contact?${moduleQuery}`,
        },
        {
          icon: Mail,
          label: "Email",
          sub: displayEmail,
          href: `/profile/contact?${moduleQuery}`,
        },
        {
          icon: Shield,
          label: "Verification Status",
          sub: verified ? "Verified" : "Pending",
          href: `/profile/verification?${moduleQuery}`,
        },
      ]
    : [
        {
          icon: User,
          label: "Account",
          sub: "Personal Account",
          href: "",
        },
        {
          icon: Phone,
          label: "Mobile Number",
          sub: displayMobile,
          href: `/profile/contact?${moduleQuery}`,
        },
        {
          icon: Mail,
          label: "Email",
          sub: displayEmail || "Not added",
          href: `/profile/contact?${moduleQuery}`,
        },
        {
          icon: Shield,
          label: "Verification Status",
          sub: verified ? "Verified" : "Pending",
          href: `/profile/verification?${moduleQuery}`,
        },
      ]

  return (
    <AppShell
      backgroundClassName="bg-[#F8FAFC]"
      header={<AppHeader showBack={false} />}
      bottomBar={
        <AppBottomNav
          activeTab="profile"
          onCreateAgreement={() =>
            router.push(isB2C ? b2cCreatePath : `/create-agreement?module=${moduleType}`)
          }
          onTabChange={(tab) => {
            if (tab === "home") router.push(isB2C ? b2cHomePath : "/dashboard?module=c2c")
            if (tab === "agreements") router.push(`/agreements?${moduleQuery}`)
            if (tab === "verification") router.push(`/verify-identity?${moduleQuery}`)
          }}
        />
      }
      contentClassName="px-4 pb-6 pt-2"
    >
      <div className="rounded-[16px] bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] px-4 py-5 text-white shadow-[0_4px_20px_rgba(37,99,235,0.25)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-[22px] font-bold">
          {initials}
        </div>
        <h1 className="mt-3 text-[18px] font-bold">{displayName}</h1>
        <p className="mt-0.5 text-[12px] text-blue-100">
          {isB2C
            ? `B2C Merchant • ${category?.title ?? "Mobile & Electronics"}`
            : "C2C Personal Account"}
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-[16px] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
        {rows.map(({ icon: Icon, label, sub, href }, i) => (
          <button
            key={label}
            type="button"
            onClick={() => href && router.push(href)}
            disabled={!href}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-[#F8FAFC] ${i > 0 ? "border-t border-[#F1F5F9]" : ""} ${!href ? "opacity-60" : ""}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF]">
              <Icon className="h-5 w-5 text-[#2563EB]" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[#0F172A]">{label}</p>
              <p className="truncate text-[12px] text-[#64748B]">{sub}</p>
            </div>
            {href ? <ChevronRight className="h-4 w-4 text-[#CBD5E1]" /> : null}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => router.push("/login")}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#FEE2E2] bg-white py-3.5 text-[14px] font-semibold text-[#DC2626] active:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </AppShell>
  )
}

export default function ProfilePage() {
  return (
    <React.Suspense
      fallback={
        <div className="mobile-app-shell flex items-center justify-center bg-[#F8FAFC]">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
        </div>
      }
    >
      <ProfileContent />
    </React.Suspense>
  )
}
