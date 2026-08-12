"use client"

import * as React from "react"
import {
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  Star,
  Eye,
  EyeOff,
  Edit2,
  MoreVertical,
  Trash2,
  Copy,
  Check,
  Tag,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  Filter,
} from "lucide-react"
import { AppShell } from "@/components/layout/AppShell"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppBottomNav } from "@/components/layout/AppBottomNav"
import {
  getCategories,
  saveCategories,
  INITIAL_CATEGORIES,
  type CategoryItem,
} from "@/lib/categories-data"
import { EditCategoryModal } from "@/components/categories/EditCategoryModal"
import { AddCategoryModal } from "@/components/categories/AddCategoryModal"

export function CategoriesManagementScreen() {
  const [categories, setCategories] = React.useState<CategoryItem[]>([])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "visible" | "hidden" | "featured">("all")

  const [editingCategory, setEditingCategory] = React.useState<CategoryItem | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Load from local storage on mount
  React.useEffect(() => {
    const loaded = getCategories()
    const sorted = [...loaded].sort((a, b) => a.order - b.order)
    setCategories(sorted)
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSaveCategories = (newCategories: CategoryItem[]) => {
    const sorted = [...newCategories].sort((a, b) => a.order - b.order)
    setCategories(sorted)
    saveCategories(sorted)
  }

  // Toggle single item selection
  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === categories.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(categories.map((c) => c.id))
    }
  }

  // Interactive Toggles: Featured & Visible directly from table row
  const toggleFeatured = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const updated = categories.map((cat) => {
      if (cat.id === id) {
        const next = !cat.featured
        showToast(`Category "${cat.title}" is now ${next ? "Featured ★" : "Standard"}`)
        return { ...cat, featured: next }
      }
      return cat
    })
    handleSaveCategories(updated)
  }

  const toggleVisibility = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const updated = categories.map((cat) => {
      if (cat.id === id) {
        const next = !cat.visible
        showToast(`Category "${cat.title}" is now ${next ? "Visible 👁" : "Hidden 🙈"}`)
        return { ...cat, visible: next }
      }
      return cat
    })
    handleSaveCategories(updated)
  }

  // Reordering controls (move up / move down)
  const moveOrder = (id: string, direction: "up" | "down", e?: React.MouseEvent) => {
    e?.stopPropagation()
    const index = categories.findIndex((c) => c.id === id)
    if (index === -1) return
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === categories.length - 1) return

    const targetIndex = direction === "up" ? index - 1 : index + 1
    const newArr = [...categories]

    // Swap order values
    const tempOrder = newArr[index].order
    newArr[index].order = newArr[targetIndex].order
    newArr[targetIndex].order = tempOrder

    // Swap positions
    const tempItem = newArr[index]
    newArr[index] = newArr[targetIndex]
    newArr[targetIndex] = tempItem

    showToast(`Reordered "${tempItem.title}" ${direction === "up" ? "Up ▲" : "Down ▼"}`)
    handleSaveCategories(newArr)
  }

  // Open Edit Modal
  const handleOpenEdit = (category: CategoryItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingCategory(category)
    setIsEditModalOpen(true)
    setActiveMenuId(null)
  }

  // Save edited category
  const handleSaveEdit = (updatedCategory: CategoryItem) => {
    const updated = categories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
    handleSaveCategories(updated)
    setIsEditModalOpen(false)
    setEditingCategory(null)
    showToast(`Saved changes for "${updatedCategory.title}"`)
  }

  // Add new category
  const handleAddCategory = (newCategory: CategoryItem) => {
    const updated = [...categories, newCategory]
    handleSaveCategories(updated)
    setIsAddModalOpen(false)
    showToast(`Category "${newCategory.title}" created successfully!`)
  }

  // Duplicate category
  const handleDuplicate = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const item = categories.find((c) => c.id === id)
    if (!item) return
    const duplicated: CategoryItem = {
      ...item,
      id: `cat-${Date.now()}`,
      order: categories.length + 1,
      title: `${item.title} (Copy)`,
      createdAt: new Date().toISOString(),
    }
    handleSaveCategories([...categories, duplicated])
    setActiveMenuId(null)
    showToast(`Duplicated "${item.title}"`)
  }

  // Delete category
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const item = categories.find((c) => c.id === id)
    if (!item) return
    if (confirm(`Are you sure you want to delete category "${item.title}"?`)) {
      const updated = categories
        .filter((c) => c.id !== id)
        .map((c, idx) => ({ ...c, order: idx + 1 }))
      handleSaveCategories(updated)
      setSelectedIds((prev) => prev.filter((i) => i !== id))
      setActiveMenuId(null)
      showToast(`Deleted category "${item.title}"`)
    }
  }

  // Reset to default seed
  const handleResetDefaults = () => {
    if (confirm("Reset categories table to initial default data?")) {
      handleSaveCategories(INITIAL_CATEGORIES)
      setSelectedIds([])
      showToast("Reset categories to default data")
    }
  }

  // Bulk actions
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return
    if (confirm(`Delete ${selectedIds.length} selected categories?`)) {
      const updated = categories
        .filter((c) => !selectedIds.includes(c.id))
        .map((c, idx) => ({ ...c, order: idx + 1 }))
      handleSaveCategories(updated)
      setSelectedIds([])
      showToast(`Deleted ${selectedIds.length} categories`)
    }
  }

  const handleBulkToggleVisibility = (targetState: boolean) => {
    if (selectedIds.length === 0) return
    const updated = categories.map((c) =>
      selectedIds.includes(c.id) ? { ...c, visible: targetState } : c
    )
    handleSaveCategories(updated)
    showToast(`Updated visibility for ${selectedIds.length} items`)
  }

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.subcategories.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (statusFilter === "visible") return cat.visible
    if (statusFilter === "hidden") return !cat.visible
    if (statusFilter === "featured") return cat.featured
    return true
  })

  return (
    <AppShell
      backgroundClassName="bg-[#F8FAFC]"
      header={
        <AppHeader
          showBack={true}
        />
      }
      bottomBar={<AppBottomNav activeTab="home" />}
      contentClassName="p-3 sm:p-5 pb-24"
    >
      {/* Toast Banner */}
      {toastMessage ? (
        <div className="fixed top-14 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#0F172A] px-4 py-2 text-[12px] font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="h-4 w-4 text-[#38BDF8]" />
          <span>{toastMessage}</span>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl space-y-4">
        {/* Header Summary & Actions Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold tracking-tight text-[#0F172A]">Categories List</h1>
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[11px] font-bold text-[#2563EB]">
                {categories.length} Total
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-[#64748B]">
              Manage product categories, order position, visibility status & featured tags
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
              title="Reset to sample data"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#64748B]" /> Reset Seed
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 rounded-[10px] bg-[#2563EB] px-4 py-1.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#1D4ED8] active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" /> Add Category
            </button>
          </div>
        </div>

        {/* Filters & Search Control Bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories, description or tags..."
              className="w-full rounded-[12px] border border-[#CBD5E1] bg-white py-2 pl-9 pr-3 text-[13px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#64748B]"
              >
                Clear
              </button>
            ) : null}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 rounded-[12px] border border-[#E2E8F0] bg-white p-1 text-[12px] shadow-2xs overflow-x-auto">
            {(
              [
                { id: "all", label: "All" },
                { id: "visible", label: "Visible" },
                { id: "hidden", label: "Hidden" },
                { id: "featured", label: "★ Featured" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-[8px] px-3 py-1 font-semibold transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-[#2563EB] text-white shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions Bar (When items selected) */}
        {selectedIds.length > 0 ? (
          <div className="flex items-center justify-between rounded-[12px] bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-2 text-[12px] text-[#1E40AF]">
            <span className="font-semibold">{selectedIds.length} categories selected</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkToggleVisibility(true)}
                className="rounded-[8px] bg-white px-2.5 py-1 font-semibold text-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
              >
                Make Visible
              </button>
              <button
                type="button"
                onClick={() => handleBulkToggleVisibility(false)}
                className="rounded-[8px] bg-white px-2.5 py-1 font-semibold text-[#475569] hover:bg-[#F1F5F9] transition-colors"
              >
                Make Hidden
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="rounded-[8px] bg-red-600 px-2.5 py-1 font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        ) : null}

        {/* Table Container (Direct 1:1 match with user reference image) */}
        <div className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  <th className="py-3.5 pl-4 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={categories.length > 0 && selectedIds.length === categories.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                    />
                  </th>
                  <th className="py-3.5 px-3 w-20 text-center">ORDER</th>
                  <th className="py-3.5 px-3 w-16">IMAGE</th>
                  <th className="py-3.5 px-4 min-w-[220px]">CATEGORY TITLE & DESCRIPTION</th>
                  <th className="py-3.5 px-3 w-32 text-center">PRODUCTS</th>
                  <th className="py-3.5 px-3 min-w-[140px]">SUBCATEGORIES</th>
                  <th className="py-3.5 px-3 w-32 text-center">FEATURED</th>
                  <th className="py-3.5 px-3 w-32 text-center">VISIBILITY</th>
                  <th className="py-3.5 pr-4 pl-3 w-36 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#64748B]">
                      <div className="flex flex-col items-center justify-center">
                        <Layers className="h-10 w-10 text-[#CBD5E1] mb-2" />
                        <p className="font-semibold text-[14px] text-[#334155]">No categories found</p>
                        <p className="text-[12px] text-[#94A3B8]">Try adjusting search query or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat, idx) => {
                    const isSelected = selectedIds.includes(cat.id)
                    const isMenuOpen = activeMenuId === cat.id

                    return (
                      <tr
                        key={cat.id}
                        className={`group transition-colors ${
                          isSelected ? "bg-[#EFF6FF]/60" : "hover:bg-[#F8FAFC]"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 pl-4 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(cat.id)}
                            className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                          />
                        </td>

                        {/* Order (#1 ▲▼) */}
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1 font-bold text-[#334155]">
                            <span className="text-[13px] italic">#{cat.order}</span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={(e) => moveOrder(cat.id, "up", e)}
                                className="p-0.5 text-[#64748B] hover:text-[#2563EB] disabled:opacity-30 disabled:hover:text-[#64748B] transition-colors"
                                title="Move up"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === filteredCategories.length - 1}
                                onClick={(e) => moveOrder(cat.id, "down", e)}
                                className="p-0.5 text-[#64748B] hover:text-[#2563EB] disabled:opacity-30 disabled:hover:text-[#64748B] transition-colors"
                                title="Move down"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Image Thumbnail */}
                        <td className="py-3 px-3">
                          <div className="h-11 w-11 overflow-hidden rounded-[10px] border border-[#E2E8F0] bg-[#F1F5F9] shadow-inner shrink-0">
                            <img
                              src={cat.image}
                              alt={cat.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        </td>

                        {/* Category Title & Description */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-[14px] leading-tight text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                            {cat.title}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug text-[#64748B] line-clamp-1">
                            {cat.description}
                          </p>
                        </td>

                        {/* Products Badge */}
                        <td className="py-3 px-3 text-center">
                          <span
                            onClick={() => handleOpenEdit(cat)}
                            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#CBD5E1] bg-white px-3 py-1 text-[12px] font-bold text-[#1E293B] shadow-2xs hover:border-[#2563EB] hover:text-[#2563EB] transition-all"
                            title="Click to edit product count"
                          >
                            {cat.productCount} Products
                          </span>
                        </td>

                        {/* Subcategories Tag Pills */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {cat.subcategories.map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center rounded-[8px] bg-[#E0F2FE] px-2.5 py-0.5 text-[11px] font-semibold text-[#0369A1]"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Featured Button Toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => toggleFeatured(cat.id, e)}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-bold shadow-2xs transition-all active:scale-95 ${
                              cat.featured
                                ? "border-[#FCD34D] bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7]"
                                : "border-[#E2E8F0] bg-white text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#475569]"
                            }`}
                            title="Click to toggle Featured status"
                          >
                            <Star className={`h-3.5 w-3.5 ${cat.featured ? "fill-[#F59E0B] text-[#F59E0B]" : ""}`} />
                            {cat.featured ? "Featured" : "Standard"}
                          </button>
                        </td>

                        {/* Visibility Button Toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => toggleVisibility(cat.id, e)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-bold shadow-2xs transition-all active:scale-95 ${
                              cat.visible
                                ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]"
                                : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]"
                            }`}
                            title="Click to toggle Visibility"
                          >
                            {cat.visible ? (
                              <>
                                <Eye className="h-3.5 w-3.5 text-[#2563EB]" /> Visible
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3.5 w-3.5 text-[#94A3B8]" /> Hidden
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions (Edit Button + Options Menu) */}
                        <td className="py-3 pr-4 pl-3 text-center">
                          <div className="relative inline-flex items-center gap-1.5">
                            {/* WORKING EDIT BUTTON */}
                            <button
                              type="button"
                              onClick={(e) => handleOpenEdit(cat, e)}
                              className="inline-flex items-center gap-1 rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-1 text-[12px] font-bold text-[#0F172A] shadow-2xs hover:border-[#2563EB] hover:bg-[#2563EB] hover:text-white active:scale-95 transition-all"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Edit
                            </button>

                            {/* More Options Menu (...) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenuId(isMenuOpen ? null : cat.id)
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9] active:scale-95 transition-all"
                              aria-label="More options"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {/* Dropdown Menu Popup */}
                            {isMenuOpen ? (
                              <div
                                className="absolute right-0 top-9 z-30 w-44 rounded-[12px] border border-[#E2E8F0] bg-white p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenEdit(cat, e)}
                                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[12px] font-medium text-[#1E293B] hover:bg-[#F1F5F9]"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-[#2563EB]" /> Edit Details
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => toggleFeatured(cat.id, e)}
                                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[12px] font-medium text-[#1E293B] hover:bg-[#F1F5F9]"
                                >
                                  <Star className="h-3.5 w-3.5 text-[#F59E0B]" /> Toggle Featured
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => toggleVisibility(cat.id, e)}
                                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[12px] font-medium text-[#1E293B] hover:bg-[#F1F5F9]"
                                >
                                  <Eye className="h-3.5 w-3.5 text-[#2563EB]" /> Toggle Visibility
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleDuplicate(cat.id, e)}
                                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[12px] font-medium text-[#1E293B] hover:bg-[#F1F5F9]"
                                >
                                  <Copy className="h-3.5 w-3.5 text-[#64748B]" /> Duplicate Row
                                </button>

                                <div className="my-1 border-t border-[#E2E8F0]" />

                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(cat.id, e)}
                                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[12px] font-semibold text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-600" /> Delete Category
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      <EditCategoryModal
        category={editingCategory}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingCategory(null)
        }}
        onSave={handleSaveEdit}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        nextOrder={categories.length + 1}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCategory}
      />
    </AppShell>
  )
}
