import * as React from "react"
import { CategoriesManagementScreen } from "@/components/categories/CategoriesManagementScreen"

export default function DashboardCategoriesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mobile-app-shell flex items-center justify-center bg-[#F8FAFC]">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
        </div>
      }
    >
      <CategoriesManagementScreen />
    </React.Suspense>
  )
}
