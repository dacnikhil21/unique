const C2C_FROM_DASHBOARD_KEY = "c2c-from-dashboard"
const C2C_PROFILE_KEY = "c2c-profile"
const C2C_ONBOARDED_KEY = "c2c-onboarded"

export type C2CProfile = {
  fullName: string
  email: string
  mobile: string
  verified: boolean
}

const DEFAULT_C2C_PROFILE: C2CProfile = {
  fullName: "Ravi Kumar",
  email: "ravi@example.com",
  mobile: "+91 77997 47575",
  verified: true,
}

/** Mark C2C registration complete. */
export function setC2COnboarded(): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(C2C_ONBOARDED_KEY, "true")
}

export function isC2COnboarded(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(C2C_ONBOARDED_KEY) === "true"
}

export function getC2CProfile(): C2CProfile {
  if (typeof window === "undefined") return DEFAULT_C2C_PROFILE
  const raw = sessionStorage.getItem(C2C_PROFILE_KEY)
  const mobileRaw = sessionStorage.getItem("user_mobile")
  const formattedMobile = mobileRaw
    ? `+91 ${mobileRaw.slice(0, 5)} ${mobileRaw.slice(5)}`
    : DEFAULT_C2C_PROFILE.mobile

  if (!raw) {
    return { ...DEFAULT_C2C_PROFILE, mobile: formattedMobile }
  }
  try {
    return { ...DEFAULT_C2C_PROFILE, ...JSON.parse(raw), mobile: formattedMobile }
  } catch {
    return { ...DEFAULT_C2C_PROFILE, mobile: formattedMobile }
  }
}

export function setC2CProfile(updates: Partial<C2CProfile>): void {
  if (typeof window === "undefined") return
  const next = { ...getC2CProfile(), ...updates }
  sessionStorage.setItem(C2C_PROFILE_KEY, JSON.stringify(next))
}

/** Mark that the user entered create flow from the C2C home dashboard (not the FAB). */
export function setC2CFromDashboard(): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(C2C_FROM_DASHBOARD_KEY, "true")
}

export function clearC2CFromDashboard(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(C2C_FROM_DASHBOARD_KEY)
}

export function isC2CFromDashboard(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(C2C_FROM_DASHBOARD_KEY) === "true"
}

/** Floating hero PNG per agreement category — transparent, no white tile */
export const C2C_CATEGORY_HERO: Record<string, string> = {
  "mobile-electronics": "/assets/dashboards/heroes/mobile-hero.png",
  "bike-car": "/assets/dashboards/heroes/vehicle-hero.png",
  furniture: "/assets/dashboards/heroes/furniture-hero.png",
  "others-sale": "/assets/dashboards/heroes/others-hero.png",
  "pg-rental": "/assets/dashboards/heroes/rental-hero.png",
  "vehicle-rental": "/assets/dashboards/heroes/vehicle-hero.png",
  "electronics-rental": "/assets/dashboards/heroes/mobile-hero.png",
  "other-rental": "/assets/dashboards/heroes/rental-hero.png",
  freelance: "/assets/dashboards/heroes/service-hero.png",
  maid: "/assets/dashboards/heroes/service-hero.png",
  "home-repair": "/assets/dashboards/heroes/service-hero.png",
  "others-service": "/assets/dashboards/heroes/others-hero.png",
}

export function getC2CCategoryHero(categoryId: string): string {
  return C2C_CATEGORY_HERO[categoryId] ?? "/assets/dashboards/heroes/c2c-hero.png"
}
