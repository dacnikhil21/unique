"use client"

import * as React from "react"
import { ShoppingCart, Check, X, Plus, Minus, PackageCheck, AlertTriangle, ArrowRight } from "lucide-react"

export interface CartItem {
  id: string
  title: string
  price: string
  image: string
  stockCount: number
  quantity: number
}

interface AddToCartModalProps {
  isOpen: boolean
  item: CartItem | null
  onClose: () => void
  onProceedToCheckout?: () => void
}

export function AddToCartModal({
  isOpen,
  item,
  onClose,
  onProceedToCheckout,
}: AddToCartModalProps) {
  const [quantity, setQuantity] = React.useState(1)

  React.useEffect(() => {
    if (isOpen) {
      setQuantity(1)
    }
  }, [isOpen])

  if (!isOpen || !item) return null

  const isLowStock = item.stockCount > 0 && item.stockCount <= 5
  const isOutOfStock = item.stockCount <= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-[20px] bg-white p-5 shadow-2xl transition-all border border-[#E2E8F0]">
        {/* Success Header Pill */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E] text-white">
              <Check className="h-4 w-4" strokeWidth={3} />
            </div>
            <h2 className="text-[15px] font-bold text-[#0F172A]">Added to Cart Pop-up</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Item Details Box */}
        <div className="flex items-center gap-3 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] p-3">
          <div className="h-16 w-16 overflow-hidden rounded-[12px] border border-[#CBD5E1] bg-white shrink-0">
            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[14px] text-[#0F172A] truncate">{item.title}</h3>
            <p className="text-[12px] font-semibold text-[#2563EB] mt-0.5">{item.price}</p>

            {/* Inventory Tracking Status Badge */}
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-red-700 font-bold">
                  <AlertTriangle className="h-3 w-3" /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 font-bold">
                  <AlertTriangle className="h-3 w-3" /> Low Stock: Only {item.stockCount} left!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 font-bold">
                  <PackageCheck className="h-3 w-3 text-emerald-600" /> In Stock ({item.stockCount} Available)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="mt-4 flex items-center justify-between border-t border-b border-[#F1F5F9] py-3">
          <span className="text-[13px] font-semibold text-[#334155]">Select Quantity:</span>
          <div className="flex items-center gap-2 rounded-[10px] border border-[#CBD5E1] bg-white p-1">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#F1F5F9] text-[#0F172A] disabled:opacity-40 hover:bg-[#E2E8F0]"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-[13px] font-bold text-[#0F172A]">{quantity}</span>
            <button
              type="button"
              disabled={quantity >= item.stockCount}
              onClick={() => setQuantity((q) => Math.min(item.stockCount, q + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#F1F5F9] text-[#0F172A] disabled:opacity-40 hover:bg-[#E2E8F0]"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onClose()
              if (onProceedToCheckout) onProceedToCheckout()
            }}
            className="flex items-center justify-center gap-2 rounded-[12px] bg-[#2563EB] py-2.5 text-[14px] font-bold text-white shadow-md hover:bg-[#1D4ED8] active:scale-95 transition-all"
          >
            <ShoppingCart className="h-4 w-4" /> Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[12px] border border-[#CBD5E1] bg-white py-2 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
