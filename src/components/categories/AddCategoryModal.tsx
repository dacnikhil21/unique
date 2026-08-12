"use client"

import * as React from "react"
import { X, Plus, Sparkles, Eye, Tag, Package, Hash } from "lucide-react"
import type { CategoryItem } from "@/lib/categories-data"

interface AddCategoryModalProps {
  isOpen: boolean
  nextOrder: number
  onClose: () => void
  onAdd: (newCategory: CategoryItem) => void
}

const PRESET_IMAGES = [
  "/assets/dashboards/heroes/mobile-hero.png",
  "/assets/dashboards/heroes/vehicle-hero.png",
  "/assets/dashboards/heroes/furniture-hero.png",
  "/assets/dashboards/heroes/rental-hero.png",
  "/assets/dashboards/heroes/service-hero.png",
]

export function AddCategoryModal({
  isOpen,
  nextOrder,
  onClose,
  onAdd,
}: AddCategoryModalProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [image, setImage] = React.useState(PRESET_IMAGES[0])
  const [productCount, setProductCount] = React.useState<number>(0)
  const [subcategoriesText, setSubcategoriesText] = React.useState("")
  const [featured, setFeatured] = React.useState(false)
  const [visible, setVisible] = React.useState(true)
  const [errors, setErrors] = React.useState<{ title?: string; description?: string }>({})

  React.useEffect(() => {
    if (isOpen) {
      setTitle("")
      setDescription("")
      setImage(PRESET_IMAGES[0])
      setProductCount(0)
      setSubcategoriesText("")
      setFeatured(false)
      setVisible(true)
      setErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { title?: string; description?: string } = {}
    if (!title.trim()) {
      newErrors.title = "Category title is required"
    }
    if (!description.trim()) {
      newErrors.description = "Category description is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const subcategoriesArray = subcategoriesText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    const newCategory: CategoryItem = {
      id: `cat-${Date.now()}`,
      order: nextOrder,
      title: title.trim(),
      description: description.trim(),
      image: image || PRESET_IMAGES[0],
      productCount: Math.max(0, Number(productCount) || 0),
      subcategories: subcategoriesArray.length > 0 ? subcategoriesArray : [title.trim()],
      featured,
      visible,
      createdAt: new Date().toISOString(),
    }

    onAdd(newCategory)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[20px] bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#0F172A]">Add New Category</h2>
            <p className="text-[12px] text-[#64748B]">Create a new product category for your store</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Title */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1E293B]">
              Category Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Remote Control Helicopters"
              className="mt-1.5 w-full rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 py-2.5 text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
            />
            {errors.title ? (
              <p className="mt-1 text-[11px] font-medium text-red-500">{errors.title}</p>
            ) : null}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1E293B]">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the category..."
              className="mt-1.5 w-full rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 py-2.5 text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20 transition-all resize-none"
            />
            {errors.description ? (
              <p className="mt-1 text-[11px] font-medium text-red-500">{errors.description}</p>
            ) : null}
          </div>

          {/* Image Presets */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1E293B]">Category Image</label>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-[#F1F5F9] shadow-inner shrink-0">
                <img
                  src={image}
                  alt="Category preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Image URL or choose preset"
                  className="w-full rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-[12px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:bg-white"
                />
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[#64748B]">Presets:</span>
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setImage(preset)}
                      className={`h-6 w-6 rounded-md border text-[10px] font-bold transition-all ${
                        image === preset
                          ? "border-[#2563EB] bg-[#2563EB] text-white shadow-sm"
                          : "border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      P{idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Count */}
          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1E293B]">
              <Package className="h-4 w-4 text-[#2563EB]" /> Initial Products Count
            </label>
            <input
              type="number"
              min={0}
              value={productCount}
              onChange={(e) => setProductCount(Number(e.target.value))}
              className="mt-1.5 w-full rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 py-2 text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:bg-white"
            />
          </div>

          {/* Subcategories */}
          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1E293B]">
              <Tag className="h-4 w-4 text-[#2563EB]" /> Subcategories
            </label>
            <input
              type="text"
              value={subcategoriesText}
              onChange={(e) => setSubcategoriesText(e.target.value)}
              placeholder="e.g. RC Toys, Flying Toys (comma separated)"
              className="mt-1.5 w-full rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 py-2.5 text-[14px] text-[#0F172A] outline-none focus:border-[#2563EB] focus:bg-white"
            />
          </div>

          {/* Toggles: Featured & Visible */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div
              onClick={() => setFeatured(!featured)}
              className={`flex cursor-pointer items-center justify-between rounded-[14px] border p-3 transition-all ${
                featured
                  ? "border-[#F59E0B] bg-[#FFFBEB]"
                  : "border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={`h-4 w-4 ${featured ? "text-[#D97706]" : "text-[#94A3B8]"}`} />
                <span className="text-[13px] font-semibold text-[#1E293B]">Featured</span>
              </div>
              <div
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  featured ? "bg-[#F59E0B]" : "bg-[#CBD5E1]"
                }`}
              >
                <div
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    featured ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </div>

            <div
              onClick={() => setVisible(!visible)}
              className={`flex cursor-pointer items-center justify-between rounded-[14px] border p-3 transition-all ${
                visible
                  ? "border-[#2563EB] bg-[#EFF6FF]"
                  : "border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className={`h-4 w-4 ${visible ? "text-[#2563EB]" : "text-[#94A3B8]"}`} />
                <span className="text-[13px] font-semibold text-[#1E293B]">Visible</span>
              </div>
              <div
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  visible ? "bg-[#2563EB]" : "bg-[#CBD5E1]"
                }`}
              >
                <div
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    visible ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[12px] border border-[#CBD5E1] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#475569] hover:bg-[#F8FAFC] active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-[12px] bg-[#2563EB] px-6 py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-[#1D4ED8] active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" /> Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
