export interface CategoryItem {
  id: string
  order: number
  title: string
  description: string
  image: string
  productCount: number
  subcategories: string[]
  featured: boolean
  visible: boolean
  createdAt: string
}

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    order: 1,
    title: "RC Toys",
    description: "RC Toys collection at UNIQUE EXPRESSIONS",
    image: "/assets/dashboards/heroes/mobile-hero.png",
    productCount: 15,
    subcategories: ["RC Toys"],
    featured: true,
    visible: true,
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "cat-2",
    order: 2,
    title: "RC Flying Toys",
    description: "RC Flying Toys collection at UNIQUE EXPRESSIONS",
    image: "/assets/dashboards/heroes/vehicle-hero.png",
    productCount: 7,
    subcategories: ["RC Flying Toys"],
    featured: true,
    visible: true,
    createdAt: "2026-01-11T10:00:00.000Z",
  },
  {
    id: "cat-3",
    order: 3,
    title: "RC Cars & Buggies",
    description: "High-speed remote control cars, off-road trucks & racers",
    image: "/assets/dashboards/heroes/furniture-hero.png",
    productCount: 24,
    subcategories: ["RC Cars", "Trucks"],
    featured: false,
    visible: true,
    createdAt: "2026-01-12T10:00:00.000Z",
  },
  {
    id: "cat-4",
    order: 4,
    title: "Drones & Quadcopters",
    description: "Aerial photography drones, mini quads and video flyers",
    image: "/assets/dashboards/heroes/rental-hero.png",
    productCount: 12,
    subcategories: ["Drones", "Quadcopters"],
    featured: true,
    visible: true,
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "cat-5",
    order: 5,
    title: "Action Figures & Collectibles",
    description: "Anime, superhero, and sci-fi collectible figures",
    image: "/assets/dashboards/heroes/service-hero.png",
    productCount: 18,
    subcategories: ["Action Figures"],
    featured: false,
    visible: false,
    createdAt: "2026-01-18T10:00:00.000Z",
  },
  {
    id: "cat-6",
    order: 6,
    title: "STEM & Educational Toys",
    description: "Robotics kits, science experiments, and puzzle blocks",
    image: "/assets/dashboards/heroes/mobile-hero.png",
    productCount: 30,
    subcategories: ["STEM", "Robotics"],
    featured: true,
    visible: true,
    createdAt: "2026-01-20T10:00:00.000Z",
  },
]

const STORAGE_KEY = "trilok_b2c_categories_data_v1"

export function getCategories(): CategoryItem[] {
  if (typeof window === "undefined") return INITIAL_CATEGORIES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES))
      return INITIAL_CATEGORIES
    }
    const parsed = JSON.parse(raw) as CategoryItem[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CATEGORIES
  } catch (err) {
    console.error("Failed to load categories from storage:", err)
    return INITIAL_CATEGORIES
  }
}

export function saveCategories(categories: CategoryItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  } catch (err) {
    console.error("Failed to save categories to storage:", err)
  }
}
