import type { BusinessCategoryId } from "@/lib/categories"

const B2C_DASHBOARD_KEY = "b2c-dashboard"
const B2C_ONBOARDED_KEY = "b2c-onboarded"
const B2C_PROFILE_KEY = "b2c-profile"

const DEFAULT_DASHBOARD = "mobile"

export type B2CProfile = {
  businessName: string
  email: string
  mobile: string
  gstNumber: string
  address: string
  categoryId: BusinessCategoryId
  verified: boolean
}

const DEFAULT_PROFILE: B2CProfile = {
  businessName: "Ravi Mobiles",
  email: "ravi@example.com",
  mobile: "+91 77997 47575",
  gstNumber: "29ABCDE1234F1Z5",
  address: "12, MG Road, Bengaluru, Karnataka — 560001",
  categoryId: "mobile-electronics",
  verified: true,
}

/** Persist the merchant's selected B2C dashboard (session-scoped). */
export function setB2CDashboard(dashboardId: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(B2C_DASHBOARD_KEY, dashboardId)
}

/** Read persisted dashboard id, falling back to mobile. */
export function getB2CDashboard(): string {
  if (typeof window === "undefined") return DEFAULT_DASHBOARD
  return sessionStorage.getItem(B2C_DASHBOARD_KEY) || DEFAULT_DASHBOARD
}

/** Home path for the current B2C merchant session. */
export function getB2CHomePath(): string {
  return `/dashboard/${getB2CDashboard()}`
}

/** Extract dashboard id from `/dashboard/{id}` route. */
export function setB2CDashboardFromRoute(route: string): void {
  const match = route.match(/\/dashboard\/([^/?]+)/)
  if (match?.[1]) setB2CDashboard(match[1])
}

/** Mark merchant as onboarded (completed business category selection). */
export function setB2COnboarded(): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(B2C_ONBOARDED_KEY, "true")
}

export function isB2COnboarded(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(B2C_ONBOARDED_KEY) === "true"
}

export function getB2CProfile(): B2CProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE
  const raw = sessionStorage.getItem(B2C_PROFILE_KEY)
  if (!raw) {
    const mobile = sessionStorage.getItem("user_mobile")
    return {
      ...DEFAULT_PROFILE,
      mobile: mobile ? `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}` : DEFAULT_PROFILE.mobile,
    }
  }
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function setB2CProfile(updates: Partial<B2CProfile>): void {
  if (typeof window === "undefined") return
  const next = { ...getB2CProfile(), ...updates }
  sessionStorage.setItem(B2C_PROFILE_KEY, JSON.stringify(next))
}

export function mapDashboardToCategoryId(dashboardId: string): BusinessCategoryId {
  const map: Record<string, BusinessCategoryId> = {
    mobile: "mobile-electronics",
    vehicle: "bikes-cars",
    furniture: "furniture-sale",
    rental: "rental-services",
    service: "service-agreement",
    others: "others",
  }
  return map[dashboardId] ?? "mobile-electronics"
}
