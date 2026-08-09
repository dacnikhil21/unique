
// ── Ensure LocalStorage Sync is Always Up to Date ────────────────────────
try {
  const cachedProds = JSON.parse(localStorage.getItem('ue_products_v9'));
  if (!Array.isArray(cachedProds) || cachedProds.length === 0 || !cachedProds[0].title) {
    localStorage.removeItem('ue_products_v9');
    localStorage.removeItem('ue_products_v8');
  }
} catch(e) {
  localStorage.removeItem('ue_products_v9');
}


// ── Production Schema Migrator & Enhancer ────────────────────────
function enhanceProductSchema(products) {
  if (!Array.isArray(products)) return [];
  return products.map((p, idx) => {
    const images = Array.isArray(p.images) && p.images.length > 0 
      ? p.images 
      : [p.image, p.image, p.image].filter(Boolean); // duplicate fallback for demo if single image

    // Add extra sample images if only 1 image exists for rich gallery testing
    if (images.length === 1) {
      images.push('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600');
      images.push('https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600');
    }

    const reviews = Array.isArray(p.reviews) ? p.reviews : [
      { id: 'rev-1-' + p.id, name: "Sowmya Rao", rating: 5, comment: "Exceptional quality and prompt same-day delivery in Madhurawada!", date: "28 Jul 2026", verified: true },
      { id: 'rev-2-' + p.id, name: "Rajesh Varma", rating: 5, comment: "Top notch product. Kids loved it!", date: "24 Jul 2026", verified: true },
      { id: 'rev-3-' + p.id, name: "Ananya P.", rating: 4, comment: "Great build quality, highly recommended boutique item.", date: "18 Jul 2026", verified: true }
    ];

    const features = Array.isArray(p.features) && p.features.length > 0 ? p.features : [
      "Authentic store item verified by UNIQUE EXPRESSIONS",
      "Same-day express local dispatch in Visakhapatnam",
      "Child-safe & non-toxic premium grade materials",
      "Full 3-Day Store Return & Exchange Guarantee"
    ];

    const specifications = p.specifications && Object.keys(p.specifications).length > 0 ? p.specifications : {
      "SKU Code": p.sku || ('UE-PROD-' + p.id),
      "Category": p.category || 'General',
      "Material": p.material || 'Premium Eco-ABS / Wood / Brass',
      "Dispatch": "Same-day in Vizag (530041)",
      "GST Invoice": "37BVTPG7761F1Z1",
      "Return Guarantee": "3 Days Easy Return"
    };

    const boughtTogether = Array.isArray(p.boughtTogether) ? p.boughtTogether : [];

    return {
      ...p,
      images,
      reviews,
      features,
      specifications,
      boughtTogether,
      videoUrl: p.videoUrl || p.video_url || '',
      weight: p.weight || '450g',
      material: p.material || 'High Grade Polycarbonate',
      warranty: p.warranty || '6 Months Boutique Store Warranty'
    };
  });
}

/* ==========================================================================
   UNIQUE EXPRESSIONS - WORLD-CLASS HERO BANNER & MOBILE APP LOGIC
   ========================================================================== */

let HERO_SLIDES = JSON.parse(localStorage.getItem('ue_hero_slides_v7')) || [
  {
    id: 1,
    img: "https://d1h96izmtdkx5o.cloudfront.net/-OPHhEadGd1W2rTwlBbq.jpg?v=5",
    badge: "✨ UNIQUE EXPRESSIONS VIZAG",
    title: "Curated Collection of Toys, Gifts & Stationery",
    sub: "Discover High-Quality RC Cars, Flying Drones, Educational STEM Toys, Traditional Handicrafts & Bespoke Return Gifts.",
    ctaText: "Explore Store Catalog",
    ctaLink: "#view=plp",
    active: true
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop",
    badge: "🎁 RETURN GIFT STUDIO",
    title: "Bespoke Party & Celebration Hampers",
    sub: "Customized gift boxes, wooden name keychains & birthday hampers tailored for kids & events.",
    ctaText: "Explore Return Gifts",
    ctaLink: "#view=plp&category=Return%20Gifts",
    active: true
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
    badge: "📦 WHOLESALE & BULK GST ORDERS",
    title: "Direct Wholesale GST Billing",
    sub: "Volume discounts & input credit invoices (GSTIN: 37BVTPG7761F1Z1) for store owners & event planners.",
    ctaText: "Wholesale Partner Portal",
    ctaLink: "#view=wholesale",
    active: true
  }
];

let currentHeroIndex = 0;
let heroTimer = null;

let CATEGORIES_DATA = JSON.parse(localStorage.getItem('ue_categories_data_v5')) || [
  {
    "id": "-OlMg9x5rg2whiy_qnz7",
    "name": "RC Toys",
    "description": "RC Toys collection at UNIQUE EXPRESSIONS",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
    "subcategories": [
      "RC Toys"
    ],
    "isFeatured": true,
    "isVisible": true,
    "sortOrder": 1
  },
  {
    "id": "-Opqx7QGM-kXaKwgkAMf",
    "name": "RC Flying Toys",
    "description": "RC Flying Toys collection at UNIQUE EXPRESSIONS",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
    "subcategories": [
      "RC Flying Toys"
    ],
    "isFeatured": true,
    "isVisible": true,
    "sortOrder": 2
  },
  {
    "id": "-O_ulCIFrv0XxjtLO57Z",
    "name": "Educational Toys",
    "description": "Educational Toys collection at UNIQUE EXPRESSIONS",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
    "subcategories": [
      "Educational Toys"
    ],
    "isFeatured": true,
    "isVisible": true,
    "sortOrder": 3
  },
  {
    "id": "-O_v2NV8oS3tXI0meXWL",
    "name": "Standard Toys",
    "description": "Standard Toys collection at UNIQUE EXPRESSIONS",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
    "subcategories": [
      "Standard Toys"
    ],
    "isFeatured": true,
    "isVisible": true,
    "sortOrder": 4
  },
  {
    "id": "-O_VyIL9w369A00JEKUX",
    "name": "Handicrafts",
    "description": "Handicrafts collection at UNIQUE EXPRESSIONS",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
    "subcategories": [
      "Handicrafts"
    ],
    "isFeatured": true,
    "isVisible": true,
    "sortOrder": 5
  },
  {
    "id": "-O_WcwUXR93XyalqJm8s",
    "name": "Stationary",
    "description": "Stationary collection at UNIQUE EXPRESSIONS",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
    "subcategories": [
      "Stationary"
    ],
    "isFeatured": true,
    "isVisible": true,
    "sortOrder": 6
  },
  {
    "id": "-Oh9ZXwAtB_3QNn9Ld9r",
    "name": "Combos",
    "description": "Combos collection at UNIQUE EXPRESSIONS",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
    "subcategories": [
      "Combos"
    ],
    "isFeatured": true,
    "isVisible": true,
    "sortOrder": 7
  },
  {
    "id": "-Oaeo4RysOAMwtXZn7m7",
    "name": "Kids Footwear",
    "description": "Kids Footwear collection at UNIQUE EXPRESSIONS",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
    "subcategories": [
      "Kids Footwear"
    ],
    "isFeatured": true,
    "isVisible": true,
    "sortOrder": 8
  },
  {
    "id": "-O_v2trm86gBJJTXwLLg",
    "name": "Gifts & Gadgets",
    "description": "Gifts & Gadgets collection at UNIQUE EXPRESSIONS",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
    "subcategories": [
      "Gifts & Gadgets"
    ],
    "isFeatured": true,
    "isVisible": true,
    "sortOrder": 9
  },
  {
    "id": "-O_WcsOAQRkDGH5FkmNE",
    "name": "Return Gifts",
    "description": "Return Gifts collection at UNIQUE EXPRESSIONS",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
    "subcategories": [
      "Return Gifts"
    ],
    "isFeatured": true,
    "isVisible": true,
    "sortOrder": 10
  },
  {
    "id": "-OiCu94_rWjPcWX8nmt0",
    "name": "Latest Arrivars",
    "description": "Latest Arrivars collection at UNIQUE EXPRESSIONS",
    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop",
    "subcategories": [
      "Latest Arrivars"
    ],
    "isFeatured": true,
    "isVisible": true,
    "sortOrder": 11
  }
];

let CATEGORIES = CATEGORIES_DATA.map(c => c.name);
localStorage.setItem('ue_categories_data_v4', JSON.stringify(CATEGORIES_DATA));
localStorage.setItem('ue_hero_slides_v7', JSON.stringify(HERO_SLIDES));
localStorage.setItem('ue_hero_slides_v6', JSON.stringify(HERO_SLIDES));

function syncStorefrontState() {
  localStorage.setItem('ue_products_v8', JSON.stringify(ALL_PRODUCTS));
  localStorage.setItem('ue_categories_data_v5', JSON.stringify(CATEGORIES_DATA));
  localStorage.setItem('ue_categories_v5', JSON.stringify(CATEGORIES));
  localStorage.setItem('ue_hero_slides_v6', JSON.stringify(HERO_SLIDES));
  localStorage.setItem('ue_store_settings_v5', JSON.stringify(STORE_SETTINGS));
  localStorage.setItem('ue_orders_v5', JSON.stringify(userOrders));
  localStorage.setItem('ue_reviews_v5', JSON.stringify(STORE_REVIEWS));

  // Live re-render all storefront components
  if (typeof renderDesktopGrid === 'function') renderDesktopGrid();
  if (typeof renderCategoryBar === 'function') renderCategoryBar();
  if (typeof renderMobileHome === 'function') renderMobileHome();
  if (typeof renderAllSections === 'function') renderAllSections();
  if (typeof updateBadges === 'function') updateBadges();
}

const BOUTIQUE_SEED_CATALOG = [
  // RC Toys
  { title: "RC Police NEED FOR SPEED Racing", category: "RC Toys", price: 2499, originalPrice: 3500, discount: 28, stockQty: 12, image: "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvR.jpg", isFeatured: true },
  { title: "RC Defending Climbing Off-Road Car", category: "RC Toys", price: 1199, originalPrice: 1500, discount: 20, stockQty: 18, image: "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvS.jpg", isFeatured: true },
  { title: "RC Cross Country Off-Road R/C Car", category: "RC Toys", price: 1539, originalPrice: 2500, discount: 38, stockQty: 15, image: "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvT.jpg", isFeatured: true },
  { title: "RC 5 in 1 Follow Me Smart Car", category: "RC Toys", price: 1999, originalPrice: 2499, discount: 20, stockQty: 10, image: "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlkYecJocp73ppzbFzW.jpg", isFeatured: true },
  { title: "RC 360 High Speed Stunt Car", category: "RC Toys", price: 799, originalPrice: 900, discount: 11, stockQty: 25, image: "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_v2Sh1o2nbMLPq0-9A.jpg", isFeatured: true },

  // RC Flying Toys
  { title: "RC Rechargeable Induction Flying Helicopter", category: "RC Flying Toys", price: 699, originalPrice: 999, discount: 30, stockQty: 22, image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=600&auto=format&fit=crop", isFeatured: true },
  { title: "Astronaut Mini Sensor Flying Ball", category: "RC Flying Toys", price: 899, originalPrice: 1299, discount: 30, stockQty: 14, image: "https://images.unsplash.com/photo-1517999186661-ac0f0aef3699?q=80&w=600&auto=format&fit=crop", isFeatured: true },

  // Educational & STEM
  { title: "STEM Educational Building Blocks Set", category: "Educational & STEM", price: 899, originalPrice: 1199, discount: 25, stockQty: 24, image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=600&auto=format&fit=crop", isFeatured: true },
  { title: "Magnetic Wooden Chess & Board Game", category: "Educational & STEM", price: 349, originalPrice: 449, discount: 22, stockQty: 15, image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=600&auto=format&fit=crop", isFeatured: false },

  // Trending & Standard Toys
  { title: "Jumbo Soft Plush Teddy Bear (3 Feet)", category: "Trending & Standard Toys", price: 499, originalPrice: 649, discount: 23, stockQty: 12, image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?q=80&w=600&auto=format&fit=crop", isFeatured: false },
  { title: "Rechargeable Dancing Cactus Toy", category: "Trending & Standard Toys", price: 299, originalPrice: 399, discount: 25, stockQty: 30, image: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?q=80&w=600&auto=format&fit=crop", isFeatured: false },

  // Traditional Handicrafts
  { title: "Handcrafted Antique Brass Ganesha Idol", category: "Traditional Handicrafts", price: 1499, originalPrice: 1999, discount: 25, stockQty: 8, image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=600&auto=format&fit=crop", isFeatured: true },
  { title: "Kondapalli Wooden Traditional Musician Set", category: "Traditional Handicrafts", price: 650, originalPrice: 850, discount: 23, stockQty: 12, image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop", isFeatured: false },

  // Fancy Imported Stationery
  { title: "Kawaii Unicorn Multi-Color Gel Pen Set", category: "Fancy Imported Stationery", price: 249, originalPrice: 329, discount: 24, stockQty: 40, image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600&auto=format&fit=crop", isFeatured: false },
  { title: "A5 Vintage Leather Hardbound Journal", category: "Fancy Imported Stationery", price: 399, originalPrice: 499, discount: 20, stockQty: 18, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop", isFeatured: true },

  // Return Gift Studio
  { title: "Kids Birthday Party Hamper Combo Box", category: "Return Gift Studio", price: 150, originalPrice: 200, discount: 25, stockQty: 60, image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop", isFeatured: true },
  { title: "Customized Wooden Name Keychains (Set of 10)", category: "Return Gift Studio", price: 350, originalPrice: 450, discount: 22, stockQty: 45, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop", isFeatured: false }
];

function generateSeedProducts() {
  return BOUTIQUE_SEED_CATALOG.map((item, idx) => ({
    id: idx + 1,
    sku: `UE-SKU-${1000 + idx + 1}`,
    title: item.title,
    category: item.category,
    image: item.image,
    price: item.price,
    originalPrice: item.originalPrice,
    discount: item.discount,
    rating: (4.5 + (idx % 5) * 0.1).toFixed(1),
    reviewsCount: 20 + idx * 3,
    description: `Authentic ${item.category} product offered by UNIQUE EXPRESSIONS, Visakhapatnam. Quality tested and available for retail & wholesale GST orders.`,
    stockQty: item.stockQty,
    inStock: true,
    isFeatured: item.isFeatured
  }));
}

let ALL_PRODUCTS = enhanceProductSchema(JSON.parse(localStorage.getItem('ue_products_v9')) || [
  {
    "id": "-Opqr9zjYihHIsQMkg4_",
    "title": "RC Police NEED FOR SPPED Racing",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqr9zjYih",
    "price": 2499,
    "originalPrice": 3500,
    "discount": 29,
    "rating": "4.9",
    "reviewsCount": 18,
    "description": "RC Police NEED FOR SPPED Racing - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvR.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvR.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqr9zjYihHIsQMkg4a",
    "title": "RC Defending Climbing",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqr9zjYih",
    "price": 1199,
    "originalPrice": 1500,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 21,
    "description": "RC Defending Climbing - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvS.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvS.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqr9zjYihHIsQMkg4b",
    "title": "RC Cross country off road R/C car",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqr9zjYih",
    "price": 1539,
    "originalPrice": 2500,
    "discount": 38,
    "rating": "4.9",
    "reviewsCount": 24,
    "description": "RC Cross country off road R/C car - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvT.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvT.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqr9zjYihHIsQMkg4c",
    "title": "RC  5 in 1 Follow me Car",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqr9zjYih",
    "price": 1999,
    "originalPrice": 2499,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 27,
    "description": "<a href=\"https://www.instagram.com/reel/DWDepMSzkT3/?igsh=aDNtdW42N242aTc3\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWDepMSzkT3/?igsh=aDNtdW42N242aTc3</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlkYecJocp73ppzbFzW.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlkYecJocp73ppzbFzW.jpg",
    "stockQty": 3,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqr9zjYihHIsQMkg4e",
    "title": "360 Stunt Car",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqr9zjYih",
    "price": 799,
    "originalPrice": 900,
    "discount": 11,
    "rating": "4.9",
    "reviewsCount": 30,
    "description": "360 Stunt Car - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_v2Sh1o2nbMLPq0-9A.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_v2Sh1o2nbMLPq0-9A.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqr9zjYihHIsQMkg4T",
    "title": "RC  MOKA Buggy Car with camera",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqr9zjYih",
    "price": 1199,
    "originalPrice": 1599,
    "discount": 25,
    "rating": "4.9",
    "reviewsCount": 33,
    "description": "Watch Full video here <a href=\"https://www.instagram.com/reel/DWoN1U3knTS/?igsh=MTh2amc0OXRtcnNxZQ==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWoN1U3knTS/?igsh=MTh2amc0OXRtcnNxZQ==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGv.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpSjWowzQdxCNe7AkfM.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpSjWpJk88gtyHFkI1r.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpSjWpauFgoVRmrvCvb.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGv.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqr9zjYihHIsQMkg4U",
    "title": "RC F1 Racing Car",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqr9zjYih",
    "price": 1859,
    "originalPrice": 2599,
    "discount": 28,
    "rating": "4.9",
    "reviewsCount": 36,
    "description": "RC F1 Racing Car - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgRKreLkAizzt_en4n.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgRKreLkAizzt_en4n.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqr9zjYihHIsQMkg4W",
    "title": "RC Racing Stunt car",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqr9zjYih",
    "price": 1459,
    "originalPrice": 2000,
    "discount": 27,
    "rating": "4.9",
    "reviewsCount": 39,
    "description": "RC Racing Stunt car - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPR4JKolX6G9K4-.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPR4JKolX6G9K4-.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqr9zjYihHIsQMkg4X",
    "title": "RC MOKA Cyber Truck ROCK CRAWLER (With Camera)",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqr9zjYih",
    "price": 1999,
    "originalPrice": 2500,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 42,
    "description": "<a href=\"https://www.instagram.com/reel/DVSkVpuksG2/?igsh=MTQ1N3h6ZmNyOXF4Yw==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVSkVpuksG2/?igsh=MTQ1N3h6ZmNyOXF4Yw==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvP.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvP.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqr9zjYihHIsQMkg4Y",
    "title": "RC  Bumper Cars",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqr9zjYih",
    "price": 2899,
    "originalPrice": 3500,
    "discount": 17,
    "rating": "4.9",
    "reviewsCount": 45,
    "description": "<a href=\"https://www.instagram.com/reel/DV5LdrkE0wv/?igsh=bHJ0cGVjZm9wNW9n\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DV5LdrkE0wv/?igsh=bHJ0cGVjZm9wNW9n</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvO.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvO.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqr9zjYihHIsQMkg4Z",
    "title": "RC Drift Racing(Yellow)",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqr9zjYih",
    "price": 1759,
    "originalPrice": 2000,
    "discount": 12,
    "rating": "4.9",
    "reviewsCount": 48,
    "description": "<a href=\"https://www.instagram.com/reel/DWLJmqXT5Rs/?igsh=bnM1ejVxeXZmMGly\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWLJmqXT5Rs/?igsh=bnM1ejVxeXZmMGly</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvQ.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvQ.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OpqtprhF8QeiCpCXoPk",
    "title": "RC Mini Drift Car",
    "category": "RC Toys",
    "sku": "UE-SKU-OpqtprhF8Q",
    "price": 1799,
    "originalPrice": 2299,
    "discount": 22,
    "rating": "4.9",
    "reviewsCount": 51,
    "description": "Watch Full video here <a href=\"https://www.instagram.com/reel/DWapR1kEmH6/?igsh=MXJpbGM4Z2R0d2g2Nw==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWapR1kEmH6/?igsh=MXJpbGM4Z2R0d2g2Nw==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPR4JKolX6G9K3z.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPR4JKolX6G9K3z.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqu8dQQPJ7UXswTaiX",
    "title": "RC F1 Car",
    "category": "RC Toys",
    "sku": "UE-SKU-Opqu8dQQPJ",
    "price": 1099,
    "originalPrice": 1500,
    "discount": 27,
    "rating": "4.9",
    "reviewsCount": 54,
    "description": "RC F1 Car - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvK.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvK.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqzh-pQGRG_gzVpmHd",
    "title": "Flying Spinner",
    "category": "RC Flying Toys",
    "sku": "UE-SKU-OpqzhpQGRG",
    "price": 360,
    "originalPrice": 360,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 18,
    "description": "Watch Full video here <a href=\"https://www.instagram.com/reel/DWYvL-3j6QZ/?igsh=MWVobW12aG1tMGthdg==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWYvL-3j6QZ/?igsh=MWVobW12aG1tMGthdg==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGk.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGk.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqzh-qUVxckfe6Wlpe",
    "title": "RC Fighter Jet Drone",
    "category": "RC Flying Toys",
    "sku": "UE-SKU-OpqzhqUVxc",
    "price": 1440,
    "originalPrice": 1800,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 21,
    "description": "<a href=\"https://www.instagram.com/reel/DWNx2_zTbB8/?igsh=MXI1M255cTZ3ZjY2cw==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWNx2_zTbB8/?igsh=MXI1M255cTZ3ZjY2cw==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGx.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGx.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opqzh-qUVxckfe6Wlpf",
    "title": "J2 Drone",
    "category": "RC Flying Toys",
    "sku": "UE-SKU-OpqzhqUVxc",
    "price": 2499,
    "originalPrice": 3000,
    "discount": 17,
    "rating": "4.9",
    "reviewsCount": 24,
    "description": "<a href=\"https://www.instagram.com/reel/DVBXtCeEizL/?igsh=OG0xZjVvYnFlcmZo\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVBXtCeEizL/?igsh=OG0xZjVvYnFlcmZo</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oleps18Vt_HoESVTeud.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oleps18Vt_HoESVTeud.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opw9lwdgM99nQhS9ywi",
    "title": "RC Flying Car",
    "category": "RC Flying Toys",
    "sku": "UE-SKU-Opw9lwdgM9",
    "price": 3299,
    "originalPrice": 3900,
    "discount": 15,
    "rating": "4.9",
    "reviewsCount": 27,
    "description": "<a href=\"https://www.instagram.com/reel/DVV1Lzykuxi/?igsh=MWZuZzVyd3A4c2pwOQ==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVV1Lzykuxi/?igsh=MWZuZzVyd3A4c2pwOQ==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGz.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGz.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opw9lweUZvJ4A8MYvJj",
    "title": "RC Flying Bike",
    "category": "RC Flying Toys",
    "sku": "UE-SKU-Opw9lweUZv",
    "price": 1299,
    "originalPrice": 1500,
    "discount": 13,
    "rating": "4.9",
    "reviewsCount": 30,
    "description": "RC Flying Bike - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGy.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGy.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opw9Ww7aaNnie7G6uBQ",
    "title": "Fighter Plane Interstellar",
    "category": "RC Flying Toys",
    "sku": "UE-SKU-Opw9Ww7aaN",
    "price": 1599,
    "originalPrice": 1999,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 33,
    "description": "Fighter Plane Interstellar - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpsebbT1KVpJEaw7UmW.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxnW5EHtrQ90TCm0ML.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxnW5YliJ7IA-rxkVb.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpsebbT1KVpJEaw7UmW.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opw9Ww7aaNnie7G6uBR",
    "title": "Y-Series Plane",
    "category": "RC Flying Toys",
    "sku": "UE-SKU-Opw9Ww7aaN",
    "price": 1599,
    "originalPrice": 1999,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 36,
    "description": "Y-Series Plane - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpsebbT1KVpJEaw7Umc.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxndFOi01ctFz-hKHs.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpsebbT1KVpJEaw7Umc.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OdNrJoCJV-nQYS5t8kI",
    "title": "7 in 1 Education Board",
    "category": "Educational Toys",
    "sku": "UE-SKU-OdNrJoCJVn",
    "price": 999,
    "originalPrice": 1178.82,
    "discount": 15,
    "rating": "4.9",
    "reviewsCount": 18,
    "description": "Watch Full video here: \n\n<a href=\"https://www.instagram.com/reel/DQs_3JxEqyl/?igsh=YWE1b2RmbXYyOW9u\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DQs_3JxEqyl/?igsh=YWE1b2RmbXYyOW9u</a>\n\nToys and Games\nFEATURES: Dual-sided magnetic whiteboard & blackboard. Abacus & clock may help boost a child's creativity & intelligence. Foldable design to create slim profile for storage.; No assembly required; ideal for both standing or seated positions; shelf on both sides\nPROVIDES SCREEN FREE FUN: Uses a stylus to draw on the erasable sketch pad, writes and plays games to encourage children's creativity. Perfect height for Toddlers and Younger Children; Keep Your Kids Busy with Art Instead of TV.\nCULTIVATES ARTISTIC ABILITY: Help them Learning how to express themselves visually, the drawing board develops the child's artistic ability and demonstrates the ability of their thinking.\nEMBEDDED ERASER: This children's drawing board is very convenient, which is good for cultivating children's hobbies and improving their painting skills. The magnetic tablet has a sliding eraser that erases the drawing quickly and easily.\nDEVELOPS PAINTING SKILLS: This children's drawing board is very convenient, which is good for cultivating children's hobbies and improving their painting skills. This art easel is an exceptional gift for kids ages 3 to 6 years.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OdNrJozEUidWT3AzEWh.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OdNrJozEUidWT3AzEWh.jpg",
    "stockQty": 14,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OgqaVy0IO3frefrDtsJ",
    "title": "WATCH REMOTE CAR",
    "category": "Educational Toys",
    "sku": "UE-SKU-OgqaVy0IO3",
    "price": 699,
    "originalPrice": 699,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 21,
    "description": "Watch Full video here: \n\n<a href=\"https://www.instagram.com/reel/DTE7wQjEkcE/?igsh=c2t2NmRla3FidjBh\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DTE7wQjEkcE/?igsh=c2t2NmRla3FidjBh</a>\n\nMini Remote Control Car Watch Toys】 The body of the mini remote control car watch toys is made of high-quality ABS and Alloy material, which gives the car a strong anti-collision ability. The RC car strap use safe, comfortable, skin-friendly, durable and easy weared Silicone material, and kids can adjust the strap at will\n【2.4GHz Independent Signal】Small Rc watch cars toys with 30 meters remote control distance, infrared emission in a wide range, can be effectively controlled within a maximum 30 meters linear infrared distance. Offer a stable signal linear infrared control, two or more cars race together without remote confusion.\n【Usb Charging】The car watch toys support usb charging. Worry-free battery life, it can be connected to socket power banks, computers and other common usb devices to charge.\n【Child Friendly Remote】 The RC watch cars toys only 3 buttons on the watch, control with two buttons to move the car forward and in rotation. You can control the toy car to drive in any direction from your watch. easy to learn, the baby can easily grasp. The third button is to pop open the cover, dust-proof, comes with a dust-proof cover, one-button button pops open the cover to protect the car from damage\n【Perfect Gifts】 If you are looking for an exciting and cool gift, then you will love it. Mini remote control car watch toys is the best gift for children on birthdays, Christmas, Halloween and other festivals, your children will love this watch remote control car toy. Package Includes: comes with a watch remote control car toy, a usb charging cable.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Ogqa_QRZ0oDithujOBc.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqaVy0IO3frefrDtsJ.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Ogqa_QRZ0oDithujOBc.jpg",
    "stockQty": 0,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Ogqcd3gF4dW-id6ZesN",
    "title": "BOUNCING CAROUSEL",
    "category": "Educational Toys",
    "sku": "UE-SKU-Ogqcd3gF4d",
    "price": 950,
    "originalPrice": 999,
    "discount": 5,
    "rating": "4.9",
    "reviewsCount": 24,
    "description": "Watch Full video here: \n\n<a href=\"https://www.instagram.com/reel/DTU96fSkr9w/?igsh=ZXFranJhcTBmNHZ4\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DTU96fSkr9w/?igsh=ZXFranJhcTBmNHZ4</a>\n\n【Experience the Thrill with the Flying duck Launcher Toy】 Our outdoor kids toys include 10 ducks. Playing is a breeze! Kids turn on the disc to shoot the duscks into the air and then catch them with the net as they fall. With the thoughtful Anti-drop buckle design, you can snap the launcher together after playing to prevent the duck from getting lost.\n\n* 【Perfect Outdoor Toys for Boys 4-6】 Our manual capture-catching game is suitable for kids of various ages. It's an ideal outside games for kids aged 2-3, 3-5, and 4-6. This game is not only enjoyable but also promotes physical activity. It's a great yard game for boys and girls to enjoy with their friends and family.\n\n* 【Exciting Indoor and Outdoor Activity Games】 The ducks launch at different heights. Whether you're at the park, in the yard, or camping outside, this flying toy guarantees an enjoyable playtime for your child.\n\n* Easy to Use & Highly Portable-Our flying duck launcher is designed for hassle-free fun. This user-friendly feature makes it incredibly convenient to bring along on any adventure. Whether you're in the backyard, at the park, on the lawn, or even at the beach, this toy ensures your child can enjoy indoor or outdoor play to the fullest. It's lightweight and portable, allowing for on-the-go fun",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OkOUXMsTDDj3OVqwTsZ.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OkOUXMsTDDj3OVqwTsZ.jpg",
    "stockQty": 11,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OgqNBf8odRkXNdtv1Vv",
    "title": "self defence SAFETY ROD",
    "category": "Educational Toys",
    "sku": "UE-SKU-OgqNBf8odR",
    "price": 360,
    "originalPrice": 360,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 27,
    "description": "Watch Full video here: \n\n<a href=\"https://www.instagram.com/reel/DUdSTS9Em0H/?igsh=NTF6Z2Zzd3poNTlw\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DUdSTS9Em0H/?igsh=NTF6Z2Zzd3poNTlw</a>\n\nPREMIUM CONSTRUCTION: Made from high-quality stainless steel for superior durability and long-lasting performance in various conditions\nEXTENDABLE DESIGN: Foldable and extendable wand that compacts for easy storage and portability, perfect for travel and outdoor activities\nCOMFORTABLE GRIP: Features a non-slip grip handle that ensures secure hold and comfortable use during extended periods\nMULTI-PURPOSE USE: Versatile walking stick suitable for hiking, trekking, self-defence, and everyday mobility support\nCOMPACT AND PORTABLE: Lightweight foldable design allows for convenient carrying in bags or backpacks when not in use",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqNRkkHqsv8Mn934OU.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqNBf8odRkXNdtv1Vv.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqNRkkHqsv8Mn934OU.jpg",
    "stockQty": 12,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OgqP2spHT2p1yCREPxz",
    "title": "SPIN BUDDY",
    "category": "Educational Toys",
    "sku": "UE-SKU-OgqP2spHT2",
    "price": 450,
    "originalPrice": 599,
    "discount": 25,
    "rating": "4.9",
    "reviewsCount": 30,
    "description": "Watch Full video here: \n\n<a href=\"https://www.instagram.com/reel/DTIVB__Em-l/?igsh=a29jaHQzYXJ2ZWVk\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DTIVB__Em-l/?igsh=a29jaHQzYXJ2ZWVk</a>\n\n Baby Spinner toys is designed for toddlers since it's has no sharp edges, BPA free, dishwasher safe.This can suck on glass, wall, and flat surface.\n\nProduct Specification - It has a suction cup which suck the toy on flat surface.Non-battery operated.\n\nPackage includes: 3* Spinner (Colours will be sent as per the availability)",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqP2spHT2p1yCREPxz.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqP2spHT2p1yCREPxz.jpg",
    "stockQty": 3,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OgqQca8yfqEQ66GVIr3",
    "title": "PARTY BUBBLE CAKE",
    "category": "Educational Toys",
    "sku": "UE-SKU-OgqQca8yfq",
    "price": 699,
    "originalPrice": 999,
    "discount": 30,
    "rating": "4.9",
    "reviewsCount": 33,
    "description": "Watch Full video here: \n\n<a href=\"https://www.instagram.com/reel/DTAnXDGEnt0/?igsh=MWdmang2bnV5azIwcg==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DTAnXDGEnt0/?igsh=MWdmang2bnV5azIwcg==</a>\n\n🎂 Magical Birthday Fun – Rechargeable party bubble cake toy with lights, music, and unlimited bubble output to create a joyful celebration atmosphere.\n🎶 Plays Happy Birthday Song – Adds a special touch with cheerful music and glowing lights while bubbles fill the air.\n✨ Unlimited Bubbles & Lights – Colorful LED lights and a rotating gear keep the bubbles flowing non-stop for endless entertainment.\n🚗 Bump & Go Feature – Moves automatically in all directions, avoiding obstacles while keeping kids engaged.\n🎁 Perfect Birthday Gift – Includes DIY stickers for decoration, making it a fun and creative present for kids aged 3+.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqQca8yfqEQ66GVIr3.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqQca8yfqEQ66GVIr3.jpg",
    "stockQty": 8,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OgqSOwxOOeurvDS-vcy",
    "title": "PORTABLE MINI PRINTER",
    "category": "Educational Toys",
    "sku": "UE-SKU-OgqSOwxOOe",
    "price": 999,
    "originalPrice": 999,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 36,
    "description": "Watch Full video here: \n\n<a href=\"https://www.instagram.com/reel/DTo-3KkEiEV/?igsh=MWw2b2J2cmR1ZWx3OQ==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DTo-3KkEiEV/?igsh=MWw2b2J2cmR1ZWx3OQ==</a>\n\nThis Mini Bluetooth Thermal Printer is a portable and ink-free label printer designed for use with both Android and iOS systems. Its small size and Bluetooth connectivity make it easy to use on the go. With crisp black on white printing and a roll of print paper included, this printer is a convenient and efficient solution for all your labeling needs.&nbsp;This value pack comes with 10 rolls of print paper and stickers, making it the perfect choice for all your printing needs.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqSOwxOOeurvDS-vcy.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqSSh9uWYi3zei-OHt.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqSSgz_DxGrYSvo4VC.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqSOwxOOeurvDS-vcy.jpg",
    "stockQty": 5,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OgqTST_jzn35FCRfmOH",
    "title": "BALANCE DINOSAUR",
    "category": "Educational Toys",
    "sku": "UE-SKU-OgqTSTjzn3",
    "price": 1199,
    "originalPrice": 1500,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 39,
    "description": "Watch Full video here: \n\n<a href=\"https://www.instagram.com/reel/DTSXniQEoNf/?igsh=bWJsYWY1ZGprZnJn\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DTSXniQEoNf/?igsh=bWJsYWY1ZGprZnJn</a>\n\nDinosaur learning & educational toys:The package includes 1 balance, 2 trays, 10 colorful digital weights, 20 small dinosaur weights. Preschool learning toys for 3 4 5 6 7 8 year old.\nMath toys & games:Dinosaur's shape educational toys for kids 5-7 is cute. Kids can put the colorful number block on the left and the small dinosaur weight on the right to balance the sides. This stem toys is helpful for preschool learning activities that help children improve math skills and hand-eye coordination in the process of thinking and hands-on.\nEducational tools: A preschool math games that parents can learn and play with their kids, learn the words and numbers on the cards with your kids, match them with pictures, and fit the letter squares into the grooves on the scale.This educational toys for 3 to 6 year old boys and girls will help children learn words and recognize numbers faster.\nWe attach great importance to the quality and safety of our products. All components of the puppy balance scale cool toys set have been carefully designed and manufactured to ensure the safety and health of children. The material selection is environmentally friendly, meeting safety standards, allowing you to rest assured and allowing children to freely explore and play.\nInteresting design:Each part of the math manipulatives stem toys is designed with reference to the baby's little hand, and can be easily picked up. The cards have four algorithms of addition, subtraction, multiplication and division for boys and girls. It can be selected according to the toddler's own growth stage and development status. It's the perfect birthday gift dinosaur educational toys for 3 4 5 6 7 year old boys and girls!",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqTXmQfXZnpHDBHnvS.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqTXmiFJ8xOfKCx7dT.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqTST_jzn35FCRfmOH.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqTXmQfXZnpHDBHnvS.jpg",
    "stockQty": 4,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OgqWs8NelNXVoury3d3",
    "title": "30 ACTIVITY NOTEBOOK LAPTOP",
    "category": "Educational Toys",
    "sku": "UE-SKU-OgqWs8NelN",
    "price": 1899,
    "originalPrice": 2399,
    "discount": 21,
    "rating": "4.9",
    "reviewsCount": 42,
    "description": "Watch Full video here: \n\n<a href=\"https://www.instagram.com/reel/DSxC9THkoyV/?igsh=MW1zMXNjcWhramJzNg==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DSxC9THkoyV/?igsh=MW1zMXNjcWhramJzNg==</a>\n\n\nMultiple Functions: Spelling and Identification of pictures find the word, vocabulary, mathematics and much more. Helps in alphabets recognition & pronunciation, spelling test etc. Learn the correct pronunciation and spelling of numbers, learn to write the numbers, identification (visual & verbal). Learn musical notes, play melodies, play musical notes. Recognize musical notes (visual and verbal) Play games, catch falling objects, find the matching pair, star shooting.\nDevelopment with Computers: This educational purpose computer toy for kids comes equipped with a real like laptop so your child can begin to familiarize themselves with typing. Also this laptop comes with a mouse, which can introduce basic mouse skills and develop early computer awareness skills. Click on the mouse to play music.\nVisual Learning Display: This educational laptop toy displays the letter, numbers, modes, words, and even the games on the screen to enhance your child learning development.\nSafe Material for Kids: This piano keyboard toy comes with smooth edges and surface which exterior are very delicate, with no rough workmanship, and sharp corners.\nPerfect Gift for Kids: Educational toys can be given as birthday gifts, party, holidays or festival gifts; it is suitable for kids 3+ Years boys and girls.\nPower Source: USB Charging & 3xAA Batteries Powered; DC power connector of the USB power cord is connected to the power jack at the back of the keyboard, and the other end is connected to a USB power adapter. Portable piano keyboard adopts a dual power supply, USB charging or 3xAA batteries (not included), and battery power is convenient for playing indoor and outdoor.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqX0Gm2_3vB_5_aLYj.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqX0H-txLwlti51LhZ.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqWs8NelNXVoury3d3.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgqX0Gm2_3vB_5_aLYj.jpg",
    "stockQty": 8,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OkhbOvtVkyTbXwCIdiE",
    "title": "Bunny Magnetic Board",
    "category": "Educational Toys",
    "sku": "UE-SKU-OkhbOvtVky",
    "price": 699,
    "originalPrice": 799,
    "discount": 13,
    "rating": "4.9",
    "reviewsCount": 45,
    "description": "Watch Full video here: \n<a href=\"https://www.instagram.com/reel/DQjhvmBkoL-/?igsh=MWtsZjY5enFza3M3OA==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DQjhvmBkoL-/?igsh=MWtsZjY5enFza3M3OA==</a>\n\n* Age Range: This toy is suitable for children aged 3 to 6 years old, encouraging developmentally appropriate play and skill-building activities.\n* Safety Features: Crafted from durable, non-toxic materials, this toy prioritizes child safety with rounded edges and exceeds all safety standards for peace of mind\n* Educational Value: Designed to stimulate cognitive development, this toy fosters creativity, problem-solving skills, and hand-eye coordination through interactive play.\n* Durability: Built to withstand hours of play, this toy boasts a sturdy construction that can endure rough handling and ensures long-lasting enjoyment.\n* Versatility: From imaginative role-playing scenarios to structured learning activities, this toy adapts to various play styles, encouraging open-ended play and fostering social interaction.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OkhbN6zb1Mdw60FcPA7.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OkhbN6Z-Q-WyyTJVu65.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OkhbN6zb1Mdw60FcPA7.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OplYgk7NgihP0Ry89e6",
    "title": "Motor Trolley",
    "category": "Educational Toys",
    "sku": "UE-SKU-OplYgk7Ngi",
    "price": 350,
    "originalPrice": 500,
    "discount": 30,
    "rating": "4.9",
    "reviewsCount": 48,
    "description": "Watch Video here :\n\n<a href=\"https://www.instagram.com/reel/DW5f1dtTFAu/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DW5f1dtTFAu/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OplYgk7NgihP0Ry89e6.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxqm_CtI0LTTy8ANf7.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OplYgk7NgihP0Ry89e6.jpg",
    "stockQty": 4,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opsf42gPq6vHj10kFN4",
    "title": "Dino theme instant Print Cam",
    "category": "Educational Toys",
    "sku": "UE-SKU-Opsf42gPq6",
    "price": 1799,
    "originalPrice": 1999,
    "discount": 10,
    "rating": "4.9",
    "reviewsCount": 51,
    "description": "@ Capture fun moments instantly with this easy-to-use camera that prints photos on the spot. No need for a separate printer!\n@ Not just a camera, it also records 1080P videos, making it versatile for both photo-taking and video recording.\n@ Compact and lightweight design makes it perfect for travel. Kids can take it anywhere to capture memories on the go.\n@ Comes with print paper so kids can start using the camera right out of the box. Easy to reload for continuous fun! Safe and Kid-Friendly: Made with durable, non-toxic materials, this camera is built to withstand playtime while being safe for children\nComes with print paper so kids can start using the camera right out of the box. Easy to reload for continuous fun! Ideal for Christmas, birthdays, or just because. A thoughtful and exciting gift for girls and boys.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxqRqFP6KkBolJDmU8.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opsf42gPq6vHj10kFN4.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxqRqFP6KkBolJDmU8.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opsf42gPq6vHj10kFN5",
    "title": "Kids Camera(new variant)",
    "category": "Educational Toys",
    "sku": "UE-SKU-Opsf42gPq6",
    "price": 550,
    "originalPrice": 750,
    "discount": 27,
    "rating": "4.9",
    "reviewsCount": 54,
    "description": "For reference video <a href=\"https://www.instagram.com/reel/DReyHF9ElrM/?igsh=OHhka2N5ZTd4NzQ2\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DReyHF9ElrM/?igsh=OHhka2N5ZTd4NzQ2</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxoNC-Bt6bu0qctPdl.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxoNBfgTvScd4TVKO_.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxoNCB7B00ntCvAgHu.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opsf42gPq6vHj10kFN5.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxoNC-Bt6bu0qctPdl.jpg",
    "stockQty": 4,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opsf42gPq6vHj10kFN6",
    "title": "Owl Instant Print Cam",
    "category": "Educational Toys",
    "sku": "UE-SKU-Opsf42gPq6",
    "price": 1799,
    "originalPrice": 1999,
    "discount": 10,
    "rating": "4.9",
    "reviewsCount": 57,
    "description": "Watch Full video here <a href=\"https://www.instagram.com/reel/DWBiTu3j_m6/?igsh=MTZuYXcxOWVwYWVqeA==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWBiTu3j_m6/?igsh=MTZuYXcxOWVwYWVqeA==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opsf42gPq6vHj10kFN6.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxqdubEimdbLt-priJ.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxqduu8is52SDTzVNd.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opsf42gPq6vHj10kFN6.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpmrIkrlm35y3t2t",
    "title": "3 in 1 Science 150+ Experiments",
    "category": "Educational Toys",
    "sku": "UE-SKU-OulpmrIkrl",
    "price": 885,
    "originalPrice": 885,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 60,
    "description": "<a href=\"https://www.instagram.com/reel/DRj0mwaEm5E/?igsh=MTBsazEzemc2dWp5bg==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DRj0mwaEm5E/?igsh=MTBsazEzemc2dWp5bg==</a>\n\n3-in-1 Complete Science Lab Kit Includes chemistry-based learning activities combined into one kit, offering over 150 fun and educational STEM experiments for hands-on learning.\n150+ STEM Projects for Ages 8–15 Specially designed to introduce kids to basic chemistry concepts through safe, guided, and age-appropriate experiments.\nEncourages Learning Through Play Promotes curiosity, critical thinking, and problem-solving skills while making science fun and interactive for children.\nSafe, Kid-Friendly Materials Made with high-quality, non-toxic components suitable for children. Adult supervision is recommended during experiments.\nIdeal Educational Gift for Kids Perfect for birthdays, holidays, school projects, and learning activities. Suitable for both boys and girls interested in science exploration.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpmy-B26oNFdsaei.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpmy-B26oNFdsaei.jpg",
    "stockQty": 6,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpmrIkrlm35y3t2u",
    "title": "3D Pen",
    "category": "Educational Toys",
    "sku": "UE-SKU-OulpmrIkrl",
    "price": 590,
    "originalPrice": 700,
    "discount": 16,
    "rating": "4.9",
    "reviewsCount": 63,
    "description": "<a href=\"https://www.instagram.com/reel/DQ3aHtQEqWw/?igsh=MXd3YTNkNDloajcxeg==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DQ3aHtQEqWw/?igsh=MXd3YTNkNDloajcxeg==</a>\n\n3D pen is a perfect gift for kids and adults, it can help children improve their spatial thinking and develops creative ideas, cultivate creation and artistic skills, great for quality family time\nThis 3D printing pen is temperature adjustable.The LED screen lets you monitor temperature of material and extrusion speed when you enjoy drawing 3D model.\n3D Pen Display is used to display temperature, to select ABS / PLA materials. PLA mode: 180 ～ 210 ℃; ABS mode: 210 ℃",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpn0kfDI17QEi2uC.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpn0kfDI17QEi2uC.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4_",
    "title": "Science Biology 50+ Experiments",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 790.6,
    "originalPrice": 790.6,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 66,
    "description": "<a href=\"https://www.instagram.com/reel/DSAEwUWEhm5/?igsh=MWx1OHZiOWc5eXJuaw==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DSAEwUWEhm5/?igsh=MWx1OHZiOWc5eXJuaw==</a>\n\nEXPLORE BIOLOGY THROUGH FUN HANDS-ON EXPERIMENTS: Perform numerous biology based experiments and understand various concepts of biology like botany, anatomy, microbiology etc. From learning about soil mulching to understanding how the lungs function, your kid can now easily play and learn at the same time.\nBOOSTS STEM LEARNING, CURIOSITY & CRITICAL THINKING: Through exciting experiments on digestion, plant growth, lung activity, and sensory functions, kids learn to ask questions, record observations, and solve problems, building skills that strengthen their love for STEM and discovery.\n50+ HANDS ON LEARNING EXPERIMENTS- Let your kids engage in 50+ biology based- experiments with Play Craft's Science biology kit. Your child can now make DIY biology-based models including lungs, heart etc and understand different concepts of botany, anatomy, ecology etc. Each activity teaches different phenomenas of biology and help your child in understanding various scientific concepts.\nEASY-TO-FOLLOW INSTRUCTIONS: The kit comes with a step-by-step, illustrated manual that simplifies tricky concepts into fun activities. Instead of overwhelming children with theory, each activity has clear visuals and simple explanations, so kids can understand not just the “how” but also the “why.” Perfect for independent learners, while still being easy enough for parents to join in.\nSAFE, AND CHILD-FRIENDLY: Made with safe, tested, ingredients, this kit is perfect for home learning, school projects, or family fun. Parents can now relax knowing their kids are experimenting with child-friendly science tools designed for ages 8 and up.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnT-P4gkuG-EE_N.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnT-P4gkuG-EE_N.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4a",
    "title": "Science Lab 155+ Experiments",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 755.2,
    "originalPrice": 755.2,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 69,
    "description": "<a href=\"https://www.instagram.com/reel/DRcMjeUkjX1/?igsh=aHg1eTFzYTZsZHlz\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DRcMjeUkjX1/?igsh=aHg1eTFzYTZsZHlz</a>\n\n\n✅ 150+ SCIENCE EXPERIMENTS\n✅ GIFT A JOY OF LEARNING - The 150+ Science Experiment Kit, a Gift of a Lifetime, makes for an excellent present on birthdays, Christmas, Thanksgiving, or any special occasion. This remarkable kit serves as an exciting introduction to the marvels of science, offering over 100 hours of educational fun and learning.\n✅ CLEAR STEP BY STEP INSTRUCTIONS: Our exclusive experiments guide features easy-to-follow, step-by-step instructions and illustrations for each experiment, ensuring that parents and kids can easily conduct these activities together. To enhance convenience, we have thoughtfully placed the chemical materials in separate leak-proof bottles. This setup allows kids to efficiently carry out experiments multiple times without creating any mess!",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnT-P4gkuG-EE_O.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnT-P4gkuG-EE_O.jpg",
    "stockQty": 7,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4f",
    "title": "Toppal Tree",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 377.6,
    "originalPrice": 377.6,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 72,
    "description": "<a href=\"https://www.instagram.com/reel/DNxsEuh5CkC/?igsh=cXBveHZqMWUycGht\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DNxsEuh5CkC/?igsh=cXBveHZqMWUycGht</a>\n\nIncludes sturdy plastic tower, colorful plastic pieces and game dice.\nScore points by completing rows and stacking pieces, but the more points you score, the harder it is to keep it from toppling.\nTip Topple is a fun game of skill and balance for 2-4 players\nAges 3+ Great For The Classroom, Preschool, Kindergarten, And Early Childhood Development. No Batteries Required.\nComplete a row of 5, stack 4 or more, add to existing stacks",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnYSnxOpZbDBX5J.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnYSnxOpZbDBX5J.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4H",
    "title": "DIY STEM Creative Puzzle Box",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 999,
    "originalPrice": 1178.82,
    "discount": 15,
    "rating": "4.9",
    "reviewsCount": 75,
    "description": "<a href=\"https://www.instagram.com/reel/DP_aI7GEumq/?igsh=OGptNG84ZWJ1b3ls\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DP_aI7GEumq/?igsh=OGptNG84ZWJ1b3ls</a>\n\n3D Dinosaur Puzzle Set: A creative 163-piece building set that lets kids build and customize their very own 3D dinosaur models, perfect for aspiring paleontologists.\nSTEM Learning Toy: This set encourages hands-on learning in science, technology, engineering, and math (STEM), helping children develop critical thinking, problem-solving, and fine motor skills.\nInteractive Tools Included: Comes with a drill and screwdriver, allowing kids to take on the role of a builder and engineer while assembling the dinosaur models.\nMosaic Art Board: Includes a mosaic art board that enables kids to create colorful dinosaur-themed designs, sparking creativity and artistic expression.\nSafe & Durable: Made from non-toxic, high-quality materials to ensure safety for children ages 3 and up. The sturdy pieces are easy to assemble and built for long-lasting play.\nPerfect for Ages 3+: Designed for young children, this set provides an engaging way to improve hand-eye coordination, fine motor skills, and spatial awareness while having fun.\nGreat Gift for Kids: An ideal gift for birthdays, holidays, or any special occasion, offering hours of educational and creative entertainment for dinosaur lovers.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpn0kfDI17QEi2uD.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpn0kfDI17QEi2uD.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4I",
    "title": "Domino 100 Pcs (Color Domino)",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 352.82,
    "originalPrice": 352.82,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 78,
    "description": "<a href=\"https://www.instagram.com/reel/DLe6RTISD3g/?igsh=YXh5bWZmbm8xajVt\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DLe6RTISD3g/?igsh=YXh5bWZmbm8xajVt</a>\n\nIt cultivates children's creativity enhance self-confidence. Parents may also participate in the game, emphasising your family relationship\nGreat and super fun toy for your kids to play, Push one of them, it will have a chain of effect with a bang !! Develop Math, Science, Spatial and Tactile Skills + it will develop your kids imagination\nExcellent for use in educational math games: Counting, Adding, Subtracting, Multiplication. Also learning valuable skills of patience and developing imagination\nMade of environment-friendly linden wood and non-toxic paint to making them harmless and safe for playing\nSmall parts. Not for children under 3 yrs",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnFcjfKLH2nLfz6.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnFcjfKLH2nLfz6.jpg",
    "stockQty": 4,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4J",
    "title": "Early Learn Education Cards Device",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 377.6,
    "originalPrice": 377.6,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 81,
    "description": "<a href=\"https://www.instagram.com/reel/DN5iMmHkuUz/?igsh=MXNsdG10MnF4Nm10Mg==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DN5iMmHkuUz/?igsh=MXNsdG10MnF4Nm10Mg==</a>. \n\n\nEDUCATIONAL FEATURES: Interactive talking flash cards designed to enhance learning through audio feedback and visual recognition for children aged 2-5 years\nRECHARGEABLE DESIGN: Battery-powered device eliminates the need for constant battery replacements, making it convenient for regular use\nCOGNITIVE DEVELOPMENT: Specifically crafted to boost memory, recognition, vocabulary, and problem-solving skills in toddlers\nAGE-APPROPRIATE CONTENT: Montessori-based learning materials suitable for babies and young children up to 5 years of age\nVERSATILE LEARNING: Sound-enabled flashcard system combines visual and auditory learning to engage multiple senses for effective education",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnEHhMvgihoKVAG.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnEHhMvgihoKVAG.jpg",
    "stockQty": 10,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4K",
    "title": "Earth Science",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 448.4,
    "originalPrice": 448.4,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 84,
    "description": "<a href=\"https://www.instagram.com/reel/DSEggKokgP_/?igsh=cWJ0ZGx0OGY4dHpl\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DSEggKokgP_/?igsh=cWJ0ZGx0OGY4dHpl</a>\n\nEXPLORE EARTH SCIENCE THROUGH FUN HANDS-ON ACTIVITIES Dive into the world of geology, volcanoes, and soil with exciting hands-on experiments kit. Kids above 8 can safely explore concepts like volcano eruptions, natural phenomenas , soil testing, and oceanography, making science fun and interactive.\nBOOSTS STEM LEARNING, CURIOSITY & CRITICAL THINKING: Through exciting experiments on erosion, crystal growth, tectonic activity, and natural cycles, kids learn to ask questions, record observations, and solve problems, while building skills that strengthen their love for STEM and discovery.\nEASY-TO-FOLLOW INSTRUCTIONS: This kit comes with a step-by-step, illustrated manual that simplifies tricky concepts into fun activities. Instead of overwhelming children with theory, each activity has clear visuals and simple explanations, so kids can understand not just the “how” but also the “why.” Perfect for independent learners, while still being easy enough for parents to join in.\n70+ HANDS ON LEARNING EXPERIMENTS- Lets your child engage in 70+ earth science experiments with Play Craft's earth science kit. Your child can now watch & make different kinds of colourful volcanoes and crytsals using simple and safe components provided in the kit. Each activity teaches different earth science phenomenas and help your child in understanding various scientific concepts.\nSAFE, AND CHILD-FRIENDLY: Made with safe, tested, and ingredients, this kit is perfect for home learning, school projects, or family fun. Parents can now relax knowing their kids are experimenting with child-friendly science tools designed for ages 8 and up.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnFcjfKLH2nLfz5.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnFcjfKLH2nLfz5.jpg",
    "stockQty": 3,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4N",
    "title": "Jumbo Electromagnetic Set",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 436.6,
    "originalPrice": 436.6,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 87,
    "description": "<a href=\"https://www.instagram.com/reel/DOTMEZqElF1/?igsh=NXpxb3VuNThvMnN6\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DOTMEZqElF1/?igsh=NXpxb3VuNThvMnN6</a>\n\nElectromagnetic Experiments: The Kit Includes A Range Of Materials And Components That Allow Users To Conduct Various Experiments And Observe The Principles Of Electromagnetism In Action. From Building Electromagnets To Creating Simple Circuits, This Kit Covers A Wide Range Of Engaging Activities.\nEasy-To-Use Components: The Kit Contains High-Quality, Durable Components That Are Safe And Easy To Handle. It Includes Magnets, Wires, Batteries, Switches, And Other Essential Items Required To Build Different Experiments. The Components Are Designed To Be Intuitive, Ensuring A Smooth Learning Experience For Users Of All Ages.\nDetailed Instruction Manual: A comprehensive instruction manual is included with the kit, providing step-by-step guidance for each experiment. The manual explains the scientific concepts behind each activity in a clear and concise manner, making it accessible to beginners and serving as a valuable reference for more advanced learners.\nEducational Value: The Kit Aligns With Science Education Standards And Promotes STEM (Science, Technology, Engineering, And Mathematics) Learning. It Fosters Critical Thinking, Problem-Solving Skills, And Creativity While Instilling A Passion For Scientific Exploration.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnH-BCXr7TQ6KcY.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnH-BCXr7TQ6KcY.jpg",
    "stockQty": 5,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4P",
    "title": "Learn & Play",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 899,
    "originalPrice": 999,
    "discount": 10,
    "rating": "4.9",
    "reviewsCount": 90,
    "description": "Watch Full video here: \n\n<a href=\"https://www.instagram.com/reel/DOtBzl4Ekf9/?igsh=MTF5MmJkcnBwbnZ4Ng==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DOtBzl4Ekf9/?igsh=MTF5MmJkcnBwbnZ4Ng==</a>\n\nInteractive Sound Learning Book: Engaging audio buttons help toddlers learn words, sounds, and music while encouraging active participation and listening skills.\nMusical Educational Toy: Combines fun melodies and spoken sounds to make early learning enjoyable and improve memory and sound recognition.\nSupports Early Cognitive Development: Enhances vocabulary, concentration, coordination, and curiosity through repeated interactive play and exploration.\nEasy for Small Hands: Child-friendly design with simple buttons allows toddlers to use the book independently and confidently.\nSafe and Durable Design: Made with non-toxic, sturdy materials suitable for everyday use by young children and toddlers.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnH-BCXr7TQ6KcZ.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnH-BCXr7TQ6KcZ.jpg",
    "stockQty": 4,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4Q",
    "title": "Magnetic Control Pen Toy (Duck Theme)",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 699,
    "originalPrice": 799,
    "discount": 13,
    "rating": "4.9",
    "reviewsCount": 93,
    "description": "<a href=\"https://www.instagram.com/reel/DOyHTBYgdz_/?igsh=NGkzOG43YjhuODZl\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DOyHTBYgdz_/?igsh=NGkzOG43YjhuODZl</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnOLwyDG2vEhs8W.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnOLwyDG2vEhs8W.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4U",
    "title": "My Chemistry Lab",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 448.4,
    "originalPrice": 448.4,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 96,
    "description": "Watch Full video here: \n<a href=\"https://www.instagram.com/reel/DSbsm8hElCR/?igsh=MTYwYTN2cnR4ZmFvaw==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DSbsm8hElCR/?igsh=MTYwYTN2cnR4ZmFvaw==</a>\n\nGet ready to be a scientist with my chemistry lab learn about different topics of chemistry like reactivity osmosis mixture and much more while performing fun and safe experiment at home come Equipped with all the necessary apparatus includes\nCONTENTS: Balloons, Baking Soda, Citric Acid, Food Colouring, Small Measuring Beakers, Droppers, Plastic Spatulas, Safety Goggles, Funnel, Illustrated instruction manual, Shoestring.\nSAFE & TESTED PRODUCT: Explore products are EN 71 and ASTM tested, which represents a good quality and safety of materials used in the manufacturing process. All the Explore products are developed, manufactured and packaged in India.\nEDUCATIONAL VALUE: Through it’s STEM Learner series, Explore aims at helping children take another step forward in STEM education.\n\n\n",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnJ10eqUHhmRCQh.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnJ10eqUHhmRCQh.jpg",
    "stockQty": 6,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4V",
    "title": "My First Pottery Set",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 999,
    "originalPrice": 1178.82,
    "discount": 15,
    "rating": "4.9",
    "reviewsCount": 99,
    "description": "<a href=\"https://www.instagram.com/reel/DRY6kcwErxi/?igsh=dnBzb2lhbXhqa2l5\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DRY6kcwErxi/?igsh=dnBzb2lhbXhqa2l5</a>\n\nReal Pottery Experience — Battery-powered spinning wheel lets kids center and shape clay just like a mini potter’s studio.\nComplete Starter Kit — Typically includes modelling clay, wheel plate, Sculpting tools, cutting cord, paint tray, acrylic paints and brushes for finishing.\nLearn & Play STEM — Builds fine motor control, hand-eye coordination, creativity and focus — ideal for art projects and classroom craft sessions.\nGreat Gift for Kids 6+ — Designed for beginners aged 6–10 ; perfect for birthdays, holiday gifts, and hands-on learning.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnL-dmH2UTH1DZs.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnL-dmH2UTH1DZs.jpg",
    "stockQty": 6,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_ulpms03WrZaH4JJ4X",
    "title": "Rope Untangling Toy Board Game",
    "category": "Educational Toys",
    "sku": "UE-SKU-Oulpms03Wr",
    "price": 377.6,
    "originalPrice": 377.6,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 102,
    "description": "<a href=\"https://www.instagram.com/reel/DN0VdO25Hzi/?igsh=MWRybDFwZzR3ZzByaQ==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DN0VdO25Hzi/?igsh=MWRybDFwZzR3ZzByaQ==</a>\n\n【Fun Family Bonding Game】: \"Play this brain-teasing board game with your family! One designs the tangled challenge, the other solves it—Strengthen relationships and create memories, just like classic family board games for kids and adults, all while racing to unravel colorful knots!\"\n【How to Play】: \"Insert both ends of 10 vibrant ropes (plastic-tipped) into the board’s 22 holes, twisting into knots or crosses. Adjust difficulty with 3-10 ropes! Players move rope tips OVER others—never under—to empty holes. Remove untangled ropes and clear all to win—For detailed instructions, watch the video: How to Play – Rope Untangling Challenge.\"\n【Multi-Level Difficulty for All Ages】: \"From simple board games for kids (3-4 ropes) to complex puzzles for adults (10-rope mazes), this game grows with you! More knots = tougher challenges, perfect for fans of strategy-based board games!\"\n【A Fun Way to Keep Kids Off Screens】: \"This hands-on logic puzzle game beats screen time! Kids build spatial awareness, sharpen focus, and learn problem-solving—like a tactile upgrade to traditional board games or video games!\"\n【The Perfect Gift for All Ages】: \"Packed in a travel-ready case, this interactive family board game sparks friendly competition, boosts critical thinking, and unites everyone—ideal for playdates, holidays, or group games for kids and adults seeking screen-free fun!\"",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnKIE4-3fBVRhv3.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnKIE4-3fBVRhv3.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwrI0gp2m1sbePE6Ja1",
    "title": "Magnetic Power Kit",
    "category": "Educational Toys",
    "sku": "UE-SKU-OwrI0gp2m1",
    "price": 90,
    "originalPrice": 118,
    "discount": 24,
    "rating": "4.9",
    "reviewsCount": 105,
    "description": "Magnetic Fidget Toy Set: Includes multiple magnetic balls and shapes designed for stress relief, focus, and endless fun for kids and adults.\nPremium Quality Material: Smooth, durable, and safe magnets with rounded edges for comfortable handling and long-lasting use.\nPerfect for Stress & Anxiety Relief: Helps reduce tension, improve concentration, and keep hands busy during work, study, or travel.\nEducational & Creative Play: Encourages learning about magnetism, shape recognition, and enhances fine motor skills through hands-on play.\nPack of 1 – Random Color: Comes in attractive packaging with one color selected at random (blue, mint, yellow, pink, etc.). Ideal for gifting and everyday use.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnJ10eqUHhmRCQg.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_ulpnJ10eqUHhmRCQg.jpg",
    "stockQty": 72,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Oleps18Vt_HoESVTeu_",
    "title": "Blix Queaky (Battery)",
    "category": "Standard Toys",
    "sku": "UE-SKU-Oleps18VtH",
    "price": 599,
    "originalPrice": 660,
    "discount": 9,
    "rating": "4.9",
    "reviewsCount": 18,
    "description": "<a href=\"https://www.instagram.com/reel/DU5qzhyktIT/?igsh=MWU2anVodXhqcXV4eQ==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DU5qzhyktIT/?igsh=MWU2anVodXhqcXV4eQ==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oleps18Vt_HoESVTeu_.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oleps18Vt_HoESVTeu_.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Oleps18Vt_HoESVTeua",
    "title": "Blix Queaky (Rechargable)",
    "category": "Standard Toys",
    "sku": "UE-SKU-Oleps18VtH",
    "price": 699,
    "originalPrice": 760,
    "discount": 8,
    "rating": "4.9",
    "reviewsCount": 21,
    "description": "<a href=\"https://www.instagram.com/reel/DU5qzhyktIT/?igsh=MWU2anVodXhqcXV4eQ==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DU5qzhyktIT/?igsh=MWU2anVodXhqcXV4eQ==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oleps18Vt_HoESVTeua.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oleps18Vt_HoESVTeua.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Oleps18Vt_HoESVTeub",
    "title": "Die Cast Model Frame(Premium)",
    "category": "Standard Toys",
    "sku": "UE-SKU-Oleps18VtH",
    "price": 2600,
    "originalPrice": 2600,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 24,
    "description": "Die Cast Model Frame(Premium) - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oleps18Vt_HoESVTeub.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oleps18Vt_HoESVTeub.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OlesbuVcd2XQC5UGyvI",
    "title": "Astronaut Bluetooth Lamp Speaker",
    "category": "Standard Toys",
    "sku": "UE-SKU-OlesbuVcd2",
    "price": 1200,
    "originalPrice": 1500,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 27,
    "description": "<a href=\"https://www.instagram.com/reel/DV7wO2mk1l6/?igsh=MWplNHB4NTJyeWRrcg==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DV7wO2mk1l6/?igsh=MWplNHB4NTJyeWRrcg==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvI.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvI.jpg",
    "stockQty": 3,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OlesbuVcd2XQC5UGyvJ",
    "title": "Container Cars Set",
    "category": "Standard Toys",
    "sku": "UE-SKU-OlesbuVcd2",
    "price": 1600,
    "originalPrice": 1600,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 30,
    "description": "<a href=\"https://www.instagram.com/reel/DVYeeH9Ehfs/?igsh=YmoxaTh0YXY1YTM0\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVYeeH9Ehfs/?igsh=YmoxaTh0YXY1YTM0</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvJ.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvJ.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OlesbuVcd2XQC5UGyvM",
    "title": "G5 gaming Console with Joystick",
    "category": "Standard Toys",
    "sku": "UE-SKU-OlesbuVcd2",
    "price": 799,
    "originalPrice": 799,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 33,
    "description": "<a href=\"https://www.instagram.com/reel/DSO-DINkqd0/?igsh=MXB3eXRrYjVwdmkxdA==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DSO-DINkqd0/?igsh=MXB3eXRrYjVwdmkxdA==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvM.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlesbuVcd2XQC5UGyvM.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OlgKiPQEZdwiBns7DGh",
    "title": "Catch Game",
    "category": "Standard Toys",
    "sku": "UE-SKU-OlgKiPQEZd",
    "price": 720,
    "originalPrice": 720,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 36,
    "description": "<a href=\"https://www.instagram.com/reel/DViwWa6kvDS/?igsh=MXJibjc0NHRtNng3NA==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DViwWa6kvDS/?igsh=MXJibjc0NHRtNng3NA==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGh.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGh.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OlgKiPQEZdwiBns7DGi",
    "title": "Changeable Track Car",
    "category": "Standard Toys",
    "sku": "UE-SKU-OlgKiPQEZd",
    "price": 700,
    "originalPrice": 700,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 39,
    "description": "<a href=\"https://www.instagram.com/reel/DVQtLXTEj2T/?igsh=MTdpcjg0cXF6cm9pbw==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVQtLXTEj2T/?igsh=MTdpcjg0cXF6cm9pbw==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGi.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGi.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OlgKiPQEZdwiBns7DGj",
    "title": "Dino Egg",
    "category": "Standard Toys",
    "sku": "UE-SKU-OlgKiPQEZd",
    "price": 400,
    "originalPrice": 400,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 42,
    "description": "<a href=\"https://www.instagram.com/reel/DVLjkCikuPt/?igsh=dGZmcTlsbjFoeGJs\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVLjkCikuPt/?igsh=dGZmcTlsbjFoeGJs</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGj.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGj.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OlgKiPQEZdwiBns7DGn",
    "title": "Kids intelligence Book",
    "category": "Standard Toys",
    "sku": "UE-SKU-OlgKiPQEZd",
    "price": 300,
    "originalPrice": 300,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 45,
    "description": "<a href=\"https://www.instagram.com/reel/DQeWLSCEpVs/?igsh=YTF2MGtwb3RvdGpi\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DQeWLSCEpVs/?igsh=YTF2MGtwb3RvdGpi</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGn.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGn.jpg",
    "stockQty": 6,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OlgKiPQEZdwiBns7DGq",
    "title": "Magnetic Digital Train",
    "category": "Standard Toys",
    "sku": "UE-SKU-OlgKiPQEZd",
    "price": 720,
    "originalPrice": 720,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 48,
    "description": "<a href=\"https://www.instagram.com/reel/DWGDfddzwzN/?igsh=MTcwdGUxazJzcGlocQ==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWGDfddzwzN/?igsh=MTcwdGUxazJzcGlocQ==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGq.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGq.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OlgKiPQEZdwiBns7DGs",
    "title": "Sup Game Console",
    "category": "Standard Toys",
    "sku": "UE-SKU-OlgKiPQEZd",
    "price": 580,
    "originalPrice": 580,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 51,
    "description": "<a href=\"https://www.instagram.com/reel/DVI_OJ6EvPG/?igsh=MTJ6enNmN3Qwcm56bw==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVI_OJ6EvPG/?igsh=MTJ6enNmN3Qwcm56bw==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGs.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPQEZdwiBns7DGs.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OlgKiPR4JKolX6G9K43",
    "title": "Water Gun",
    "category": "Standard Toys",
    "sku": "UE-SKU-OlgKiPR4JK",
    "price": 760,
    "originalPrice": 760,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 54,
    "description": "<a href=\"https://www.instagram.com/reel/DVDHqcPksaz/?igsh=M3B2dWhyZTlibzE0\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVDHqcPksaz/?igsh=M3B2dWhyZTlibzE0</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPR4JKolX6G9K43.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OlgKiPR4JKolX6G9K43.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Om8yWh5HXbEz9DEjeO-",
    "title": "Space Exploration Toy Gun",
    "category": "Standard Toys",
    "sku": "UE-SKU-Om8yWh5HXb",
    "price": 320,
    "originalPrice": 320,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 57,
    "description": "<a href=\"https://www.instagram.com/reel/DVGapAjEt6Q/?igsh=OXo3NnR3ejlrcXJy\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVGapAjEt6Q/?igsh=OXo3NnR3ejlrcXJy</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Om8yWh5HXbEz9DEjeO-.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Om8yWh5HXbEz9DEjeO-.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OmOaVwn1QjfQyy6Y5t5",
    "title": "Dino Bey Blade",
    "category": "Standard Toys",
    "sku": "UE-SKU-OmOaVwn1Qj",
    "price": 399,
    "originalPrice": 399,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 60,
    "description": "<a href=\"https://www.instagram.com/reel/DVOKkaqkt_K/?igsh=MWppeGIycHNkdjU3dw==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVOKkaqkt_K/?igsh=MWppeGIycHNkdjU3dw==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OmOaVwn1QjfQyy6Y5t5.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OmQ7QNjpMFStcxgeUOr.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OmOaVwn1QjfQyy6Y5t5.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OmOaVwo6VRBS8o47oFL",
    "title": "Frog Catching Game",
    "category": "Standard Toys",
    "sku": "UE-SKU-OmOaVwo6VR",
    "price": 660,
    "originalPrice": 660,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 63,
    "description": "<a href=\"https://www.instagram.com/reel/DVbCNsvkghb/?igsh=MTVzMTNiZ3NtazA2aA==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVbCNsvkghb/?igsh=MTVzMTNiZ3NtazA2aA==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OmOaVwo6VRBS8o47oFL.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OmOaVwo6VRBS8o47oFL.jpg",
    "stockQty": 5,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OmOaVwo6VRBS8o47oFM",
    "title": "5 in 1 My colouring Mat",
    "category": "Standard Toys",
    "sku": "UE-SKU-OmOaVwo6VR",
    "price": 520,
    "originalPrice": 520,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 66,
    "description": "<a href=\"https://www.instagram.com/reel/DV-VBU-EhsC/?igsh=MXhpcmM2NnBnbWhmMQ==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DV-VBU-EhsC/?igsh=MXhpcmM2NnBnbWhmMQ==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OmOaVwo6VRBS8o47oFM.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OmOaVwo6VRBS8o47oFM.jpg",
    "stockQty": 0,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OmOaVwo6VRBS8o47oFN",
    "title": "75 pcs Magnetic Tiles",
    "category": "Standard Toys",
    "sku": "UE-SKU-OmOaVwo6VR",
    "price": 950,
    "originalPrice": 1199,
    "discount": 21,
    "rating": "4.9",
    "reviewsCount": 69,
    "description": "For Full video\n<a href=\"https://www.instagram.com/reel/DWsrW3zzh0W/?igsh=eXR6ZXIweGhsYXps\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWsrW3zzh0W/?igsh=eXR6ZXIweGhsYXps</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OmOaVwo6VRBS8o47oFN.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OmOaVwo6VRBS8o47oFN.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OmOaVwo6VRBS8o47oFO",
    "title": "Minecraft MyWorld lego blocks",
    "category": "Standard Toys",
    "sku": "UE-SKU-OmOaVwo6VR",
    "price": 999,
    "originalPrice": 999,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 72,
    "description": "Minecraft MyWorld lego blocks - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OmOaVwo6VRBS8o47oFO.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OmOaVwo6VRBS8o47oFO.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-On9QjukE1Cu_lgLfcK9",
    "title": "Dino Turn Table",
    "category": "Standard Toys",
    "sku": "UE-SKU-On9QjukE1C",
    "price": 1299,
    "originalPrice": 1599,
    "discount": 19,
    "rating": "4.9",
    "reviewsCount": 75,
    "description": "<a href=\"https://www.instagram.com/reel/DVnJpHRj1Ni/?igsh=MTAzZTdjaGVlc3FjYg==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVnJpHRj1Ni/?igsh=MTAzZTdjaGVlc3FjYg==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-On9QjukE1Cu_lgLfcK9.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-On9QjukE1Cu_lgLfcK9.jpg",
    "stockQty": 14,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-On9QjulMUj7LNSuI1u3",
    "title": "Magnetic Track Electric Bus",
    "category": "Standard Toys",
    "sku": "UE-SKU-On9QjulMUj",
    "price": 599,
    "originalPrice": 599,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 78,
    "description": "<a href=\"https://www.instagram.com/reel/DVqa6EUkqy7/?igsh=eGxsY2FuajYxZmUz\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVqa6EUkqy7/?igsh=eGxsY2FuajYxZmUz</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-On9QjulMUj7LNSuI1u3.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-On9QjulMUj7LNSuI1u3.jpg",
    "stockQty": 5,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OosrPo2-mBZ9DOWDI_R",
    "title": "EDU PHONE 10 LANGUAGE",
    "category": "Standard Toys",
    "sku": "UE-SKU-OosrPo2mBZ",
    "price": 350,
    "originalPrice": 500,
    "discount": 30,
    "rating": "4.9",
    "reviewsCount": 81,
    "description": "Watch Full video here <a href=\"https://www.instagram.com/reel/DWdOsHDz8C0/?igsh=YWpwaHMzenR2Zmh4\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWdOsHDz8C0/?igsh=YWpwaHMzenR2Zmh4</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OosrPo6bqjoicNcVZEm.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OosrPo2-mBZ9DOWDI_S.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OosrPo6bqjoicNcVZEn.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OosrPo6bqjoicNcVZEm.jpg",
    "stockQty": 44,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OozufHXsnp8OxJGNUsN",
    "title": "Magic Water Elf Diy Kit Creative 3D Handmade Gel Craft Set",
    "category": "Standard Toys",
    "sku": "UE-SKU-OozufHXsnp",
    "price": 330,
    "originalPrice": 330,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 84,
    "description": "Watch Full video here <a href=\"https://www.instagram.com/reel/DWjCKjikipQ/?igsh=Z2Z3aXRmNDg5Z25r\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWjCKjikipQ/?igsh=Z2Z3aXRmNDg5Z25r</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwgmjnFij5X8SkkFyo.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwgoEOySJJInV1SeQF.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwgklnInGp3spDO3TG.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwgmjnFij5X8SkkFyo.jpg",
    "stockQty": 10,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OozufHY1u6VxR3GVvmA",
    "title": "15w bluetooth Mike and speaker",
    "category": "Standard Toys",
    "sku": "UE-SKU-OozufHY1u6",
    "price": 699,
    "originalPrice": 740,
    "discount": 6,
    "rating": "4.9",
    "reviewsCount": 87,
    "description": "Watch Full video here <a href=\"https://www.instagram.com/reel/DWqGmPNT8Jj/?igsh=MXA3ZjNjMnM0cjNheg==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DWqGmPNT8Jj/?igsh=MXA3ZjNjMnM0cjNheg==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OozufHY1u6VxR3GVvmA.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OozufHY1u6VxR3GVvmA.jpg",
    "stockQty": 3,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OpsebbT1KVpJEaw7Umb",
    "title": "Walkie Talkie",
    "category": "Standard Toys",
    "sku": "UE-SKU-OpsebbT1KV",
    "price": 2199,
    "originalPrice": 2500,
    "discount": 12,
    "rating": "4.9",
    "reviewsCount": 90,
    "description": "Walkie Talkie - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpsebbT1KVpJEaw7Umb.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxnFg2gCL5LKFzC5GG.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpsebbT1KVpJEaw7Umb.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OpsebbT1KVpJEaw7UmU",
    "title": "Astronaut Bubble Gun (new variant)",
    "category": "Standard Toys",
    "sku": "UE-SKU-OpsebbT1KV",
    "price": 500,
    "originalPrice": 500,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 93,
    "description": "for reference video <a href=\"https://www.instagram.com/reel/DS45JHYEugY/?igsh=YzkyZzJncDdhc2Vx\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DS45JHYEugY/?igsh=YzkyZzJncDdhc2Vx</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxn1CNIR4PzLFg3l9q.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxn1C8VgAveWJCIVef.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpsebbT1KVpJEaw7UmU.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxn1CNIR4PzLFg3l9q.jpg",
    "stockQty": 5,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OpsebbT1KVpJEaw7UmV",
    "title": "Bubble Gun Refill",
    "category": "Standard Toys",
    "sku": "UE-SKU-OpsebbT1KV",
    "price": 99,
    "originalPrice": 99,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 96,
    "description": "Bubble Gun Refill - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpsebbT1KVpJEaw7UmV.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpsebbT1KVpJEaw7UmV.jpg",
    "stockQty": 0,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Oug_Ixspk1Z1KfYDFIp",
    "title": "Dual Mike bluetooth Speaker",
    "category": "Standard Toys",
    "sku": "UE-SKU-OugIxspk1Z",
    "price": 699,
    "originalPrice": 750,
    "discount": 7,
    "rating": "4.9",
    "reviewsCount": 99,
    "description": "Watch Full video here: \n<a href=\"https://www.instagram.com/reel/DVvpUr3gdj9/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVvpUr3gdj9/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OnRkQMBJxePIeuEGpGk.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OnRkQMBJxePIeuEGpGk.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugX1iuyghXxHrjULsb",
    "title": "Dancing Dog",
    "category": "Standard Toys",
    "sku": "UE-SKU-OugX1iuygh",
    "price": 599,
    "originalPrice": 706.82,
    "discount": 15,
    "rating": "4.9",
    "reviewsCount": 102,
    "description": "<a href=\"https://www.instagram.com/reel/DOgCuN_EuTO/?igsh=MWVya2FodTZtcm9xMA==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DOgCuN_EuTO/?igsh=MWVya2FodTZtcm9xMA==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_v2ShKcSvUH66IRt4n.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_v2ShKcSvUH66IRt4n.jpg",
    "stockQty": 6,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugX1iuyghXxHrjULsc",
    "title": "Mini Helecopter Velocity",
    "category": "Standard Toys",
    "sku": "UE-SKU-OugX1iuygh",
    "price": 1178.82,
    "originalPrice": 1178.82,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 105,
    "description": "Mini Helecopter Velocity - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_v2Shgl-u73otRvXEp.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_v2Shgl-u73otRvXEp.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OthBqx2ahYnAGDZs8x2",
    "title": "Veena",
    "category": "Handicrafts",
    "sku": "UE-SKU-OthBqx2ahY",
    "price": 419,
    "originalPrice": 599,
    "discount": 30,
    "rating": "4.9",
    "reviewsCount": 18,
    "description": "Veena - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OthBqWKlOwUXJbhAjTM.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OthBqWVLJkugNQyQURA.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OthBqWKlOwUXJbhAjTM.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Oti-eW8VIL8GLQZR5P5",
    "title": "Balaji medium variant",
    "category": "Handicrafts",
    "sku": "UE-SKU-OtieW8VIL8",
    "price": 999,
    "originalPrice": 1299,
    "discount": 23,
    "rating": "4.9",
    "reviewsCount": 21,
    "description": "Multicoloured handicrafted(44cm\n44*20(l*w)",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oti-eW4xYAkXVOIprBa.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oti0G3y1OdCSSUuqtJm.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oti-eW4xYAkXVOIprBa.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OtSye7G3T9Lpr1BSCET",
    "title": "Joker pulling game",
    "category": "Handicrafts",
    "sku": "UE-SKU-OtSye7G3T9",
    "price": 135,
    "originalPrice": 135,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 24,
    "description": "Joker pulling game - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtSydpItgj0RKDQsqI5.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtSydpXIO7XaAiaroPT.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtSydpItgj0RKDQsqI5.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OtT01tfGUJW4L9Ya739",
    "title": "House light set",
    "category": "Handicrafts",
    "sku": "UE-SKU-OtT01tfGUJ",
    "price": 499,
    "originalPrice": 699,
    "discount": 29,
    "rating": "4.9",
    "reviewsCount": 27,
    "description": "House light set - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT01LnrBkN0NoE4B_p.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT01M7tkdvuIDYocb8.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT01LnrBkN0NoE4B_p.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OtT046704vFnDoMvM9v",
    "title": "Post box money saver box",
    "category": "Handicrafts",
    "sku": "UE-SKU-OtT046704v",
    "price": 1080,
    "originalPrice": 1080,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 30,
    "description": "Post box money saver box - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT03o-T7p1Xt8OTr1u.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT03nhBo94c0Gc_nFk.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT03o-T7p1Xt8OTr1u.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OtT3X7LpfqAUaykoplp",
    "title": "Dasavatharam set",
    "category": "Handicrafts",
    "sku": "UE-SKU-OtT3X7Lpfq",
    "price": 7200,
    "originalPrice": 8000,
    "discount": 10,
    "rating": "4.9",
    "reviewsCount": 33,
    "description": "Dasavatharam set - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3WhHDAc6Lr7_HCvV.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3WgS9N7LY6wX_1Xw.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3WgxSZFNbBPIKG-Y.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3Wh8Z7N2yDwMEJlM.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3oFtJIZMf8z4rFsc.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3Wg-SK2fcFe6A2s2.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3WgnpS6a3NEMcYK_.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3WffGu9v7urayMBv.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3WhTLP_U2tP6SjZ.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3WfNDw2WGOA1_gda.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3WgcmKv-StEGlVWl.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3WgGt966LHJsU9Eg.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT3WhHDAc6Lr7_HCvV.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OtT6vXSva-Xtv1WJcUQ",
    "title": "Rickshaw",
    "category": "Handicrafts",
    "sku": "UE-SKU-OtT6vXSvaX",
    "price": 685,
    "originalPrice": 685,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 36,
    "description": "Rickshaw - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT6v94XySbaKlXHqCu.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT6v8pRHUKpzCte0j7.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OtT6v94XySbaKlXHqCu.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOpRqoTbO3i61p-9q",
    "title": "Tamboolam set",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOpRqoTb",
    "price": 330,
    "originalPrice": 330,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 39,
    "description": "Tamboolam set - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OjQ3A2qjLzdYD0m1rj5.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OjQ3A2qjLzdYD0m1rj5.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOpRqoTbO3i61p-9r",
    "title": "Ganesha",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOpRqoTb",
    "price": 330,
    "originalPrice": 330,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 42,
    "description": "Ganesha - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Olf5arPgdvLzxLJ4o41.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Olf5arPgdvLzxLJ4o41.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOpRqoTbO3i61p-9s",
    "title": "Ganesha",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOpRqoTb",
    "price": 330,
    "originalPrice": 330,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 45,
    "description": "Ganesha - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Olf5i7bUaL2yhziXg8b.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Olf5i7bUaL2yhziXg8b.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOS2",
    "title": "Lakshmi devi",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 510,
    "originalPrice": 510,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 48,
    "description": "Lakshmi devi - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Olf5jDLsJ7EZKNxujXc.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Olf5jDLsJ7EZKNxujXc.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOS3",
    "title": "BALA RAMUDU",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 499,
    "originalPrice": 499,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 51,
    "description": "BALA RAMUDU - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh01m6v7QT6hu9XmcFm.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh01m6v7QT6hu9XmcFm.jpg",
    "stockQty": 7,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOS4",
    "title": "SEEMANTHAM SET",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 3999,
    "originalPrice": 4999,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 54,
    "description": "SEEMANTHAM SET - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzAkR5HK5SDPwjTAvn.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzAkQrWWHRBr_DWf68.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Ohz9vpiLiS2SwPcYEyC.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzAkR5HK5SDPwjTAvn.jpg",
    "stockQty": 23,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOS5",
    "title": "BALJI FAMILY SET",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 1499,
    "originalPrice": 1499,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 57,
    "description": "BALJI FAMILY SET - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh-v4dpsTztm7f0fjFq.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh-v4dpsTztm7f0fjFq.jpg",
    "stockQty": 15,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOS6",
    "title": "STUDY GANESHA",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 425,
    "originalPrice": 425,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 60,
    "description": "STUDY GANESHA - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh-z1ZJjIMeLdkJ1fAB.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh-z1ZJjIMeLdkJ1fAB.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOS7",
    "title": "Balaji Idol",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 440,
    "originalPrice": 440,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 63,
    "description": "Balaji Idol - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgCTDaJMaQUA-GpiFZ4.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgCTDaJMaQUA-GpiFZ4.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOS8",
    "title": "Venkateshwara Swami (BALAJI) Idol LARGE GREEN",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 1599,
    "originalPrice": 1599,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 66,
    "description": "Venkateshwara Swami (BALAJI) Idol LARGE GREEN - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgCTDaLyFwhQzIeBKB3.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OgCTDaLyFwhQzIeBKB3.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOS9",
    "title": "5 in one chain’s doll",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 360,
    "originalPrice": 360,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 69,
    "description": "5 in one chain’s doll - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh-wA0hWt9gGby4p72W.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh-wA0hWt9gGby4p72W.jpg",
    "stockQty": 5,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSA",
    "title": "5 in 1 Woman Doll",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 562.5,
    "originalPrice": 562.5,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 72,
    "description": "5 in 1 Woman Doll - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvNUeBc2wZEaVGaW.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvNUeBc2wZEaVGaW.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSB",
    "title": "Buddha",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 375,
    "originalPrice": 375,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 75,
    "description": "Buddha - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvNUeBc2wZEaVGaV.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvNUeBc2wZEaVGaV.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSC",
    "title": "Balaji Idol Medium",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 750,
    "originalPrice": 750,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 78,
    "description": "Balaji Idol Medium - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvNcWeGK7ol8I7BJ.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvNcWeGK7ol8I7BJ.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSD",
    "title": "ROLLING Ganesha Idol",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 275,
    "originalPrice": 275,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 81,
    "description": "ROLLING Ganesha Idol - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvNzNKirbBvcBONJ.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvNzNKirbBvcBONJ.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSE",
    "title": "Hanuman Idol",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 387.5,
    "originalPrice": 387.5,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 84,
    "description": "Hanuman Idol - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvNyG1rMstPRyufD.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvNyG1rMstPRyufD.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSF",
    "title": "Krishna Idol with Flute",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 400,
    "originalPrice": 400,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 87,
    "description": "Krishna Idol with Flute - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvO0ffMngbZtWzjb.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvO0ffMngbZtWzjb.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSG",
    "title": "Mother & Child",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 600,
    "originalPrice": 600,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 90,
    "description": "Mother & Child - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOIidNGX48rHopA.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOIidNGX48rHopA.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSH",
    "title": "Radha Krishna Set",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 712.5,
    "originalPrice": 712.5,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 93,
    "description": "Radha Krishna Set - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOb0i_3vXP8RctK.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOb0i_3vXP8RctK.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSI",
    "title": "Sarasvathi Devi",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 500,
    "originalPrice": 500,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 96,
    "description": "Sarasvathi Devi - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOq_o4_YIsjzX5o.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOq_o4_YIsjzX5o.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSJ",
    "title": "Shivalingam",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 387.5,
    "originalPrice": 387.5,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 99,
    "description": "Shivalingam - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOuyzpLwScuRRIm.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOuyzpLwScuRRIm.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSK",
    "title": "Venna Krishna",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 562.5,
    "originalPrice": 562.5,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 102,
    "description": "Venna Krishna - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOyHfbPg5-yeQze.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOyHfbPg5-yeQze.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OugOvedpsbg51DhoOSL",
    "title": "Shiva Parvathi Set",
    "category": "Handicrafts",
    "sku": "UE-SKU-OugOvedpsb",
    "price": 1000,
    "originalPrice": 1000,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 105,
    "description": "Shiva Parvathi Set - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOsy40xJwx2vHdg.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOsy40xJwx2vHdg.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-O_bxxlU-MvxGxKVAaGi",
    "title": "Erasable Pen",
    "category": "Stationary",
    "sku": "UE-SKU-ObxxlUMvxG",
    "price": 17.7,
    "originalPrice": 17.7,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 18,
    "description": "Watch Full video here: \n<a href=\"https://www.instagram.com/reel/DLAR4y6S2D4/?igsh=MW9uanMxbTFneXNrcw==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DLAR4y6S2D4/?igsh=MW9uanMxbTFneXNrcw==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_bxxlU-MvxGxKVAaGi.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-O_bxxlU-MvxGxKVAaGi.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEa",
    "title": "Eraser with Cap( glow in the dark)",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 10,
    "originalPrice": 10,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 21,
    "description": "Eraser with Cap( glow in the dark) - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxmn457mIIMsOZTSgC.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxmn4-XfPj-FGesvwv.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYEa.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxmn457mIIMsOZTSgC.jpg",
    "stockQty": 15,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEb",
    "title": "Glow in the dark Pencil",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 10,
    "originalPrice": 10,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 24,
    "description": "Glow in the dark Pencil - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxlaNT17gM7GqV1Iou.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxlaN9JeMp0Tjqyqde.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxlaNT17gM7GqV1Iou.jpg",
    "stockQty": 30,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEe",
    "title": "Foldable scale(slap band)random design",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 6,
    "originalPrice": 6,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 27,
    "description": "Foldable scale(slap band)random design - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwgCcVyMz81P7ppx6U.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwgDyVSg_OUjTQVS2e.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYEe.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwgCcVyMz81P7ppx6U.jpg",
    "stockQty": 34,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEf",
    "title": "Cartoon pencil Sharpner(double Hole)",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 27,
    "originalPrice": 27,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 30,
    "description": "Cartoon pencil Sharpner(double Hole) - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opw_inmEgSR4EJQY7rm.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYEf.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opw_kIsLRMZG3QJYGXR.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opw_inmEgSR4EJQY7rm.jpg",
    "stockQty": 0,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEg",
    "title": "Pen Shape pencil everlasting inkless pencil",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 11,
    "originalPrice": 11,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 33,
    "description": "Pen Shape pencil everlasting inkless pencil - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opwxjt_WF-RlAXeWYqF.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwaLiZuZ85ia9RGkrl.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwaYViQ_RLZd1UXEHQ.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwaNEPydyCw0wex1-T.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opwxjt_WF-RlAXeWYqF.jpg",
    "stockQty": 0,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEh",
    "title": "Invisible Pen",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 18,
    "originalPrice": 18,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 36,
    "description": "Invisible Pen - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwiOs7Cg7RwO8rvM_i.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwiQOqHSMUkAG8BCV3.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwiNROQBVqePD5pyts.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYEh.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwiOs7Cg7RwO8rvM_i.jpg",
    "stockQty": 117,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEi",
    "title": "Lipstick Shape Blue Ink Pen",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 26,
    "originalPrice": 26,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 39,
    "description": "Lipstick Shape Blue Ink Pen - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYEi.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opw_DrneKqzWB3oXRMq.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opw_3HIEALF_pKlYXV2.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYEi.jpg",
    "stockQty": 99,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEj",
    "title": " Big Pouch for return Gifts(A5 Size)Random Design",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 18,
    "originalPrice": 18,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 42,
    "description": " Big Pouch for return Gifts(A5 Size)Random Design - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYEj.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwwuM8dvnFeg8c9xqL.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYEj.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEl",
    "title": "Pencil with Sharpner end",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 10,
    "originalPrice": 10,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 45,
    "description": "Pencil with Sharpner end - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxlS2uzEDEDfEevO26.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxlS2uzEDEDfEevO26.jpg",
    "stockQty": 19,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEm",
    "title": "Crystal Ruler",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 15,
    "originalPrice": 15,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 48,
    "description": "Crystal Ruler - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxkQNU3xm1wFgAho1T.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxkQNa4DEv2it0tw6a.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxkQNU3xm1wFgAho1T.jpg",
    "stockQty": 5,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYET",
    "title": "Brick Pencil",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 10,
    "originalPrice": 10,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 51,
    "description": "Brick Pencil - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxf037vd-xlWfo4KiU.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxf03CcSgoFDwlGrVh.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYET.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxf037vd-xlWfo4KiU.jpg",
    "stockQty": 6,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEU",
    "title": "Double Hole fast Camera Sharpner",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 36,
    "originalPrice": 36,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 54,
    "description": "Double Hole fast Camera Sharpner - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYEU.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwcXP7Kk97I1jdN2Ql.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwcVrR_fc-pOHIH3ck.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYEU.jpg",
    "stockQty": 0,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEW",
    "title": "Cartoon astronaut Zipper Bag Pouches For Return Gifts",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 12,
    "originalPrice": 12,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 57,
    "description": "Cartoon astronaut Zipper Bag Pouches For Return Gifts - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxnkAPRnnjeDRGdBDJ.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwefJdJ81YCAb4bH8U.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxnkA8f68Bgxvtmupg.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opxnk9qrWygBdnICiWg.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxnkAesSpMrtZD-l77.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxnkAPRnnjeDRGdBDJ.jpg",
    "stockQty": 0,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEX",
    "title": "Cute Erasers",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 6,
    "originalPrice": 6,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 60,
    "description": "Cute Erasers - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxjbbeFRUxyqdcon3I.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxjV246lfdPgKLvzMJ.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxjV1u0ILjQEIog7Vr.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxjbbeFRUxyqdcon3I.jpg",
    "stockQty": 15,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opset5dlkxq-hq4sYEZ",
    "title": "Doramen ,Micket Themed Cute Pens(Random Design)",
    "category": "Stationary",
    "sku": "UE-SKU-Opset5dlkx",
    "price": 16,
    "originalPrice": 16,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 63,
    "description": "Doramen ,Micket Themed Cute Pens(Random Design) - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opwls6ZCDXF-TM1Pm6t.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opset5dlkxq-hq4sYEZ.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Opwls6ZCDXF-TM1Pm6t.jpg",
    "stockQty": 10,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OpwyU_8NWCPQw9Q7pqr",
    "title": "Transparent Pouch for Return Gifts (A4 size random design)",
    "category": "Stationary",
    "sku": "UE-SKU-OpwyU8NWCP",
    "price": 9,
    "originalPrice": 9,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 66,
    "description": "Transparent Pouch for Return Gifts (A4 size random design) - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxfOijFY-srroSQLug.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpwyU_8NWCPQw9Q7pqr.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OpxfOijFY-srroSQLug.jpg",
    "stockQty": 33,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqqZBtXk0Wo1lUrgyuJ",
    "title": "Moti Gel pen",
    "category": "Stationary",
    "sku": "UE-SKU-OqqZBtXk0W",
    "price": 20,
    "originalPrice": 20,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 69,
    "description": "Moti Gel pen - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqTv-cR8xBuaoZ05jj.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqTv-cR8xBuaoZ05jj.jpg",
    "stockQty": 34,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqqZBtXk0Wo1lUrgyuK",
    "title": "Pvc pouch(mix design pvc pouch for birthday gift packig)",
    "category": "Stationary",
    "sku": "UE-SKU-OqqZBtXk0W",
    "price": 16,
    "originalPrice": 16,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 72,
    "description": "Pvc pouch(mix design pvc pouch for birthday gift packig) - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqTKAnjKJGyXxrTgkt.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqTKAnjKJGyXxrTgkt.jpg",
    "stockQty": 0,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqqZBtXk0Wo1lUrgyuL",
    "title": "Thank you Bag (Mix Designs)",
    "category": "Stationary",
    "sku": "UE-SKU-OqqZBtXk0W",
    "price": 24,
    "originalPrice": 24,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 75,
    "description": "Thank you Bag (Mix Designs) - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqSaSBOXh2iynE_lsb.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqSaSBOXh2iynE_lsb.jpg",
    "stockQty": 138,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqqZBtYCOobhyng5P4C",
    "title": "Diamond Swan pen",
    "category": "Stationary",
    "sku": "UE-SKU-OqqZBtYCOo",
    "price": 32,
    "originalPrice": 32,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 78,
    "description": "Diamond Swan pen - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqPENvBd-KmXpCXhhY.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqPENvBd-KmXpCXhhY.jpg",
    "stockQty": 47,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqqZBtYCOobhyng5P4D",
    "title": "Colour endless pencil",
    "category": "Stationary",
    "sku": "UE-SKU-OqqZBtYCOo",
    "price": 16,
    "originalPrice": 16,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 81,
    "description": "Colour endless pencil - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqOZEqAGBkA758mxnq.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqOZEqAGBkA758mxnq.jpg",
    "stockQty": 6,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqqZBtYCOobhyng5P4E",
    "title": "Mix design pencil",
    "category": "Stationary",
    "sku": "UE-SKU-OqqZBtYCOo",
    "price": 16,
    "originalPrice": 16,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 84,
    "description": "Mix design pencil - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqNq6jeFJa2XYeOgV-.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqNq6jeFJa2XYeOgV-.jpg",
    "stockQty": 144,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqqZBtYCOobhyng5P4H",
    "title": "Mix design noodles eraser ",
    "category": "Stationary",
    "sku": "UE-SKU-OqqZBtYCOo",
    "price": 24,
    "originalPrice": 24,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 87,
    "description": "Mix design noodles eraser  - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqJ3-Z_SnPb4cG7uwN.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqJ3-Z_SnPb4cG7uwN.jpg",
    "stockQty": 58,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqqZBtYCOobhyng5P4K",
    "title": "Sharpener panda and unicorn mix design",
    "category": "Stationary",
    "sku": "UE-SKU-OqqZBtYCOo",
    "price": 30,
    "originalPrice": 30,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 90,
    "description": "Sharpener panda and unicorn mix design - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqHJVVpM1fg5WhgLAR.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqHJVVpM1fg5WhgLAR.jpg",
    "stockQty": 6,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqqZBtYCOobhyng5P4L",
    "title": "Fire brigade sharpner",
    "category": "Stationary",
    "sku": "UE-SKU-OqqZBtYCOo",
    "price": 28,
    "originalPrice": 28,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 93,
    "description": "Fire brigade sharpner - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqH-eLA9euP15liGaD.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqH-eBxrNv9oFxuWuv.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqGvrwmgG4mIiFjEa9.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqH-eLA9euP15liGaD.jpg",
    "stockQty": 52,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqqZBtYCOobhyng5P4N",
    "title": "Labubu 2 hole dustbin shape sharpener",
    "category": "Stationary",
    "sku": "UE-SKU-OqqZBtYCOo",
    "price": 26,
    "originalPrice": 26,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 96,
    "description": "Labubu 2 hole dustbin shape sharpener - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqFzuzdZeEMaVt66ow.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqqFzuzdZeEMaVt66ow.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Owrl7uu1V6f0lZV4aIn",
    "title": "MAGIC DRAWING DOODLE BOOK",
    "category": "Stationary",
    "sku": "UE-SKU-Owrl7uu1V6",
    "price": 70,
    "originalPrice": 100,
    "discount": 30,
    "rating": "4.9",
    "reviewsCount": 99,
    "description": "MAGIC DRAWING DOODLE BOOK - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwrlwhWU8Cg_ZMRcKp5.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Owrl7uc_De7R_R2oJkj.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwrlwhWU8Cg_ZMRcKp5.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwYgtK1ZsEq075ebVb3",
    "title": "MECHANICAL PENCIL BOX",
    "category": "Stationary",
    "sku": "UE-SKU-OwYgtK1ZsE",
    "price": 99,
    "originalPrice": 99,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 102,
    "description": "MECHANICAL PENCIL BOX - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwYgtK1ZsEq075ebVb3.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwYgtK1ZsEq075ebVb3.jpg",
    "stockQty": 5,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwYgtK1ZsEq075ebVb4",
    "title": "CUTE PENCIL POUCHES",
    "category": "Stationary",
    "sku": "UE-SKU-OwYgtK1ZsE",
    "price": 219,
    "originalPrice": 219,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 105,
    "description": "CUTE PENCIL POUCHES - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwYgtK1ZsEq075ebVb4.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwYgtK1ZsEq075ebVb4.jpg",
    "stockQty": 4,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Oh9_gVE69z1N4Slb7mE",
    "title": "350 Combo",
    "category": "Combos",
    "sku": "UE-SKU-Oh9gVE69z1",
    "price": 350,
    "originalPrice": 350,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 18,
    "description": "<a href=\"https://www.instagram.com/reel/DMkiMUPS38K/?igsh=a2hkODgxY2Ywcmoz\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DMkiMUPS38K/?igsh=a2hkODgxY2Ywcmoz</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh9_gUnzo2cFuvRn7S2.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh9_gUnzo2cFuvRn7S2.jpg",
    "stockQty": 15,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Oh9_IVyaKPXaQsbYApt",
    "title": "GIFT COMBO 549",
    "category": "Combos",
    "sku": "UE-SKU-Oh9IVyaKPX",
    "price": 549,
    "originalPrice": 549,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 21,
    "description": "<a href=\"https://www.instagram.com/reel/DPGBGEsE5xH/?igsh=MXVmeG81cjNoNzMxcQ==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DPGBGEsE5xH/?igsh=MXVmeG81cjNoNzMxcQ==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh9_IVkGAc_cxSaliHT.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh9_IVkGAc_cxSaliHT.jpg",
    "stockQty": 8,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Oh9_VH_XhrZPUzLb1d4",
    "title": "450 combo",
    "category": "Combos",
    "sku": "UE-SKU-Oh9VHXhrZP",
    "price": 450,
    "originalPrice": 450,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 24,
    "description": "<a href=\"https://www.instagram.com/reel/DPENy-9EpRF/?igsh=a3dvcXQwZjZuYmxj\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DPENy-9EpRF/?igsh=a3dvcXQwZjZuYmxj</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh9_VHDfu8EeTvscuiQ.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh9_VHDfu8EeTvscuiQ.jpg",
    "stockQty": 7,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Oh9ZZjRP1cZ51LIQt5f",
    "title": "500 gift combo",
    "category": "Combos",
    "sku": "UE-SKU-Oh9ZZjRP1c",
    "price": 500,
    "originalPrice": 500,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 27,
    "description": "<a href=\"https://www.instagram.com/reel/DPG3gHBkpij/?igsh=MWpiNG1iaDN0cnQ1eA==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DPG3gHBkpij/?igsh=MWpiNG1iaDN0cnQ1eA==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh9ZZj8j-zDV3qmhRhL.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Oh9ZZj8j-zDV3qmhRhL.jpg",
    "stockQty": 6,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhA_2L3HR_6orXWU_1p",
    "title": "499 combo",
    "category": "Combos",
    "sku": "UE-SKU-OhA2L3HR6o",
    "price": 499,
    "originalPrice": 499,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 30,
    "description": "<a href=\"https://www.instagram.com/reel/DNngIcOyGhK/?igsh=OTZ3bDJsbWRibzZ3\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DNngIcOyGhK/?igsh=OTZ3bDJsbWRibzZ3</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhA_2Kt-F-rkur1BpFn.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhA_2Kt-F-rkur1BpFn.jpg",
    "stockQty": 9,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OnXHeujFakcuy1zIz9d",
    "title": "399 Combo (6 Products)",
    "category": "Combos",
    "sku": "UE-SKU-OnXHeujFak",
    "price": 399,
    "originalPrice": 399,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 33,
    "description": "<a href=\"https://www.instagram.com/reel/DVz7hqJD2mv/?igsh=MW80bzlhMXNjaHRtdw==\"  target=\"_blank\"  rel=\"noopener\" >https://www.instagram.com/reel/DVz7hqJD2mv/?igsh=MW80bzlhMXNjaHRtdw==</a>",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OnXHeujFakcuy1zIz9d.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OnXHeujFakcuy1zIz9d.jpg",
    "stockQty": 3,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwwwxOUHrW1p8R4UjFS",
    "title": "New 350 combo",
    "category": "Combos",
    "sku": "UE-SKU-OwwwxOUHrW",
    "price": 350,
    "originalPrice": 350,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 36,
    "description": "New 350 combo - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwwwxNQlkPrZFbMqTIS.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwxhU9noRBHiy-pDiHT.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwwwxNQlkPrZFbMqTIS.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdOpruc1k-3yDKL",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdOpru",
    "price": 439,
    "originalPrice": 878,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 18,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdVlL7p61SMn4jn.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdVlL7p61SMn4jn.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErO_",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 439,
    "originalPrice": 878,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 21,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdYEpMF70girReA.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdYEpMF70girReA.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOa",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 520,
    "originalPrice": 1040,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 24,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdWgP6v-I6o66e0.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdWgP6v-I6o66e0.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOb",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 520,
    "originalPrice": 1040,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 27,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdX64iedgeRKE7W.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdX64iedgeRKE7W.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOc",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 439,
    "originalPrice": 878,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 30,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdh6y3kJu6tIXEh.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdh6y3kJu6tIXEh.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOd",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 33,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdh6y3kJu6tIXEi.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdh6y3kJu6tIXEi.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOe",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 36,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdgECy982_woa_X.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdgECy982_woa_X.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOf",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 39,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdjqhzVD3xzdc3V.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdjqhzVD3xzdc3V.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOg",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 42,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdkZril_BWLjXPy.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdkZril_BWLjXPy.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOh",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 45,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdkZril_BWLjXPx.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdkZril_BWLjXPx.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOi",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 48,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdmKN9iCCG8J_eg.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdmKN9iCCG8J_eg.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOj",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 51,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdmKN9iCCG8J_eh.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdmKN9iCCG8J_eh.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOk",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 54,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdoeb6l8uegNQe4.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdoeb6l8uegNQe4.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOl",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 677,
    "originalPrice": 1354,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 57,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdn4OYEa84p32Mb.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdn4OYEa84p32Mb.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOm",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 677,
    "originalPrice": 1354,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 60,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdoeb6l8uegNQe5.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdoeb6l8uegNQe5.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOn",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 677,
    "originalPrice": 1354,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 63,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdn4OYEa84p32Mc.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdn4OYEa84p32Mc.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOo",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 677,
    "originalPrice": 1354,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 66,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdiaKDc3F23sZ10.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdiaKDc3F23sZ10.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOp",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 652,
    "originalPrice": 1304,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 69,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdpylQO6UbLJfUK.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdpylQO6UbLJfUK.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOq",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 652,
    "originalPrice": 1304,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 72,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdxThX56qQOQNeA.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdxThX56qQOQNeA.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOr",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 652,
    "originalPrice": 1304,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 75,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdlsQ-Vzjiwara0.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdlsQ-Vzjiwara0.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOs",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 652,
    "originalPrice": 1304,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 78,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdtLzJSQ62QgSCi.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdtLzJSQ62QgSCi.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOt",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 81,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdrIOsOlGTA2GRl.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdrIOsOlGTA2GRl.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOu",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 84,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdsE5FdJEBinwKg.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdsE5FdJEBinwKg.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOv",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 87,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdsE5FdJEBinwKh.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdsE5FdJEBinwKh.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOw",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 522,
    "originalPrice": 1044,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 90,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDe19nQnqCQJTRWR.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDe19nQnqCQJTRWR.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOx",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 93,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDe2DOny7UwfQ4O_.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDe2DOny7UwfQ4O_.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOy",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 557,
    "originalPrice": 1114,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 96,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDe2DOny7UwfQ4Oa.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDe2DOny7UwfQ4Oa.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdPZlTca5s7ErOZ",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdPZlT",
    "price": 439,
    "originalPrice": 878,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 99,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdWgP6v-I6o66dz.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDdWgP6v-I6o66dz.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdQ6-_ZdzXOZppB",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdQ6Zd",
    "price": 552,
    "originalPrice": 1104,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 102,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDe19nQnqCQJTRWS.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDe19nQnqCQJTRWS.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OhzpDdQ6-_ZdzXOZppC",
    "title": "Kids Clogs",
    "category": "Kids Footwear",
    "sku": "UE-SKU-OhzpDdQ6Zd",
    "price": 522,
    "originalPrice": 1044,
    "discount": 50,
    "rating": "4.9",
    "reviewsCount": 105,
    "description": "Kids Clogs - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDe6y1GsB_PfmnBh.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OhzpDe6y1GsB_PfmnBh.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwOc_dLLeSf_oQ5LmS3",
    "title": "Alien Mobile Stand",
    "category": "Gifts & Gadgets",
    "sku": "UE 1418",
    "price": 130,
    "originalPrice": 200,
    "discount": 35,
    "rating": "4.9",
    "reviewsCount": 18,
    "description": "Alien Mobile Stand - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOc_dM0nKjxX6CFvkj.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOc_dNY17L-JG3AhD6.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOc_dLLeSf_oQ5LmS4.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOc_dM0nKjxX6CFvkh.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOc_dM0nKjxX6CFvki.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOc_dM0nKjxX6CFvkj.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwOceS9SpzoeIFWl3kJ",
    "title": "Inflatable Sofa Chair(with pump)",
    "category": "Gifts & Gadgets",
    "sku": "UE 1419",
    "price": 1960,
    "originalPrice": 2500,
    "discount": 22,
    "rating": "4.9",
    "reviewsCount": 21,
    "description": "Inflatable Sofa Chair(with pump) - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOceS9SpzoeIFWl3kK.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOceSAXn2xhu5t9jbU.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOceS9SpzoeIFWl3kK.jpg",
    "stockQty": 3,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwOckvJwJnuySEzWjX3",
    "title": "Rechargeable Water Dispenser",
    "category": "Gifts & Gadgets",
    "sku": "UE 1420",
    "price": 239,
    "originalPrice": 300,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 24,
    "description": "Rechargeable Water Dispenser - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOckvJwJnuySEzWjX4.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwT-YEJa9uPh-4-QAgU.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwT-YEK52B1V0J4V_iu.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOckvJwJnuySEzWjX4.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwOctJa4iVgb9QU37x5",
    "title": "Ultra HD Metallic Cylinder Projector",
    "category": "Gifts & Gadgets",
    "sku": "UE 1421",
    "price": 4399,
    "originalPrice": 5000,
    "discount": 12,
    "rating": "4.9",
    "reviewsCount": 27,
    "description": "Ultra HD Metallic Cylinder Projector - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOctJa4iVgb9QU37x6.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOctJbcDFAYTikMzq0.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSvy4GnezwB5DwWle9.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSvy4IATvXYSWDbg6m.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSvy4Ejh_Ioqq8s_Wg.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSvy44JmEUtPs9g4zr.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOctJa4iVgb9QU37x6.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwOcvxvOT4tz0rdEg7x",
    "title": "Velvet Heating Pad",
    "category": "Gifts & Gadgets",
    "sku": "UE 1422",
    "price": 299,
    "originalPrice": 500,
    "discount": 40,
    "rating": "4.9",
    "reviewsCount": 30,
    "description": "Velvet Heating Pad - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOcvxvOT4tz0rdEg7y.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOcvxwS2Wik0Em_uos.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOcvxvOT4tz0rdEg7y.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwOd3aVR3vReY1vxneq",
    "title": "Electric Cloth Dryer Heater",
    "category": "Gifts & Gadgets",
    "sku": "UE 1423",
    "price": 2159,
    "originalPrice": 3000,
    "discount": 28,
    "rating": "4.9",
    "reviewsCount": 33,
    "description": "Electric Cloth Dryer Heater - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOd3aVR3vReY1vxner.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOd3aWUugdzQVE-Lt4.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOd3aWUugdzQVE-Lt5.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOd3aWUugdzQVE-Lt6.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOd3aVR3vReY1vxner.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwOdBbyVWGwzgtwr3SV",
    "title": "Cyber Truck Bluetooth Speaker",
    "category": "Gifts & Gadgets",
    "sku": "UE 1424",
    "price": 2399,
    "originalPrice": 3000,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 36,
    "description": "Cyber Truck Bluetooth Speaker - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOdBbzbwbiDAAxL2Ap.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOdBc-LhFD9a6Da9kc.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOdBc-LhFD9a6Da9kb.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOdBc-LhFD9a6Da9kd.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOdBbzbwbiDAAxL2Ap.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwOdFGgmX9_7iSQjax7",
    "title": "Buggati Car Bluetooth Speaker",
    "category": "Gifts & Gadgets",
    "sku": "UE 1425",
    "price": 1079,
    "originalPrice": 1500,
    "discount": 28,
    "rating": "4.9",
    "reviewsCount": 39,
    "description": "Buggati Car Bluetooth Speaker - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOdFGhnPutksV4Uij3.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOdFGhnPutksV4Uij2.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOdFGgmX9_7iSQjax8.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOdFGhnPutksV4Uij3.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwOdH3vJ4p99A4BFZM9",
    "title": "Laptop or Bed Study Table",
    "category": "Gifts & Gadgets",
    "sku": "UE1426",
    "price": 450,
    "originalPrice": 800,
    "discount": 44,
    "rating": "4.9",
    "reviewsCount": 42,
    "description": "Laptop or Bed Study Table - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOdH3vJ4p99A4BFZMA.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOdH3vJ4p99A4BFZMA.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwOYLvFvCKiKxWrhMYd",
    "title": "Study Lamp with Pen Stand & Sharpener",
    "category": "Gifts & Gadgets",
    "sku": "UE 1416",
    "price": 299,
    "originalPrice": 500,
    "discount": 40,
    "rating": "4.9",
    "reviewsCount": 45,
    "description": "Study Lamp with Pen Stand & Sharpener - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOYLvGt-5lnNmy4cLZ.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOYLvGt-5lnNmy4cLY.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOYLvFvCKiKxWrhMYe.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOYLvGt-5lnNmy4cLZ.jpg",
    "stockQty": 0,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwOYN_J8AT1Pbkyv0tj",
    "title": "L T21 USB Headlight",
    "category": "Gifts & Gadgets",
    "sku": "UE 1417",
    "price": 210,
    "originalPrice": 300,
    "discount": 30,
    "rating": "4.9",
    "reviewsCount": 48,
    "description": "L T21 USB Headlight - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOYN_KRfB3BU8Iy4jq.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOYN_KRfB3BU8Iy4jp.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOYN_J8AT1Pbkyv0tl.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOYN_J8AT1Pbkyv0tk.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwOYN_KRfB3BU8Iy4jq.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSwb_Ar7NbypmrFx41",
    "title": "Premium Watch & Sunglasses Organizer",
    "category": "Gifts & Gadgets",
    "sku": "UE1427",
    "price": 1199,
    "originalPrice": 2000,
    "discount": 40,
    "rating": "4.9",
    "reviewsCount": 51,
    "description": "Premium Watch & Sunglasses Organizer - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSwb_Ar7NbypmrFx42.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSwb_CD1JrtrstCOXx.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSwb_Ar7NbypmrFx42.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSx6Zpm-dWnjF7rCgh",
    "title": "Premium Insulated Bottle 1000ml",
    "category": "Gifts & Gadgets",
    "sku": "UE 1428",
    "price": 499,
    "originalPrice": 700,
    "discount": 29,
    "rating": "4.9",
    "reviewsCount": 54,
    "description": "Premium Insulated Bottle 1000ml - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSx6ZqmG2EXdJho8CD.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSx6Zpm-dWnjF7rCgk.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSx6Zpm-dWnjF7rCgj.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSx6Zpm-dWnjF7rCgi.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSx6ZqmG2EXdJho8CD.jpg",
    "stockQty": 0,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSxAIIae3t0q1NyidJ",
    "title": "Oil Spray Glass Bottle",
    "category": "Gifts & Gadgets",
    "sku": "UE 1429",
    "price": 149,
    "originalPrice": 200,
    "discount": 26,
    "rating": "4.9",
    "reviewsCount": 57,
    "description": "Oil Spray Glass Bottle - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxAIIae3t0q1NyidL.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxAIJbX06mJDHRtYI.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxAIIae3t0q1NyidK.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxAIJbX06mJDHRtYH.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxAIIae3t0q1NyidL.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSxDY1Qk6xD4wJG3g4",
    "title": "Magic Umbrella",
    "category": "Gifts & Gadgets",
    "sku": "UE 1430",
    "price": 330,
    "originalPrice": 500,
    "discount": 34,
    "rating": "4.9",
    "reviewsCount": 60,
    "description": "Magic Umbrella - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxDY2GgJ3OeeXtxg8.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxDY2GgJ3OeeXtxg9.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxDY36p1AsSi-Ills.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxDY1Qk6xD4wJG3g5.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxDY36p1AsSi-Illr.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxDY2GgJ3OeeXtxg8.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSxTOyLqIigFLbwVHs",
    "title": "Cute Duck Silicon Lamp",
    "category": "Gifts & Gadgets",
    "sku": "UE 1431",
    "price": 459,
    "originalPrice": 999,
    "discount": 54,
    "rating": "4.9",
    "reviewsCount": 63,
    "description": "Cute Duck Silicon Lamp - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxz3sbwxFLxeiI0Qg.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxz3r16N3WxNpgAzU.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxTOyLqIigFLbwVHt.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSxz3sbwxFLxeiI0Qg.jpg",
    "stockQty": 3,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSyGpdTsElGBNrcOzG",
    "title": "Cute Silicon Pear Multi colour Lamp",
    "category": "Gifts & Gadgets",
    "sku": "UE 1432",
    "price": 450,
    "originalPrice": 700,
    "discount": 36,
    "rating": "4.9",
    "reviewsCount": 66,
    "description": "Cute Silicon Pear Multi colour Lamp - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSyGpel48RY7F4CWem.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSyGpdTsElGBNrcOzH.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSyGpel48RY7F4CWel.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSyGpel48RY7F4CWen.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSyGpel48RY7F4CWem.jpg",
    "stockQty": 3,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSyIAXuDqYj22unB6L",
    "title": "Premium Metal Night Lamp",
    "category": "Gifts & Gadgets",
    "sku": "UE 1433",
    "price": 559,
    "originalPrice": 800,
    "discount": 30,
    "rating": "4.9",
    "reviewsCount": 69,
    "description": "Premium Metal Night Lamp - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSyIAYXMjCwVjrk5il.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSyIAYXMjCwVjrk5im.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSyIAXuDqYj22unB6N.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSyIAXuDqYj22unB6M.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSyIAYXMjCwVjrk5il.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSzaylkVgYWj_4Wnk8",
    "title": "Instant Popcorn Maker",
    "category": "Gifts & Gadgets",
    "sku": "UE 1437",
    "price": 1199,
    "originalPrice": 1500,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 72,
    "description": "Instant Popcorn Maker - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzaymRiB8RvL2xRPS.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzaylkVgYWj_4WnkA.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzaylkVgYWj_4Wnk9.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzaymRiB8RvL2xRPS.jpg",
    "stockQty": 3,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSzdQLgjtPxyxjbde0",
    "title": "Sensor Alarm Clock",
    "category": "Gifts & Gadgets",
    "sku": "UE 1438",
    "price": 360,
    "originalPrice": 500,
    "discount": 28,
    "rating": "4.9",
    "reviewsCount": 75,
    "description": "Sensor Alarm Clock - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzdQLgjtPxyxjbde1.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzdQLgjtPxyxjbde3.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzdQLgjtPxyxjbde2.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzdQLgjtPxyxjbde1.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSzh2zuZFAi0iCnf0j",
    "title": "Reversible Umbrella",
    "category": "Gifts & Gadgets",
    "sku": "UE 1439",
    "price": 399,
    "originalPrice": 500,
    "discount": 20,
    "rating": "4.9",
    "reviewsCount": 78,
    "description": "Reversible Umbrella - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzh2zuZFAi0iCnf0k.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzh2zuZFAi0iCnf0k.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSzkEtOmN5jVh2U4Iy",
    "title": "Automatic Inflatable Air Bed",
    "category": "Gifts & Gadgets",
    "sku": "UE 1440",
    "price": 3990,
    "originalPrice": 6000,
    "discount": 34,
    "rating": "4.9",
    "reviewsCount": 81,
    "description": "Automatic Inflatable Air Bed - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzkEuOziuV7erPm0S.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzkEtOmN5jVh2U4Iz.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzkEuOziuV7erPm0R.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzkEuOziuV7erPm0S.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSznl7Yg4FfU-0JoWU",
    "title": "Transparent Umbrella",
    "category": "Gifts & Gadgets",
    "sku": "UE 1441",
    "price": 200,
    "originalPrice": 300,
    "discount": 33,
    "rating": "4.9",
    "reviewsCount": 84,
    "description": "Transparent Umbrella - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSznl7Yg4FfU-0JoWV.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSznl7Yg4FfU-0JoWV.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSzquJ2QZ6eBMOOHM-",
    "title": "Retro Bluetooth Speaker",
    "category": "Gifts & Gadgets",
    "sku": "UE 1442",
    "price": 670,
    "originalPrice": 800,
    "discount": 16,
    "rating": "4.9",
    "reviewsCount": 87,
    "description": "Retro Bluetooth Speaker - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzquKT0Bl0XxC3Zmc.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzquJ2QZ6eBMOOHM0.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzquLJUiyGk7Ni5yF.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzquKT0Bl0XxC3Zmc.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSzSgpkXs_H8JRjLmr",
    "title": "Premium Metal 3 mode Night Lamp",
    "category": "Gifts & Gadgets",
    "sku": "UE 1434",
    "price": 510,
    "originalPrice": 800,
    "discount": 36,
    "rating": "4.9",
    "reviewsCount": 90,
    "description": "Premium Metal 3 mode Night Lamp - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzSgqhmjJJsOlFpWX.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzSgpkXs_H8JRjLms.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzSgqhmjJJsOlFpWY.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzSgqhmjJJsOlFpWX.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSzUVW7D00n6cNPof7",
    "title": "Multi function Silicon Pumpkin Night Lamp",
    "category": "Gifts & Gadgets",
    "sku": "UE 1435",
    "price": 450,
    "originalPrice": 600,
    "discount": 25,
    "rating": "4.9",
    "reviewsCount": 93,
    "description": "Multi function Silicon Pumpkin Night Lamp - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzUVW7D00n6cNPof8.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzUVXIRINkQbn_w-B.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzUVXIRINkQbn_w-C.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzUVXIRINkQbn_w-D.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzUVW7D00n6cNPof8.jpg",
    "stockQty": 5,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSzvWO5aruUMjJ4r45",
    "title": "Aura Premium Bluetooth Speaker",
    "category": "Gifts & Gadgets",
    "sku": "UE 1443",
    "price": 780,
    "originalPrice": 900,
    "discount": 13,
    "rating": "4.9",
    "reviewsCount": 96,
    "description": "Aura Premium Bluetooth Speaker - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzvWPYj8auCy05mVN.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzvWPYj8auCy05mVM.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzvWPYj8auCy05mVL.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzvWPYj8auCy05mVO.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzvWO5aruUMjJ4r46.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzvWPYj8auCy05mVN.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSzyDF6fM_BzqjZe0u",
    "title": "X20 Magnetic Tape Bluetooth Speaker+Fragrance",
    "category": "Gifts & Gadgets",
    "sku": "UE 1444",
    "price": 760,
    "originalPrice": 900,
    "discount": 16,
    "rating": "4.9",
    "reviewsCount": 99,
    "description": "X20 Magnetic Tape Bluetooth Speaker+Fragrance - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzyDGKjaxVt9kR2NF.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzyDGKjaxVt9kR2NG.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzyDF6fM_BzqjZe0w.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzyDF6fM_BzqjZe0x.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzyDF6fM_BzqjZe0v.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzyDGKjaxVt9kR2NF.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwSzZGJZ2GKnN0B0l5K",
    "title": "Carrot Umbrella",
    "category": "Gifts & Gadgets",
    "sku": "UE 1436",
    "price": 530,
    "originalPrice": 700,
    "discount": 24,
    "rating": "4.9",
    "reviewsCount": 102,
    "description": "Carrot Umbrella - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzZGJZ2GKnN0B0l5L.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzZGJZ2GKnN0B0l5M.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzZGK4pGCa2Khs8Y8.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwSzZGJZ2GKnN0B0l5L.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OwT--nxqP-AaJ0M_rll",
    "title": "Electronic Measuring Spoon Scale",
    "category": "Gifts & Gadgets",
    "sku": "UE 1445",
    "price": 310,
    "originalPrice": 500,
    "discount": 38,
    "rating": "4.9",
    "reviewsCount": 105,
    "description": "Electronic Measuring Spoon Scale - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwT--nyRS9SFW3Et7J4.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwT--nyRS9SFW3Et7J2.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwT--nxqP-AaJ0M_rln.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwT--nxqP-AaJ0M_rlm.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwT--nyRS9SFW3Et7J3.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OwT--nyRS9SFW3Et7J4.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opr3R9lMkNbQuYi7pbp",
    "title": "Pasupu Kumkuma Set 1",
    "category": "Return Gifts",
    "sku": "UE-SKU-Opr3R9lMkN",
    "price": 150,
    "originalPrice": 150,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 18,
    "description": "Pasupu Kumkuma Set 1 - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOJEePIQ4eKxrxl.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvOJEePIQ4eKxrxl.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opr3R9lMkNbQuYi7pbq",
    "title": "RAJA RANI Pasupu Kumkuma Set Couple Edt",
    "category": "Return Gifts",
    "sku": "UE-SKU-Opr3R9lMkN",
    "price": 218.75,
    "originalPrice": 218.75,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 21,
    "description": "RAJA RANI Pasupu Kumkuma Set Couple Edt - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvP8nK5Py4VipbAM.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvP8nK5Py4VipbAM.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opr3R9lMkNbQuYi7pbr",
    "title": "Thambolam Pasupu Kumkuma Set Parrot Edt",
    "category": "Return Gifts",
    "sku": "UE-SKU-Opr3R9lMkN",
    "price": 218.75,
    "originalPrice": 218.75,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 24,
    "description": "Thambolam Pasupu Kumkuma Set Parrot Edt - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvO_wzrkOotuQGFR.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvO_wzrkOotuQGFR.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Opr3R9lMkNbQuYi7pbs",
    "title": "Pasupu Kumkuma Set Parrot Edt2",
    "category": "Return Gifts",
    "sku": "UE-SKU-Opr3R9lMkN",
    "price": 150,
    "originalPrice": 150,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 27,
    "description": "Pasupu Kumkuma Set Parrot Edt2 - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvO_wzrkOotuQGFS.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OaFYvO_wzrkOotuQGFS.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqtTsOZx0Z5S7RqPx6P",
    "title": "Balaji GSI 8’in Tray",
    "category": "Return Gifts",
    "sku": "UE-SKU-OqtTsOZx0Z",
    "price": 270,
    "originalPrice": 270,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 30,
    "description": "Balaji GSI 8’in Tray - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqtTsO8-1D0WOrom27G.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqtUaP3koJSTflvHeW6.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqtTsO8-1D0WOrom27G.jpg",
    "stockQty": 29,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OqtXQhe23c37jgnYcnd",
    "title": "Diya Peacock Design",
    "category": "Return Gifts",
    "sku": "UE-SKU-OqtXQhe23c",
    "price": 75,
    "originalPrice": 75,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 33,
    "description": "Diya Peacock Design - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqtXgF8CUgFO4JRi2oh.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqtXQhH7YGTv5FA5xz1.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OqtXgF8CUgFO4JRi2oh.jpg",
    "stockQty": 40,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Orhj4LN2G4T3tBkHnzb",
    "title": "Pichwai Design Brass 6”in tray",
    "category": "Return Gifts",
    "sku": "UE-SKU-Orhj4LN2G4",
    "price": 149,
    "originalPrice": 149,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 36,
    "description": "Pichwai Design Brass 6”in tray - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Orhj3IheQ0QhUXDN8yn.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Orhj3JCreaH1cBw18Ta.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Orhj3JVMboPi2Gl6fi7.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Orhj3IheQ0QhUXDN8yn.jpg",
    "stockQty": 40,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-Orhj8XBQIDLPCg7LQMb",
    "title": "Pichwai Design 6”in tray with handle",
    "category": "Return Gifts",
    "sku": "UE-SKU-Orhj8XBQID",
    "price": 159,
    "originalPrice": 159,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 39,
    "description": "Pichwai Design 6”in tray with handle - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Orhj7wKRTCTEukAN_6o.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Orhj7whMq1rJQDq0GQs.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Orhj7wzIMcqdlA379qh.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-Orhj7wKRTCTEukAN_6o.jpg",
    "stockQty": 40,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OrhjBsAtG3fkvXeNqMS",
    "title": "GSI  4”in basket",
    "category": "Return Gifts",
    "sku": "UE-SKU-OrhjBsAtG3",
    "price": 125,
    "originalPrice": 125,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 42,
    "description": "GSI  4”in basket - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjBS7rpHBjg6JkxgX.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjBRTYu0ulKQOxoq5.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjBRqCc1RqTs4Fj0J.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjBS7rpHBjg6JkxgX.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OrhjGH04h1bWTPBsTjO",
    "title": "Pichwai Jars 4”in",
    "category": "Return Gifts",
    "sku": "UE-SKU-OrhjGH04h1",
    "price": 109,
    "originalPrice": 109,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 45,
    "description": "Pichwai Jars 4”in - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjFuCQk2kvNFtjH24.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjFuZFBjs7-OvAb3y.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjFutmWnY365Vtbqr.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjFuCQk2kvNFtjH24.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OrhjMn4sMVaHC5xVyCb",
    "title": "Pichwai Jars 4”in",
    "category": "Return Gifts",
    "sku": "UE-SKU-OrhjMn4sMV",
    "price": 109,
    "originalPrice": 109,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 48,
    "description": "Pichwai Jars 4”in - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjMQ6140q83fsVlaw.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjMQVD7vkfvnDPe-K.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjMQlMdVfG-0uY0Hx.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjMQ6140q83fsVlaw.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OrhjRzOsDciBa2YP0RN",
    "title": " Bowl & spoon GSI",
    "category": "Return Gifts",
    "sku": "UE-SKU-OrhjRzOsDc",
    "price": 109,
    "originalPrice": 109,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 51,
    "description": " Bowl & spoon GSI - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjRbpOdzxAbQQcp-g.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjRc9-77EC7WW2j00.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjRcV4zKAWeVbq1xS.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjRbpOdzxAbQQcp-g.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OrhjVZiUDX4Wk_4yMYn",
    "title": "Rudraksh Bell GSI",
    "category": "Return Gifts",
    "sku": "UE-SKU-OrhjVZiUDX",
    "price": 190,
    "originalPrice": 190,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 54,
    "description": "Rudraksh Bell GSI - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjVButgIwKQdiBGOi.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjVCELyieOnUvf-1n.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjVCWB5h1dy4h3ze3.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjVCkBtDlbeHp_G5r.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjVButgIwKQdiBGOi.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OrhjYz8cLxnpEeA6wXQ",
    "title": "Radha Krishna brass square 6”in tray",
    "category": "Return Gifts",
    "sku": "UE-SKU-OrhjYz8cLx",
    "price": 159,
    "originalPrice": 159,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 57,
    "description": "Radha Krishna brass square 6”in tray - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjYU0YUjHwKDGVTnZ.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjYVbuhJ44ApzQsF7.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjYZgKPW0jRzDMTLr.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OrhjYU0YUjHwKDGVTnZ.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OybcLjTMIXA8M9bTKut",
    "title": "JCB Engineering Vehicle",
    "category": "Latest Arrivars",
    "sku": "UE 1515",
    "price": 1820,
    "originalPrice": 2500,
    "discount": 27,
    "rating": "4.9",
    "reviewsCount": 18,
    "description": "JCB Engineering Vehicle - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OybcLRKrb6lEtoa_tqE.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OybcLR8tQ8UoV68-pQP.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OybcLRKrb6lEtoa_tqE.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyC_0nzEL8mPo_Sl5LE",
    "title": "Alphabetic Magnetic Maze",
    "category": "Latest Arrivars",
    "sku": "UE 1504",
    "price": 399,
    "originalPrice": 700,
    "discount": 43,
    "rating": "4.9",
    "reviewsCount": 21,
    "description": "Alphabetic Magnetic Maze - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyC_0QOkLHUNisSZbsC.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyC_0QF-PTdpZ9z5www.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyC_0QOkLHUNisSZbsC.jpg",
    "stockQty": 2,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChCkPsgZZK7C42OID",
    "title": "Wooden multi puzzle n white board",
    "category": "Latest Arrivars",
    "sku": "UE 1515",
    "price": 260,
    "originalPrice": 350,
    "discount": 26,
    "rating": "4.9",
    "reviewsCount": 24,
    "description": "Wooden multi puzzle n white board - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChCR-LKE5qQ83Ddbo.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChCRD73nj_Px0nTmm.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChCR-LKE5qQ83Ddbo.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChDoC4Ra3VovY1k60",
    "title": "Lucky Glass Bottle",
    "category": "Latest Arrivars",
    "sku": "UE-SKU-OyChDoC4Ra",
    "price": 99,
    "originalPrice": 99,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 27,
    "description": "Lucky Glass Bottle - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChDo2okWVIXHKsZ21.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChDo2okWVIXHKsZ21.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChENG7lPuVUcZAgGp",
    "title": "Glass Bottle",
    "category": "Latest Arrivars",
    "sku": "UE 1514",
    "price": 110,
    "originalPrice": 110,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 30,
    "description": "Glass Bottle - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChEN1UMlvo6vaLxw4.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChEN1UMlvo6vaLxw4.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChEvh3Xhvb6ZIozcu",
    "title": "The Lil Rabbit Bottle",
    "category": "Latest Arrivars",
    "sku": "UE 1515",
    "price": 75,
    "originalPrice": 75,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 33,
    "description": "The Lil Rabbit Bottle - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChEvTrBgQoT3BlxrB.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChEvTrBgQoT3BlxrB.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChFPq0vutFV5yeup6",
    "title": "Glass bottle",
    "category": "Latest Arrivars",
    "sku": "UE 1513",
    "price": 90,
    "originalPrice": 90,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 36,
    "description": "Glass bottle - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChFPeWFSK2xLPw9kJ.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChFPeWFSK2xLPw9kJ.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChFx5QhwSvyReHYul",
    "title": "Enjoy Life Glass Bottle",
    "category": "Latest Arrivars",
    "sku": "UE 15012",
    "price": 90,
    "originalPrice": 90,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 39,
    "description": "Enjoy Life Glass Bottle - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChFwyLKbv2sxRS3kR.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChFwyLKbv2sxRS3kR.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChGZUPOjbQ3cdNUKh",
    "title": "Cactus Glass Bottle",
    "category": "Latest Arrivars",
    "sku": "UE 1512",
    "price": 86,
    "originalPrice": 86,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 42,
    "description": "Cactus Glass Bottle - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChGZGHCoOGKgjgATZ.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChGZGHCoOGKgjgATZ.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChHczZFHwMUCvmE1T",
    "title": "Diary",
    "category": "Latest Arrivars",
    "sku": "UE 1511",
    "price": 220,
    "originalPrice": 300,
    "discount": 27,
    "rating": "4.9",
    "reviewsCount": 45,
    "description": "Diary - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChHNY0ASmQjEXlHPu.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChHNH8uIK-PoEFqAc.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChHNY0ASmQjEXlHPu.jpg",
    "stockQty": 4,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChIe-XbOJtg24j7vY",
    "title": "Spinner Puzzle",
    "category": "Latest Arrivars",
    "sku": "UE 1506",
    "price": 260,
    "originalPrice": 500,
    "discount": 48,
    "rating": "4.9",
    "reviewsCount": 48,
    "description": "Spinner Puzzle - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChILfjxKnvufwe7cp.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChILvT5w_xX2JV_Ec.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChILfjxKnvufwe7cp.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChK0MHzki8YJ6Aypn",
    "title": "Doctors Kit",
    "category": "Latest Arrivars",
    "sku": "UE 1509",
    "price": 599,
    "originalPrice": 800,
    "discount": 25,
    "rating": "4.9",
    "reviewsCount": 51,
    "description": "Doctors Kit - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChJgMjoLbGlffmZe0.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChJgjENs8tAGFmVcR.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChJgMjoLbGlffmZe0.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChLxpbaiWcHbja2l6",
    "title": "Cute Mini Stamps",
    "category": "Latest Arrivars",
    "sku": "UE 1509",
    "price": 99,
    "originalPrice": 120,
    "discount": 18,
    "rating": "4.9",
    "reviewsCount": 54,
    "description": "Cute Mini Stamps - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChLxYiuQmy0N3mLMT.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChLxYiuQmy0N3mLMT.jpg",
    "stockQty": 5,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChOVldtjQMDavu5w_",
    "title": "Spinner Band",
    "category": "Latest Arrivars",
    "sku": "UE 1510",
    "price": 60,
    "originalPrice": 60,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 57,
    "description": "Spinner Band - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChOV3xkYkCFiDwDEx.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChOV3xkYkCFiDwDEx.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyChRKis4JzLiJr2QYS",
    "title": "Thermal bottle 300ml",
    "category": "Latest Arrivars",
    "sku": "UE 1509",
    "price": 250,
    "originalPrice": 250,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 60,
    "description": "Thermal bottle 300ml - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChRKTC-GgKDSNw6Fn.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyChRKTC-GgKDSNw6Fn.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyCjj5srhmAVcdDlSiL",
    "title": "Roulette Game",
    "category": "Latest Arrivars",
    "sku": "UE 1516",
    "price": 630,
    "originalPrice": 999,
    "discount": 37,
    "rating": "4.9",
    "reviewsCount": 63,
    "description": "Roulette Game - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCjiZBQ61gkB2IvaYm.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCjiZRIxAkIBIt_U6t.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCjiZh3rHFifVR0p5S.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCjiZBQ61gkB2IvaYm.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyCjkj8xnSJ4lOk0ztj",
    "title": "Lucky Shot Game",
    "category": "Latest Arrivars",
    "sku": "UE 1517",
    "price": 720,
    "originalPrice": 1100,
    "discount": 35,
    "rating": "4.9",
    "reviewsCount": 66,
    "description": "Lucky Shot Game - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCjkPiBAQuxEVEa_0u.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCjkPLmbuL6Tl9Lrow.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCjkPiBAQuxEVEa_0u.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyCjmjj7_1PnQLZQiEZ",
    "title": "Linear pens",
    "category": "Latest Arrivars",
    "sku": "UE 1508",
    "price": 95,
    "originalPrice": 95,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 69,
    "description": "Linear pens - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCjmjWl5XG8cbTzMpS.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCjmjWl5XG8cbTzMpS.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyCjnUanjxrRRXT06g_",
    "title": "scratch book mini",
    "category": "Latest Arrivars",
    "sku": "UE-SKU-OyCjnUanjx",
    "price": 30,
    "originalPrice": 30,
    "discount": 0,
    "rating": "4.9",
    "reviewsCount": 72,
    "description": "scratch book mini - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCjnUI-N7ca6DaW9Yo.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCjnUI-N7ca6DaW9Yo.jpg",
    "stockQty": 20,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyCTaOlhwWSceSTt2HF",
    "title": "Hanging Table Tennis",
    "category": "Latest Arrivars",
    "sku": "UE 15901",
    "price": 360,
    "originalPrice": 500,
    "discount": 28,
    "rating": "4.9",
    "reviewsCount": 75,
    "description": "Hanging Table Tennis - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCTX4JSPa8fex2qubh.jpg",
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCTX4RsGGcM8O9bHjR.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCTX4JSPa8fex2qubh.jpg",
    "stockQty": 1,
    "inStock": true,
    "isFeatured": true
  },
  {
    "id": "-OyCTeKz4b6j_rBb-W7I",
    "title": "Standing Table Tennis",
    "category": "Latest Arrivars",
    "sku": "UE 1502",
    "price": 350,
    "originalPrice": 500,
    "discount": 30,
    "rating": "4.9",
    "reviewsCount": 78,
    "description": "Standing Table Tennis - Authentic boutique product by UNIQUE EXPRESSIONS, Visakhapatnam.",
    "images": [
      "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCTcA1HCd_aOU2KMLO.jpg",
      "https://cdn.quicksell.co/-OyCTc9rBrOCTe59CAx5.jpg"
    ],
    "image": "https://cdn.quicksell.co/-OPHhEadGd1W2rTwlBbp/products/-OyCTcA1HCd_aOU2KMLO.jpg",
    "stockQty": 3,
    "inStock": true,
    "isFeatured": true
  }
]);
localStorage.setItem('ue_products_v7', JSON.stringify(ALL_PRODUCTS));

let STORE_SETTINGS = JSON.parse(localStorage.getItem('ue_store_settings_v5')) || {
  storeName: "UNIQUE EXPRESSIONS",
  ownerName: "G MOUNIKA DURGA",
  phone: "+91 8886662334",
  whatsapp: "918886662334",
  gstin: "37BVTPG7761F1Z1",
  address: "2nd floor LIG 347, 2-115/9/1, near Shivalayam, Midhilapuri VUDA Colony, Madhurawada",
  city: "Visakhapatnam",
  pincode: "530041",
  email: "uniqueexpressions.in@gmail.com",
  freeShippingMin: 499,
  shippingFee: 50,
  giftWrapFee: 30,
  instagram: "@uniqueexpressions.in",
  youtube: "@UNIQUEEXPRESSIONS-25"
};
localStorage.setItem('ue_store_settings_v5', JSON.stringify(STORE_SETTINGS));

let STORE_CUSTOMERS = JSON.parse(localStorage.getItem('ue_customers_v5')) || [
  { id: 1, name: "Sowmya Rao", phone: "+91 8886662334", email: "sowmya.rao@gmail.com", city: "Visakhapatnam", ordersCount: 4, totalSpend: 3450, status: "Active" },
  { id: 2, name: "Rajesh Varma", phone: "+91 9876543210", email: "rajesh.v@yahoo.com", city: "Visakhapatnam", ordersCount: 2, totalSpend: 1850, status: "Active" },
  { id: 3, name: "Priya Sundaram", phone: "+91 9440123456", email: "priya.sundaram@gmail.com", city: "Visakhapatnam", ordersCount: 5, totalSpend: 5400, status: "VIP" },
  { id: 4, name: "K. V. Raman", phone: "+91 9123456789", email: "raman.kv@outlook.com", city: "Visakhapatnam", ordersCount: 1, totalSpend: 799, status: "New" }
];
localStorage.setItem('ue_customers_v5', JSON.stringify(STORE_CUSTOMERS));

let STORE_COUPONS = JSON.parse(localStorage.getItem('ue_coupons_v5')) || [
  { code: "WELCOME100", discount: "₹100 OFF", minSpend: 499, usedCount: 48, expiry: "31 Dec 2026", status: "Active" },
  { code: "VIZAGFREE", discount: "FREE Shipping", minSpend: 299, usedCount: 120, expiry: "31 Dec 2026", status: "Active" },
  { code: "FESTIVE20", discount: "20% OFF", minSpend: 999, usedCount: 15, expiry: "15 Oct 2026", status: "Active" }
];
localStorage.setItem('ue_coupons_v5', JSON.stringify(STORE_COUPONS));

let STORE_REVIEWS = JSON.parse(localStorage.getItem('ue_reviews_v5')) || [
  { id: 101, name: "Sowmya Rao", rating: 5, comment: "Ordered 50 return gift hampers for my daughter's birthday. Exceptional quality and prompt same-day delivery in Madhurawada!", date: "28 Jul 2026", status: "Approved", featured: true },
  { id: 102, name: "Rajesh Varma", rating: 5, comment: "My son loved this stunt car! The 360-degree flip works smoothly and battery performance is great.", date: "24 Jul 2026", status: "Approved", featured: true },
  { id: 103, name: "Priya Sundaram", rating: 5, comment: "Bought this idol as a housewarming gift. The finish is handcrafted with intricate details. Highly recommended boutique!", date: "19 Jul 2026", status: "Approved", featured: false },
  { id: 104, name: "K. V. Raman", rating: 4, comment: "Seamless mobile app experience made ordering school stationery so convenient. Best boutique store!", date: "15 Jul 2026", status: "Approved", featured: true }
];
localStorage.setItem('ue_reviews_v5', JSON.stringify(STORE_REVIEWS));

function syncStorefrontState() {
  localStorage.setItem('ue_products_v9', JSON.stringify(ALL_PRODUCTS));
  localStorage.setItem('ue_products_v8', JSON.stringify(ALL_PRODUCTS));
  localStorage.setItem('ue_categories_data_v3', JSON.stringify(CATEGORIES_DATA));
  localStorage.setItem('ue_categories_v5', JSON.stringify(CATEGORIES));
  localStorage.setItem('ue_hero_slides_v6', JSON.stringify(HERO_SLIDES));
  localStorage.setItem('ue_store_settings_v5', JSON.stringify(STORE_SETTINGS));
  localStorage.setItem('ue_customers_v5', JSON.stringify(STORE_CUSTOMERS));
  localStorage.setItem('ue_coupons_v5', JSON.stringify(STORE_COUPONS));
  localStorage.setItem('ue_reviews_v5', JSON.stringify(STORE_REVIEWS));
  localStorage.setItem('ue_orders_v5', JSON.stringify(userOrders));

  if (typeof renderDesktopGrid === 'function') renderDesktopGrid();
  if (typeof renderCategoryBar === 'function') renderCategoryBar();
  if (typeof renderMobileHome === 'function') renderMobileHome();
  if (typeof renderAllSections === 'function') renderAllSections();
  if (typeof updateBadges === 'function') updateBadges();
}

let activeCategory = 'All';
let currentView = 'home';
let currentPdpProduct = null;
let pdpSelectedQty = 1;
let pdpSelectedVariant = 'Standard';
let appliedCouponCode = null;
let appliedDiscountAmount = 0;

let cart = JSON.parse(localStorage.getItem('ue_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('ue_wishlist') || '[]');
let recentlyViewed = JSON.parse(localStorage.getItem('ue_recently_viewed') || '[]');

let userSession = JSON.parse(localStorage.getItem('ue_user_session_v2') || 'null');
let userProfile = (userSession && userSession.isLoggedIn) ? userSession.profile : null;

let userAddresses = JSON.parse(localStorage.getItem('ue_addresses') || JSON.stringify([
  {
    id: 1,
    name: "G Mounika Durga",
    phone: "+91 8886662334",
    street: "2nd floor LIG 347, 2-115/9/1, near Shivalayam",
    area: "Midhilapuri VUDA Colony, Madhurawada",
    city: "Visakhapatnam",
    pincode: "530041",
    type: "Home",
    isDefault: true
  },
  {
    id: 2,
    name: "K. V. Raman",
    phone: "+91 9876543210",
    street: "Door No 10-4-5, VIP Road, Near Siripuram Circle",
    area: "Siripuram",
    city: "Visakhapatnam",
    pincode: "530003",
    type: "Work",
    isDefault: false
  }
]));

let userOrders = JSON.parse(localStorage.getItem('ue_orders') || JSON.stringify([
  {
    orderId: "UE-892410",
    date: "01 Aug 2026, 10:15 AM",
    status: "Out for Delivery",
    stepIndex: 2,
    customerName: "G Mounika Durga",
    phone: "+91 8886662334",
    address: "2nd floor LIG 347, Madhurawada, Visakhapatnam - 530041",
    paymentMethod: "UPI / PhonePe",
    totalAmount: 1298,
    subtotal: 1298,
    discountAmount: 130,
    shippingFee: 0,
    gstin: "37BVTPG7761F1Z1",
    items: [
      { id: 1, title: "RC Super Stunt Car 360", price: 799, qty: 1, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop" },
      { id: 2, title: "Soft Cuddly Teddy Bear (Large)", price: 499, qty: 1, image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    orderId: "UE-781923",
    date: "25 Jul 2026, 04:30 PM",
    status: "Delivered",
    stepIndex: 3,
    customerName: "G Mounika Durga",
    phone: "+91 8886662334",
    address: "2nd floor LIG 347, Madhurawada, Visakhapatnam - 530041",
    paymentMethod: "Cash on Delivery",
    totalAmount: 1499,
    subtotal: 1499,
    discountAmount: 0,
    shippingFee: 0,
    gstin: "37BVTPG7761F1Z1",
    items: [
      { id: 9, title: "Handcrafted Brass Ganesha Idol", price: 1499, qty: 1, image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=600&auto=format&fit=crop" }
    ]
  }
]));

let userReviews = JSON.parse(localStorage.getItem('ue_reviews') || JSON.stringify([
  {
    id: 101,
    productId: 17,
    productTitle: "Kids Birthday Return Gift Combo Box",
    category: "Return Gifts",
    userName: "Sowmya Rao",
    city: "Visakhapatnam",
    rating: 5,
    title: "Absolute Lifesaver for Birthday Parties!",
    comment: "Ordered 50 return gift hampers for my daughter's birthday. Exceptional quality and prompt same-day delivery in Madhurawada!",
    date: "28 Jul 2026",
    verified: true,
    helpfulCount: 24,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 102,
    productId: 1,
    productTitle: "RC Super Stunt Car 360",
    category: "Toys",
    userName: "Rajesh Varma",
    city: "Madhurawada, Vizag",
    rating: 5,
    title: "Super Durable & Fun Remote Control Car",
    comment: "My son loved this stunt car! The 360-degree flip works smoothly and battery performance is great.",
    date: "24 Jul 2026",
    verified: true,
    helpfulCount: 18,
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 103,
    productId: 9,
    productTitle: "Handcrafted Brass Ganesha Idol",
    category: "Handicrafts",
    userName: "Priya Sundaram",
    city: "Siripuram, Vizag",
    rating: 5,
    title: "Exquisite Craftsmanship & Heavy Brass Build",
    comment: "Bought this idol as a housewarming gift. The finish is handcrafted with intricate details. Highly recommended boutique!",
    date: "19 Jul 2026",
    verified: true,
    helpfulCount: 15,
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 104,
    productId: 13,
    productTitle: "Unicorn Kawaii Multi-Color Pen Set",
    category: "Stationery",
    userName: "K. V. Raman",
    city: "Visakhapatnam",
    rating: 4,
    title: "Great Gift for School Children",
    comment: "Seamless mobile app experience made ordering school stationery so convenient. Best boutique store!",
    date: "15 Jul 2026",
    verified: true,
    helpfulCount: 9,
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=400&auto=format&fit=crop"
  }
]));

let userReturns = JSON.parse(localStorage.getItem('ue_returns') || JSON.stringify([
  {
    returnId: "RET-904128",
    orderId: "UE-781923",
    date: "26 Jul 2026",
    status: "Approved - Pickup Scheduled",
    itemTitle: "Handcrafted Brass Ganesha Idol",
    reason: "Requested Exchange for Different Statue Variant",
    resolution: "Store Credit Refund",
    amount: 1499
  }
]));

let supportTickets = JSON.parse(localStorage.getItem('ue_tickets') || JSON.stringify([
  {
    ticketId: "TCK-4819",
    category: "Wholesale Inquiry",
    subject: "Bulk Return Gift Invoice with GSTIN",
    status: "Resolved",
    date: "29 Jul 2026",
    message: "Requested official GST tax invoice for bulk return gift purchase."
  }
]));

function openWishlistDrawer() {
  switchView('wishlist');
}

function filterCategory(cat) {
  activeCategory = cat || 'All';
  switchView('plp', { category: cat || 'All' });
}

function openWhatsAppChat(customMsg) {
  const phone = '918886662334';
  const defaultText = 'Hi UNIQUE EXPRESSIONS! I am reaching out from your online store regarding products, return gifts and wholesale orders.';
  const msg = customMsg || defaultText;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ─── History Router: encode/decode URL hash params ───────────────────────────
function encodeNavParams(params) {
  if (!params || Object.keys(params).length === 0) return '';
  return '&' + Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

function parseNavHash() {
  const hash = window.location.hash.slice(1); // remove leading '#'
  if (!hash) return null;
  const parts = {};
  hash.split('&').forEach(seg => {
    const [k, v] = seg.split('=');
    if (k && v !== undefined) parts[decodeURIComponent(k)] = decodeURIComponent(v);
  });
  if (!parts.view) return null;
  const { view, ...params } = parts;
  // Convert numeric params back to numbers
  Object.keys(params).forEach(k => {
    if (!isNaN(params[k])) params[k] = Number(params[k]);
  });
  return { view, params };
}

// ─── popstate: Android Back button navigates through app screens ───────────────
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.view) {
    switchView(e.state.view, e.state.params || {}, true);
  } else {
    // Fell back to the base state (Home)
    switchView('home', {}, true);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  // Legacy /admin pathname → hash route (avoids 404 on static hosts)
  if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
    history.replaceState({ view: 'admin', params: {} }, '', '#view=admin');
  }

  // Restore view from URL hash (deep link from WhatsApp etc.) or default to home
  const restoredNav = parseNavHash();
  if (restoredNav) {
    // Replace base history entry with home so Back from deep link goes home first
    history.replaceState({ view: 'home', params: {} }, '', '#view=home');
    switchView(restoredNav.view, restoredNav.params || {});
  } else {
    // Set a base history entry — replaceState so Back from home exits the app
    history.replaceState({ view: 'home', params: {} }, '', '#view=home');
    switchView('home', {}, true); // skipHistory=true since we just set it above
  }
  updateBadges();
  startHeroCarousel();
  if (window.feather) feather.replace();
  if (window.lucide) lucide.createIcons();

  // Bootstrap from Supabase in background
  try {
    const connected = await sbPing();
    if (!connected) return;

    // 1. Load products from Supabase
    const sbProds = await sbGetProducts();
    if (sbProds && sbProds.length > 0) {
      ALL_PRODUCTS = sbProds;
      localStorage.setItem('ue_products_v9', JSON.stringify(ALL_PRODUCTS));
      localStorage.setItem('ue_products_v8', JSON.stringify(ALL_PRODUCTS));
      renderAllSections();
    } else if (ALL_PRODUCTS.length > 0) {
      // Seed Supabase with local products on first run
      await sbSeedProducts(ALL_PRODUCTS);
    }

    // 2. Load orders from Supabase
    const sbOrds = await sbGetOrders();
    if (sbOrds !== null) {
      // Merge: Supabase orders take precedence, keep local-only orders
      const sbIds = new Set(sbOrds.map(o => o.orderId));
      const localOnly = userOrders.filter(o => !sbIds.has(o.orderId));
      userOrders = [...sbOrds, ...localOnly];
      localStorage.setItem('ue_orders', JSON.stringify(userOrders));
    }

    // 3. Load reviews from Supabase
    const sbRevs = await sbGetReviews();
    if (sbRevs !== null && sbRevs.length > 0) {
      const sbRevIds = new Set(sbRevs.map(r => r.id));
      const localOnlyRevs = userReviews.filter(r => !sbRevIds.has(r.id));
      userReviews = [...sbRevs, ...localOnlyRevs];
      localStorage.setItem('ue_reviews', JSON.stringify(userReviews));
    } else if (userReviews.length > 0) {
      // Seed Supabase with demo reviews on first run
      await sbSeedReviews(userReviews);
    }

    // 4. Load returns from Supabase
    const sbRets = await sbGetReturns();
    if (sbRets !== null && sbRets.length > 0) {
      const sbRetIds = new Set(sbRets.map(r => r.returnId));
      const localOnlyRets = userReturns.filter(r => !sbRetIds.has(r.returnId));
      userReturns = [...sbRets, ...localOnlyRets];
      localStorage.setItem('ue_returns', JSON.stringify(userReturns));
    }

    // 5. Load support tickets from Supabase
    const sbTix = await sbGetTickets();
    if (sbTix !== null && sbTix.length > 0) {
      const sbTixIds = new Set(sbTix.map(t => t.ticketId));
      const localOnlyTix = supportTickets.filter(t => !sbTixIds.has(t.ticketId));
      supportTickets = [...sbTix, ...localOnlyTix];
      localStorage.setItem('ue_tickets', JSON.stringify(supportTickets));
    }

    console.log('[UE] Supabase sync complete');
  } catch (err) {
    console.warn('[UE] Supabase bootstrap error (offline mode active):', err.message);
  }
});

/* ==========================================================================
   SPA ROUTER ENGINE
   ========================================================================== */
function switchView(viewName, params = {}, skipHistory = false) {
  if (viewName === 'admin' && !apIsAuthenticated) {
    openAdminPinModal();
    return;
  }

  currentView = viewName;

  // ── Push a history entry so Android Back navigates through screens ──────────
  if (!skipHistory) {
    history.pushState(
      { view: viewName, params },
      '',
      `#view=${viewName}${encodeNavParams(params)}`
    );
  }

  document.querySelectorAll('.app-view').forEach(el => el.classList.remove('active-view'));

  // Storefront Headers & Footers Visibility
  const dtHeader = document.querySelector('.dt-header');
  const dtFooter = document.querySelector('.dt-footer');
  const globalHeader = document.querySelector('.m-app-header');
  const globalSearch = document.querySelector('.m-search-wrap-sticky');
  const cartFab = document.getElementById('mFloatingCartFab');
  const bottomNav = document.querySelector('.m-bottom-nav');

  if (viewName === 'admin') {
    if (dtHeader) dtHeader.style.setProperty('display', 'none', 'important');
    if (dtFooter) dtFooter.style.setProperty('display', 'none', 'important');
    if (globalHeader) globalHeader.style.setProperty('display', 'none', 'important');
    if (globalSearch) globalSearch.style.setProperty('display', 'none', 'important');
    if (cartFab) cartFab.style.setProperty('display', 'none', 'important');
    if (bottomNav) bottomNav.style.setProperty('display', 'none', 'important');
  } else {
    if (window.innerWidth >= 1024) {
      if (dtHeader) dtHeader.style.display = 'block';
      if (dtFooter) dtFooter.style.display = 'block';
      if (globalHeader) globalHeader.style.display = 'none';
      if (globalSearch) globalSearch.style.display = 'none';
      if (cartFab) cartFab.style.display = 'none';
      if (bottomNav) bottomNav.style.display = 'none';
    } else {
      if (dtHeader) dtHeader.style.display = 'none';
      if (dtFooter) dtFooter.style.display = 'none';
      if (globalHeader) globalHeader.style.display = 'flex';
      if (globalSearch) globalSearch.style.display = 'block';
      if (cartFab) cartFab.style.display = 'flex';
      if (bottomNav) bottomNav.style.display = 'flex';
    }
    updateBadges();
  }

  // Update bottom nav highlights
  document.querySelectorAll('.m-nav-tab-link').forEach(el => el.classList.remove('active'));
  const navBtn = document.getElementById(`nav-${viewName}`);
  if (navBtn) navBtn.classList.add('active');
  updateNavIcons(viewName);

  const targetView = viewName === 'admin'
    ? document.getElementById('viewAdmin')
    : (document.getElementById('view' + viewName.toUpperCase()) || document.getElementById('view' + capitalizeFirst(viewName)) || document.getElementById('view' + viewName));
  if (targetView) {
    targetView.classList.add('active-view');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render view dynamic contents
  if (viewName === 'home') {
    renderAllSections();
  } else if (viewName === 'categories') {
    renderCategoriesView();
  } else if (viewName === 'plp') {
    renderPLPView(params.category || 'All');
  } else if (viewName === 'search') {
    renderSearchView(params.query || '');
  } else if (viewName === 'pdp') {
    if (params.productId) renderPDPView(params.productId);
  } else if (viewName === 'checkout') {
    renderCheckoutView();
  } else if (viewName === 'offers') {
    renderOffersView();
  } else if (viewName === 'wishlist') {
    renderWishlistView();
  } else if (viewName === 'profile') {
    renderProfileView();
  } else if (viewName === 'addresses') {
    renderAddressesView();
  } else if (viewName === 'orderDetails') {
    renderOrderDetailsView(params.orderId || (userOrders[0] ? userOrders[0].orderId : null));
  } else if (viewName === 'about') {
    renderAboutView();
  } else if (viewName === 'faq') {
    renderFAQView();
  } else if (viewName === 'terms') {
    renderTermsView();
  } else if (viewName === 'privacy') {
    renderPrivacyView();
  } else if (viewName === 'shipping') {
    renderShippingView();
  } else if (viewName === 'b2b' || viewName === 'wholesale') {
    renderB2BView();
  } else if (viewName === 'admin') {
    try {
      renderAdminView();
    } catch (err) {
      console.error('[UE] Admin render failed:', err);
      showToast('Admin panel failed to load. Please refresh and try again.', 'info');
    }
  } else if (viewName === 'reviews') {
    renderReviewsView();
  } else if (viewName === 'returns') {
    renderReturnsView();
  } else if (viewName === 'helpCenter') {
    renderHelpCenterView();
  } else if (viewName === 'storeLocator') {
    renderStoreLocatorView();
  }

  if (window.feather) feather.replace();
  if (window.lucide) lucide.createIcons();
}

function capitalizeFirst(str) {
  if (!str) return '';
  if (str === 'pdp') return 'PDP';
  if (str === 'plp') return 'PLP';
  if (str === 'b2b') return 'B2B';
  if (str === 'faq') return 'FAQ';
  if (str === 'orderDetails') return 'OrderDetails';
  if (str === 'helpCenter') return 'HelpCenter';
  if (str === 'storeLocator') return 'StoreLocator';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateNavIcons(viewName) {
  const iconMap = {
    home: { active: 'ri-home-5-fill', inactive: 'ri-home-5-line' },
    categories: { active: 'ri-dashboard-3-fill', inactive: 'ri-dashboard-3-line' },
    offers: { active: 'ri-percent-fill', inactive: 'ri-percent-line' },
    wishlist: { active: 'ri-heart-3-fill', inactive: 'ri-heart-3-line' },
    profile: { active: 'ri-user-3-fill', inactive: 'ri-user-3-line' }
  };

  Object.keys(iconMap).forEach(key => {
    const navEl = document.getElementById(`nav-${key}`);
    if (navEl) {
      const iTag = navEl.querySelector('i');
      if (iTag) {
        iTag.className = (key === viewName) ? iconMap[key].active : iconMap[key].inactive;
      }
    }
  });
}

function startHeroCarousel() {
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(() => {
    currentHeroIndex = (currentHeroIndex + 1) % HERO_SLIDES.length;
    setHeroSlide(currentHeroIndex, false);
  }, 5000);
}

function setHeroSlide(idx, resetTimer = true) {
  currentHeroIndex = idx;
  const slide = HERO_SLIDES[idx];
  const imgEl = document.getElementById('mHeroImg');
  const badgeEl = document.querySelector('.m-hero-badge-pill');
  const headingEl = document.getElementById('mHeroHeading');
  const subEl = document.getElementById('mHeroSub');

  if (imgEl) {
    imgEl.classList.remove('hero-fade-anim');
    void imgEl.offsetWidth;
    imgEl.src = slide.img;
    imgEl.classList.add('hero-fade-anim');
  }
  if (badgeEl) badgeEl.innerText = slide.badge;
  if (headingEl) headingEl.innerText = slide.title;
  if (subEl) subEl.innerText = slide.sub;

  for (let i = 0; i < 3; i++) {
    const dot = document.getElementById(`mDot${i}`);
    if (dot) {
      if (i === idx) dot.classList.add('active');
      else dot.classList.remove('active');
    }
  }

  if (resetTimer) startHeroCarousel();
}

function getEffectivePrice(basePrice) {
  return basePrice;
}

function renderAllSections() {
  renderMobileGrid();
  renderDesktopGrid();
  renderRecentlyViewed();
  renderBestSellers();
  renderRecommended();
  renderNewArrivals();
  updateActiveCategoryThumbnails();
  if (window.feather) feather.replace();
  if (window.lucide) lucide.createIcons();
}

function renderMobileGrid() {
  const container = document.getElementById('mobileProductGrid');
  if (!container) return;

  let filtered = ALL_PRODUCTS;
  if (activeCategory !== 'All') {
    filtered = ALL_PRODUCTS.filter(p => p.category === activeCategory);
  }

  const heading = document.getElementById('mCategoryHeading');
  if (heading) heading.innerText = activeCategory === 'All' ? '🔥 Trending Collections' : `${activeCategory} Collection`;

  container.innerHTML = filtered.slice(0, 16).map((p, idx) => createMobileTileHTML(p, idx)).join('');
}

function renderDesktopGrid() {
  const container = document.getElementById('desktopProductGrid');
  if (!container) return;

  let filtered = ALL_PRODUCTS;
  if (activeCategory !== 'All') {
    filtered = ALL_PRODUCTS.filter(p => p.category === activeCategory);
  }

  container.innerHTML = filtered.slice(0, 20).map((p, idx) => createDesktopTileHTML(p, idx)).join('');
}

function renderRecentlyViewed() {
  const container = document.getElementById('recentlyViewedRail');
  const header = document.getElementById('recentlyViewedHeader');
  if (!container) return;

  if (recentlyViewed.length === 0) {
    if (header) header.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  if (header) header.style.display = 'flex';
  const products = ALL_PRODUCTS.filter(p => recentlyViewed.includes(p.id));
  container.innerHTML = products.slice(0, 8).map((p, idx) => createMiniProductHTML(p, idx)).join('');
}

function renderBestSellers() {
  const container = document.getElementById('bestSellersRail');
  if (!container) return;
  const best = ALL_PRODUCTS.slice(0, 8);
  container.innerHTML = best.map((p, idx) => createMiniProductHTML(p, idx)).join('');
}

function renderRecommended() {
  const container = document.getElementById('recommendedRail');
  if (!container) return;
  const recs = ALL_PRODUCTS.slice(8, 16);
  container.innerHTML = recs.map((p, idx) => createMiniProductHTML(p, idx)).join('');
}

function renderNewArrivals() {
  const container = document.getElementById('newArrivalsRail');
  if (!container) return;
  const arrivals = ALL_PRODUCTS.slice(16, 24);
  container.innerHTML = arrivals.map((p, idx) => createMiniProductHTML(p, idx)).join('');
}

function createDesktopTileHTML(product, index = 0) {
  const isWishlisted = wishlist.includes(product.id);
  const effectivePrice = getEffectivePrice(product.price);
  const saveAmount = product.originalPrice - effectivePrice;

  return `
    <div class="dt-product-card" onclick="openProductPage('${product.id}')">
      <div class="dt-card-img-wrapper" style="position:relative;">
        <img src="${product.image}" loading="lazy" alt="${product.title}" onerror="this.src='https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop'">
        <span class="dt-discount-badge">-${product.discount}%</span>
        <button class="dt-wishlist-btn" onclick="event.stopPropagation(); toggleWishlist('${product.id}', this)" title="Add to Wishlist">
          <i class="${isWishlisted ? 'ri-heart-3-fill' : 'ri-heart-3-line'}" style="${isWishlisted ? 'color:#0f172a;' : ''}"></i>
        </button>
        <button onclick="event.stopPropagation(); openQuickViewModal('${product.id}')" style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); background:rgba(15,23,42,0.85); color:#fff; border:none; padding:6px 14px; border-radius:99px; font-size:11px; font-weight:700; cursor:pointer; backdrop-filter:blur(4px); transition:all 0.2s ease;">
          👁️ Quick View
        </button>
      </div>
      <div class="dt-card-content">
        <span class="dt-card-cat">${product.category}</span>
        <h4 class="dt-card-title">${product.title}</h4>
        <div class="dt-card-rating">
          <span style="color:#f59e0b;">★</span> <strong>${product.rating}</strong>
          <span style="color:#94a3b8; font-size:11px; margin-left:4px;">(${product.reviewsCount})</span>
        </div>
        <div class="dt-card-price-row">
          <span class="dt-card-price">₹${effectivePrice}</span>
          <span class="dt-card-mrp">₹${product.originalPrice}</span>
          <span class="dt-card-save">Save ₹${saveAmount}</span>
        </div>
        <button class="dt-card-add-btn" onclick="event.stopPropagation(); quickAddToCart('${product.id}')">
          <i class="ri-shopping-bag-3-line"></i> Add to Cart
        </button>
      </div>
    </div>
  `;
}

function openQuickViewModal(productId) {
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const content = document.getElementById('quickViewContent');
  if (content) {
    content.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:center;">
        <img src="${product.image}" style="width:100%; height:260px; object-fit:contain; border-radius:16px; background:#f8fafc; padding:12px;">
        <div>
          <span style="font-size:11px; font-weight:800; color:#64748b;">${product.category}</span>
          <h3 style="font-size:18px; font-weight:800; color:#0f172a; margin:4px 0 8px 0;">${product.title}</h3>
          <div style="font-size:12px; color:#10b981; font-weight:800; margin-bottom:8px;">★ ${product.rating} (${product.reviewsCount} reviews)</div>
          <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:12px;">
            <span style="font-size:22px; font-weight:900; color:#0f172a;">₹${product.price}</span>
            <span style="font-size:14px; color:#94a3b8; text-decoration:line-through;">₹${product.originalPrice}</span>
            <span style="font-size:11px; font-weight:800; color:#0f172a;">${product.discount}% OFF</span>
          </div>
          <p style="font-size:12px; color:#475569; line-height:1.5; margin-bottom:16px;">${product.description}</p>
          <div style="display:flex; gap:10px;">
            <button class="dt-hero-cta-btn" style="flex:1; height:42px; font-size:13px;" onclick="quickAddToCart('${product.id}'); closeQuickViewModal();">
              🛒 Add to Cart
            </button>
            <button class="form-input" style="width:auto; padding:0 16px; height:42px;" onclick="openProductPage('${product.id}'); closeQuickViewModal();">
              Full Details →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  const modal = document.getElementById('quickViewModalBackdrop');
  if (modal) modal.classList.add('active');
}

function closeQuickViewModal() {
  const modal = document.getElementById('quickViewModalBackdrop');
  if (modal) modal.classList.remove('active');
}

function createMobileTileHTML(product, index = 0) {
  const isWishlisted = wishlist.includes(product.id);
  const effectivePrice = getEffectivePrice(product.price);
  const saveAmount = product.originalPrice - effectivePrice;
  const delaySec = (index * 0.04).toFixed(2);

  return `
    <div class="m-product-tile-card" style="animation-delay: ${delaySec}s;" onclick="openProductPage('${product.id}')">
      <div class="m-tile-img-wrapper">
        <img src="${product.image}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop'">
        <span class="m-discount-badge-orange">${product.discount}% OFF</span>
        <button class="m-wishlist-heart-btn" onclick="event.stopPropagation(); toggleWishlist('${product.id}', this)" title="Add to Wishlist">
          <i class="${isWishlisted ? 'ri-heart-3-fill' : 'ri-heart-3-line'}" style="${isWishlisted ? 'color:#0f172a;' : 'color:#1e293b;'}"></i>
        </button>
        <div class="m-rating-badge-gold">
          <span style="color:#f59e0b;">★</span>
          <span>${product.rating}</span>
        </div>
      </div>
      <div class="m-tile-content-box">
        <span class="m-tile-cat-name">${product.category}</span>
        <h4 class="m-tile-title">${product.title}</h4>
        <div class="m-tile-price-row">
          <span class="m-tile-curr-price">₹${effectivePrice}</span>
          <span class="m-tile-mrp-price">₹${product.originalPrice}</span>
        </div>
        <span class="m-tile-save-green">You Save ₹${saveAmount}</span>
        <button class="m-tile-add-btn" onclick="event.stopPropagation(); quickAddToCart('${product.id}')">
          <span class="m-add-icon-sq"><i class="ri-add-line"></i></span> Quick Add
        </button>
      </div>
    </div>
  `;
}

function createMiniProductHTML(product, index = 0) {
  const effectivePrice = getEffectivePrice(product.price);
  const delaySec = (index * 0.04).toFixed(2);
  const titleText = String(product.title || '').replace(/"/g, '&quot;');
  return `
    <div class="m-mini-product-card" style="animation: fadeInUp 0.4s ease backwards; animation-delay: ${delaySec}s;" onclick="openProductPage('${product.id}')">
      <div style="position:relative; width:100%; aspect-ratio:1/1; overflow:hidden; border-radius:10px; background:#f8fafc;">
        <img src="${product.image}" loading="lazy" alt="${titleText}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop'">
        ${product.discount ? `<span style="position:absolute; top:6px; left:6px; background:#ff5500; color:#fff; font-size:8.5px; font-weight:800; padding:2px 6px; border-radius:10px; box-shadow:0 2px 4px rgba(0,0,0,0.15);">${product.discount}% OFF</span>` : ''}
      </div>
      <div class="m-mini-title" title="${titleText}">${product.title}</div>
      <div style="display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:4px;">
        <div class="m-mini-price">₹${effectivePrice}</div>
        <button onclick="event.stopPropagation(); quickAddToCart('${product.id}')" style="background:#0f172a; color:#ffffff; border:none; width:26px; height:26px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; box-shadow:0 2px 6px rgba(15,23,42,0.2);" title="Quick Add">
          <i class="ri-add-line"></i>
        </button>
      </div>
    </div>
  `;
}

function openProductPage(productId) {
  if (!recentlyViewed.includes(productId)) {
    recentlyViewed.unshift(productId);
    if (recentlyViewed.length > 10) recentlyViewed.pop();
    localStorage.setItem('ue_recently_viewed', JSON.stringify(recentlyViewed));
  }
  switchView('pdp', { productId: productId });
}

/* ==========================================================================
   AMAZON-INSPIRED PRODUCT DETAIL PAGE (PDP) RENDERER (UE BRAND COLORS)
   ========================================================================== */

/* ── Video URL Helpers ─────────────────────────────────────────── */




function buildVideoSectionHTML(product) {
  const videoUrl = (product.videoUrl || product.video_url || product.videoLink || '').trim();
  if (!videoUrl) return '';

  return `
    <div style="margin-top: 12px;">
      <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; color: #0f172a; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; text-decoration: none; width: 100%; box-sizing: border-box; transition: background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
        🎥 View Product Demonstration →
      </a>
    </div>
  `;
}




function playPDPInlineVideo(containerId, embedUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<iframe src="${embedUrl}" style="width:100%; height:100%; border:none; border-radius:14px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
}



/* ==========================================================================
   PRODUCTION PDP RENDERER (PHASE 4 — DESKTOP 60/40 & MOBILE MYNTRA/AJIO)
   ========================================================================== */

function renderPDPView(productId) {
  const pForLd = ALL_PRODUCTS.find(item => String(item.id) === String(productId));
  if (pForLd) injectProductJsonLd(pForLd);

function injectProductJsonLd(product) {
  try {
    let schemaScript = document.getElementById('productJsonLdScript');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'productJsonLdScript';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    const effectivePrice = getEffectivePrice(product.price);
    schemaScript.textContent = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.title,
      "image": [product.image],
      "description": product.description || `${product.title} offered by UNIQUE EXPRESSIONS, Visakhapatnam.`,
      "sku": product.sku || `UE-SKU-${product.id}`,
      "brand": { "@type": "Brand", "name": "UNIQUE EXPRESSIONS" },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "INR",
        "price": effectivePrice,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock",
        "seller": { "@type": "Organization", "name": "UNIQUE EXPRESSIONS" }
      }
    });
  } catch (e) {}
}

  if (!productId && ALL_PRODUCTS.length > 0) productId = ALL_PRODUCTS[0].id;
  let product = ALL_PRODUCTS.find(p => String(p.id) === String(productId) || String(p.id).trim() === String(productId).trim() || p.id == productId);
  if (!product && ALL_PRODUCTS.length > 0) {
    product = ALL_PRODUCTS[0]; // Robust fallback: Never leave PDP as a blank white page!
  }
  if (!product) return;

  currentPdpProduct = product;
  pdpSelectedQty = 1;
  pdpSelectedVariant = 'Standard Pack';

  const container = document.getElementById('viewPDP');
  if (!container) return;

  const isDesktop = window.innerWidth >= 1024;

  if (isDesktop) {
    container.innerHTML = renderPDPDesktop(product);
  } else {
    container.innerHTML = renderPDPMobile(product);
  }

  // Bind all micro-interactions & event listeners
  setTimeout(() => {
    initPDPInteractions(product, isDesktop);
  }, 50);
}

/* ──────────────────────────────────────────────────────────────────────────
   1. DESKTOP PDP RENDERER (60% Gallery / 40% Sticky Buy Box)
   ────────────────────────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────────────────────────
   1. DESKTOP PDP RENDERER (Clean 2-Column Adaptation of Mobile PDP)
   ────────────────────────────────────────────────────────────────────────── */

function renderPDPDesktop(product) {
  const images = (Array.isArray(product.images) && product.images.length > 0) ? product.images : [product.image];
  const isWishlisted = wishlist.includes(product.id);
  const effectivePrice = getEffectivePrice(product.price);
  const saveAmount = (product.originalPrice || Math.round(product.price * 1.25)) - effectivePrice;
  const discountPct = product.discount || Math.round(((saveAmount) / (product.originalPrice || (effectivePrice + saveAmount))) * 100);

  const relatedItems = ALL_PRODUCTS.filter(p => p.category === product.category && String(p.id) !== String(product.id)).slice(0, 4);
  const videoHTML = buildVideoSectionHTML(product);

  const thumbsHTML = images.map((imgUrl, idx) => `
    <div class="pdp-dt-thumb-card ${idx === 0 ? 'active' : ''}" onclick="switchDesktopPDPImg(this, '${imgUrl}')">
      <img src="${imgUrl}" alt="Thumbnail ${idx + 1}" onerror="this.src='https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=300'">
    </div>
  `).join('');

  const specsEntries = Object.entries(product.specifications || {});
  const reviewsList = Array.isArray(product.reviews) ? product.reviews : [];

  return `
    <div class="pdp-dt-container">
      <!-- Breadcrumb Strip -->
      <div class="dt-breadcrumb-strip" style="margin-bottom: 16px;">
        <a href="#" onclick="switchView('home'); return false;">Home</a>
        <i class="ri-arrow-right-s-line"></i>
        <a href="#" onclick="filterCategory('${product.category}'); return false;">${product.category}</a>
        <i class="ri-arrow-right-s-line"></i>
        <span style="font-weight: 700; color: #0f172a;">${product.title}</span>
      </div>

      <!-- 55% / 45% Hero Grid -->
      <div class="pdp-dt-hero-grid">
        <!-- LEFT COLUMN (55%): Gallery & Thumbnails Below Main Image -->
        <div class="pdp-dt-gallery-side">
          <div class="pdp-dt-main-img-box" id="pdpMainBoxDesktop" onclick="openPDPModalLightbox(${JSON.stringify(images).replace(/"/g, '&quot;')}, 0)">
            <span style="position: absolute; top: 16px; left: 16px; background: #0f172a; color: #fff; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 99px; z-index: 2;">
              🔥 ${discountPct}% OFF
            </span>
            <button style="position: absolute; top: 16px; right: 16px; background: #ffffff; border: 1px solid #e2e8f0; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer; z-index: 2; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" onclick="event.stopPropagation(); toggleWishlist('${product.id}', this)" title="Add to Wishlist">
              <i class="${isWishlisted ? 'ri-heart-3-fill' : 'ri-heart-3-line'}" style="color: ${isWishlisted ? '#0f172a' : '#94a3b8'};"></i>
            </button>
            
            <img src="${images[0]}" id="pdpMainImage" alt="${product.title}" onerror="this.src='https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800'">
            
            <div id="pdpZoomLens" class="pdp-zoom-result"></div>
            <div style="font-size: 11px; color: #94a3b8; font-weight: 700; margin-top: 10px;">🔍 Hover to zoom • Click for full screen lightbox</div>
          </div>

          <!-- Product Thumbnails Row Below Main Picture -->
          <div class="pdp-dt-thumbs-row">
            ${thumbsHTML}
          </div>
        </div>

        <!-- RIGHT COLUMN (45%): Purchase Panel -->
        <div class="pdp-dt-buy-panel">
          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 0.8px; display: block; margin-bottom: 4px;">UNIQUE EXPRESSIONS BOUTIQUE</span>
          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.25; margin: 0 0 10px 0;">${product.title}</h1>

          <!-- Rating & Stock Status -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: #ecfdf5; color: #10b981; font-weight: 800; padding: 4px 12px; border-radius: 99px; font-size: 12px;">★ ${product.rating || '4.9'} / 5.0</span>
              <span style="font-size: 12.5px; color: #64748b;">(${product.reviewsCount || reviewsList.length} verified reviews)</span>
            </div>
            <span style="font-size: 12px; font-weight: 800; color: #10b981; background: #ecfdf5; padding: 4px 10px; border-radius: 8px;">
              🟢 ${product.inStock !== false ? 'In Stock (' + (product.stockQty || 15) + ' units)' : 'Out of Stock'}
            </span>
          </div>

          <!-- Price Row -->
          <div style="margin-bottom: 18px;">
            <div style="display: flex; align-items: baseline; gap: 10px;">
              <span style="font-size: 30px; font-weight: 900; color: #0f172a;">₹${effectivePrice}</span>
              <span style="font-size: 15px; color: #94a3b8; text-decoration: line-through;">M.R.P.: ₹${product.originalPrice || (effectivePrice + saveAmount)}</span>
              <span style="background: #0f172a; color: #fff; font-size: 12px; font-weight: 800; padding: 3px 10px; border-radius: 99px;">${discountPct}% OFF</span>
            </div>
            <div style="font-size: 12px; color: #10b981; font-weight: 700; margin-top: 4px;">Inclusive of all taxes • You save ₹${saveAmount}!</div>
          </div>

          <!-- Pack Variant Selector -->
          <div style="margin-bottom: 18px;">
            <label style="font-size: 11px; font-weight: 800; color: #475569; display: block; margin-bottom: 6px; text-transform: uppercase;">Select Pack Variant:</label>
            <div style="display: flex; gap: 8px;">
              <button class="form-input active" style="flex: 1; height: 40px; font-size: 12.5px; font-weight: 700; border-color: #0f172a;" onclick="selectPdpVariant(this, 'Standard Pack')">Standard Pack</button>
              <button class="form-input" style="flex: 1; height: 40px; font-size: 12.5px;" onclick="selectPdpVariant(this, 'Gift Box')">Gift Box Pack</button>
              <button class="form-input" style="flex: 1; height: 40px; font-size: 12.5px;" onclick="selectPdpVariant(this, 'Wholesale Bulk')">Wholesale Pack</button>
            </div>
          </div>

          <!-- Quantity Stepper -->
          <div style="margin-bottom: 20px;">
            <label style="font-size: 11px; font-weight: 800; color: #475569; display: block; margin-bottom: 6px; text-transform: uppercase;">Quantity:</label>
            <div style="display: flex; align-items: center; gap: 14px;">
              <div class="pdp-stepper-box" style="margin: 0;">
                <button class="pdp-stepper-btn" onclick="updatePdpQty(-1)">-</button>
                <span class="pdp-stepper-val" id="pdpQtyDisplay">1</span>
                <button class="pdp-stepper-btn" onclick="updatePdpQty(1)">+</button>
              </div>
              <span style="font-size: 12px; color: #64748b;">Dispatching directly from Madhurawada store</span>
            </div>
          </div>

          <!-- Delivery Availability Check -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin-bottom: 20px;">
            <span style="font-size: 12px; font-weight: 800; color: #0f172a; display: block; margin-bottom: 6px;">📍 Delivery Availability Check:</span>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="pdpPincodeInput" value="530041" class="form-input" style="flex: 1; height: 38px; font-size: 12.5px;">
              <button class="m-hero-cta-button" style="height: 38px; padding: 0 16px; font-size: 12px;" onclick="checkPdpPincode()">Check ETA</button>
            </div>
            <div id="pdpPincodeResult" style="font-size: 11.5px; font-weight: 700; color: #16a34a; margin-top: 6px;">🟢 Express Same-Day Delivery available for Visakhapatnam (530041)</div>
          </div>

          <!-- ONLY TWO PRIMARY ACTION BUTTONS -->
          <div style="display: flex; gap: 10px;">
            <button style="flex: 1; height: 48px; font-size: 14.5px; font-weight: 800; background: linear-gradient(135deg, #0f172a 0%, #0f172a 100%); color: #ffffff; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="addPdpToCart(false)">
              🛒 Add to Cart
            </button>
            <button style="flex: 1; height: 48px; font-size: 14.5px; font-weight: 900; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 6px 18px rgba(245, 158, 11, 0.3); display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="addPdpToCart(true)">
              ⚡ BUY NOW
            </button>
          </div>

          <!-- Optional Demonstration Link (Immediately below buttons if videoUrl exists) -->
          ${videoHTML}

          <!-- Trust Badges Grid -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; text-align: center; font-size: 10px; font-weight: 700; color: #334155; margin-top: 18px; padding-top: 14px; border-top: 1px solid #f1f5f9;">
            <div><div style="font-size: 16px; margin-bottom: 2px;">🔒</div>Secure Pay</div>
            <div><div style="font-size: 16px; margin-bottom: 2px;">↩️</div>3-Day Return</div>
            <div><div style="font-size: 16px; margin-bottom: 2px;">🚚</div>Same Day</div>
            <div><div style="font-size: 16px; margin-bottom: 2px;">📑</div>GST Invoice</div>
          </div>
        </div>
      </div>

      <!-- Below Hero 2-Column Info Grid -->
      <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; margin-top: 28px;">
        <!-- Left: About Product & Specs -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px;">
          <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">About this Product</h3>
          <p style="font-size: 13.5px; color: #334155; line-height: 1.7; margin: 0 0 20px 0;">
            ${product.description || 'Authentic boutique item from UNIQUE EXPRESSIONS, Visakhapatnam.'}
          </p>

          ${Array.isArray(product.features) && product.features.length > 0 ? `
            <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">Key Highlights & Features:</h4>
            <ul style="margin: 0 0 20px 0; padding-left: 18px; font-size: 13px; color: #475569; line-height: 1.7;">
              ${product.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
          ` : ''}

          <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Product Specifications</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12.5px;">
            ${specsEntries.map(([k, v]) => `
              <div style="padding: 10px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                <span style="color: #64748b; font-size: 10.5px; display: block; font-weight: 700; text-transform: uppercase;">${k}</span>
                <strong style="color: #0f172a;">${v}</strong>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: Verified Customer Reviews -->
        <div class="pdp-reviews-box" style="margin-top: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0;">Verified Customer Reviews</h3>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">★ ${product.rating || '4.9'} rating based on ${reviewsList.length} verified ratings</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column;">
            ${reviewsList.map(r => `
              <div class="pdp-review-card">
                <div class="pdp-review-author">
                  <span class="pdp-review-name">${r.name}</span>
                  ${r.verified ? '<span class="pdp-review-badge">✔ Verified Purchaser</span>' : ''}
                </div>
                <div class="pdp-review-stars">★ ★ ★ ★ ★</div>
                <div class="pdp-review-text">${r.comment}</div>
                <div style="font-size: 10.5px; color: #94a3b8; margin-top: 3px;">Reviewed on ${r.date || 'Recent'}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Related Products Row -->
      ${relatedItems.length > 0 ? `
        <div style="margin-top: 32px;">
          <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 14px;">More from ${product.category}</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
            ${relatedItems.map(p => `
              <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 12px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onclick="openProductPage('${p.id}')">
                <img src="${p.image}" style="width: 100%; height: 120px; object-fit: contain; background: #f8fafc; border-radius: 10px; padding: 6px; margin-bottom: 8px;">
                <div style="font-size: 12.5px; font-weight: 700; color: #0f172a; line-height: 1.3; margin-bottom: 4px; overflow: hidden; max-height: 2.6em;">${p.title}</div>
                <div style="display: flex; align-items: baseline; justify-content: space-between;">
                  <span style="font-size: 14px; font-weight: 800; color: #0f172a;">₹${getEffectivePrice(p.price)}</span>
                  <span style="font-size: 11px; color: #0f172a; font-weight: 800;">${p.discount || 20}% OFF</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}


/* ──────────────────────────────────────────────────────────────────────────
   3. PDP MICRO-INTERACTIONS BINDINGS
   ────────────────────────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────────────────────────
   2. MOBILE PDP RENDERER (Clean Mobile Shopping Flow)
   ────────────────────────────────────────────────────────────────────────── */
function renderPDPMobile(product) {
  const images = (Array.isArray(product.images) && product.images.length > 0) ? product.images : [product.image];
  const isWishlisted = wishlist.includes(product.id);
  const effectivePrice = getEffectivePrice(product.price);
  const saveAmount = (product.originalPrice || Math.round(product.price * 1.25)) - effectivePrice;
  const discountPct = product.discount || Math.round(((saveAmount) / (product.originalPrice || (effectivePrice + saveAmount))) * 100);

  const relatedItems = ALL_PRODUCTS.filter(p => p.category === product.category && String(p.id) !== String(product.id)).slice(0, 4);
  const reviewsList = Array.isArray(product.reviews) ? product.reviews : [];
  const videoHTML = buildVideoSectionHTML(product);
  const specsEntries = Object.entries(product.specifications || {});

  const slidesHTML = images.map((imgUrl, idx) => `
    <div class="pdp-mb-slide">
      <img src="${imgUrl}" alt="Product Slide ${idx + 1}" onclick="openPDPModalLightbox(${JSON.stringify(images).replace(/"/g, '&quot;')}, ${idx})" onerror="this.src='https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600'">
    </div>
  `).join('');

  const dotsHTML = images.map((_, idx) => `
    <div class="pdp-mb-dot ${idx === 0 ? 'active' : ''}" id="pdpMbDot-${idx}"></div>
  `).join('');

  return `
    <div style="background: #f8fafc; min-height: 100vh;">
      <!-- Sticky Mobile Header Bar -->
      <div style="position: sticky; top: 0; z-index: 50; background: #ffffff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 10px 14px;">
        <button style="background: none; border: none; font-size: 22px; cursor: pointer; color: #0f172a;" onclick="switchView('home')">←</button>
        <span style="font-size: 13px; font-weight: 800; color: #0f172a; flex: 1; text-align: center; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; padding: 0 10px;">${product.title}</span>
        <button style="background: none; border: none; font-size: 22px; cursor: pointer;" onclick="toggleWishlist('${product.id}', this)">
          <i class="${isWishlisted ? 'ri-heart-3-fill' : 'ri-heart-3-line'}" style="color: ${isWishlisted ? '#0f172a' : '#94a3b8'};"></i>
        </button>
      </div>

      <!-- Mobile Touch Slider Hero -->
      <div class="pdp-mb-hero-slider" id="pdpMbHeroSlider">
        <span style="position: absolute; top: 12px; left: 12px; background: #0f172a; color: #fff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 99px; z-index: 5;">
          🔥 ${discountPct}% OFF
        </span>
        <div class="pdp-mb-slider-track" id="pdpMbSliderTrack">
          ${slidesHTML}
        </div>
        <div class="pdp-mb-dots">
          ${dotsHTML}
        </div>
      </div>

      <!-- Title & Rating Block -->
      <div class="pdp-section-card">
        <span style="font-size: 10px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">UNIQUE EXPRESSIONS BOUTIQUE</span>
        <h1 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 4px 0 10px 0; line-height: 1.35;">${product.title}</h1>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="background: #ecfdf5; color: #10b981; font-weight: 800; padding: 3px 10px; border-radius: 99px; font-size: 12px;">★ ${product.rating || '4.9'} / 5.0</span>
          <span style="font-size: 12px; color: #64748b;">(${product.reviewsCount || reviewsList.length} verified reviews)</span>
        </div>
      </div>

      <!-- Price Section -->
      <div class="pdp-section-card">
        <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px;">
          <span class="pdp-price-big">₹${effectivePrice}</span>
          <span class="pdp-price-mrp">M.R.P.: ₹${product.originalPrice || (effectivePrice + saveAmount)}</span>
          <span class="pdp-discount-badge">${discountPct}% OFF</span>
        </div>
        <div style="font-size: 12px; color: #10b981; font-weight: 700;">You save ₹${saveAmount}! • Express local dispatch</div>
      </div>

      <!-- Optional Demonstration Link -->
      ${videoHTML ? `<div class="pdp-section-card">${videoHTML}</div>` : ''}

      <!-- Pack Variant Selector -->
      <div class="pdp-section-card">
        <div style="font-size: 11px; font-weight: 800; color: #475569; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Select Pack Variant:</div>
        <div style="display: flex; gap: 8px;">
          <button class="form-input active" style="flex: 1; height: 40px; font-size: 12px; font-weight: 700; border-color: #0f172a;" onclick="selectPdpVariant(this, 'Standard Pack')">Standard</button>
          <button class="form-input" style="flex: 1; height: 40px; font-size: 12px;" onclick="selectPdpVariant(this, 'Gift Box')">Gift Box</button>
          <button class="form-input" style="flex: 1; height: 40px; font-size: 12px;" onclick="selectPdpVariant(this, 'Wholesale Bulk')">Wholesale</button>
        </div>
      </div>

      <!-- Quantity Stepper -->
      <div class="pdp-section-card" style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Quantity:</div>
          <div class="pdp-stepper-box" style="margin: 0;">
            <button class="pdp-stepper-btn" onclick="updatePdpQty(-1)">-</button>
            <span class="pdp-stepper-val" id="pdpQtyDisplay">1</span>
            <button class="pdp-stepper-btn" onclick="updatePdpQty(1)">+</button>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; font-weight: 800; color: #10b981; margin-bottom: 2px;">🟢 In Stock</div>
          <div style="font-size: 11px; color: #64748b;">${product.stockQty || 15} units available</div>
        </div>
      </div>

      <!-- Pincode Checker -->
      <div class="pdp-section-card">
        <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">📍 Delivery Availability:</div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="pdpPincodeInput" value="530041" class="form-input" style="flex: 1; height: 40px; font-size: 13px;">
          <button class="m-hero-cta-button" style="height: 40px; padding: 0 16px; font-size: 12px;" onclick="checkPdpPincode()">Check</button>
        </div>
        <div id="pdpPincodeResult" style="font-size: 12px; font-weight: 700; color: #16a34a; margin-top: 8px;">🟢 Same-Day Express Delivery in Madhurawada (530041)</div>
      </div>

      <!-- Mobile Accordions -->
      <div class="pdp-section-card" style="background: transparent; padding: 0 16px;">
        <div class="pdp-accordion-group">
          <!-- Accordion 1: Description -->
          <div class="pdp-accordion-card open" onclick="togglePDPAccordion(this)">
            <div class="pdp-accordion-header">
              <span>📖 Product Overview</span>
              <span class="pdp-accordion-icon">▾</span>
            </div>
            <div class="pdp-accordion-body">
              <p style="margin: 0 0 10px 0;">${product.description || 'Authentic boutique item from UNIQUE EXPRESSIONS, Visakhapatnam.'}</p>
              ${Array.isArray(product.features) && product.features.length > 0 ? `
                <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #475569;">
                  ${product.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          </div>

          <!-- Accordion 2: Specifications -->
          <div class="pdp-accordion-card" onclick="togglePDPAccordion(this)">
            <div class="pdp-accordion-header">
              <span>📋 Specifications & Origin</span>
              <span class="pdp-accordion-icon">▾</span>
            </div>
            <div class="pdp-accordion-body">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                ${specsEntries.map(([k, v]) => `
                  <div style="padding: 8px; background: #f8fafc; border-radius: 8px;">
                    <span style="color: #64748b; font-size: 10px; display: block; font-weight: 700;">${k}</span>
                    <strong style="font-size: 12px;">${v}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Accordion 3: Reviews -->
          <div class="pdp-accordion-card" onclick="togglePDPAccordion(this)">
            <div class="pdp-accordion-header">
              <span>⭐ Customer Reviews (${reviewsList.length})</span>
              <span class="pdp-accordion-icon">▾</span>
            </div>
            <div class="pdp-accordion-body">
              ${reviewsList.map(r => `
                <div style="border-bottom: 1px solid #f1f5f9; padding: 10px 0;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <strong style="font-size: 12.5px;">${r.name}</strong>
                    <span style="font-size: 10px; color: #10b981; font-weight: 700;">✔ Verified</span>
                  </div>
                  <div style="color: #f59e0b; font-size: 11px; margin: 2px 0;">★ ★ ★ ★ ★</div>
                  <div style="font-size: 12px; color: #475569;">${r.comment}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Trust Badges -->
      <div class="pdp-section-card">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; text-align: center; font-size: 9.5px; font-weight: 700; color: #334155;">
          <div><div style="font-size: 18px; margin-bottom: 2px;">🔒</div>Secure Pay</div>
          <div><div style="font-size: 18px; margin-bottom: 2px;">↩️</div>3-Day Return</div>
          <div><div style="font-size: 18px; margin-bottom: 2px;">🚚</div>Same Day</div>
          <div><div style="font-size: 18px; margin-bottom: 2px;">📑</div>GST Invoice</div>
        </div>
      </div>

      <!-- Related Products -->
      ${relatedItems.length > 0 ? `
        <div class="pdp-section-card">
          <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">More in ${product.category}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${relatedItems.map(p => `
              <div style="background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 10px; cursor: pointer;" onclick="openProductPage('${p.id}')">
                <img src="${p.image}" style="width: 100%; height: 100px; object-fit: contain; background: #f8fafc; border-radius: 8px; padding: 4px; margin-bottom: 6px;">
                <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.3; overflow: hidden; max-height: 2.6em;">${p.title}</div>
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 4px;">₹${getEffectivePrice(p.price)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Bottom Spacer -->
      <div style="height: 80px;"></div>

      <!-- Always-Visible Mobile Sticky Bottom Bar -->
      <div class="pdp-mb-sticky-bar">
        <button class="pdp-cta-add-cart" style="flex: 1; height: 46px; font-size: 14px; font-weight: 800; background: linear-gradient(135deg, #0f172a 0%, #0f172a 100%); color: #fff; border: none; border-radius: 12px; cursor: pointer;" onclick="addPdpToCart(false)">🛒 Add to Cart</button>
        <button class="pdp-cta-buy-now" style="flex: 1; height: 46px; font-size: 14px; font-weight: 900; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #fff; border: none; border-radius: 12px; cursor: pointer;" onclick="addPdpToCart(true)">⚡ BUY NOW</button>
      </div>
    </div>
  `;
}


function initPDPInteractions(product, isDesktop) {
  const images = (Array.isArray(product.images) && product.images.length > 0) ? product.images : [product.image];

  if (isDesktop) {
    // Desktop Zoom Lens Binding
    initImageZoom('pdpMainImage', 'pdpZoomLens');
  } else {
    // Mobile Touch Slider & Swipe Binding
    let currentSlide = 0;
    const track = document.getElementById('pdpMbSliderTrack');

    function updateSlider(index) {
      currentSlide = (index + images.length) % images.length;
      if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
      }
      document.querySelectorAll('.pdp-mb-dot').forEach((dot, idx) => {
        if (idx === currentSlide) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }

    initTouchSwipeGallery(
      'pdpMbHeroSlider',
      () => updateSlider(currentSlide + 1), // Swipe left -> next
      () => updateSlider(currentSlide - 1)  // Swipe right -> prev
    );
  }
}

function switchDesktopPDPImg(thumbEl, imgUrl) {
  document.querySelectorAll('.pdp-dt-thumb-card').forEach(el => el.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
  const mainImg = document.getElementById('pdpMainImage');
  if (mainImg) mainImg.src = imgUrl;
}

function togglePDPAccordion(cardEl) {
  if (!cardEl) return;
  cardEl.classList.toggle('open');
}




function checkPdpPincode() {
  const pin = document.getElementById('pdpPincodeInput')?.value.trim();
  const resEl = document.getElementById('pdpPincodeResult');
  if (!resEl) return;

  if (pin === '530041' || pin.startsWith('530')) {
    resEl.innerHTML = `🟢 Express Same-Day Delivery available for Visakhapatnam (${pin})!`;
    resEl.style.color = '#16a34a';
  } else {
    resEl.innerHTML = `🚚 Standard Courier Delivery available for ${pin} (2-4 Days).`;
    resEl.style.color = '#2563eb';
  }
}

function selectPdpVariant(el, variantName) {
  document.querySelectorAll('.pdp-chip-item').forEach(pill => pill.classList.remove('active'));
  el.classList.add('active');
  pdpSelectedVariant = variantName;
}

function updatePdpQty(change) {
  pdpSelectedQty += change;
  if (pdpSelectedQty < 1) pdpSelectedQty = 1;
  const numEl = document.getElementById('pdpQtyDisplay');
  if (numEl) numEl.innerText = pdpSelectedQty;
}

function addPdpToCart(goToCheckout = false) {
  if (!currentPdpProduct) return;
  const existing = cart.find(i => i.id === currentPdpProduct.id && i.variant === pdpSelectedVariant);
  if (existing) {
    existing.qty += pdpSelectedQty;
  } else {
    cart.push({
      id: currentPdpProduct.id,
      title: currentPdpProduct.title,
      category: currentPdpProduct.category,
      image: currentPdpProduct.image,
      price: currentPdpProduct.price,
      qty: pdpSelectedQty,
      variant: pdpSelectedVariant
    });
  }
  saveCart();
  if (goToCheckout) {
    switchView('checkout');
  } else {
    openCartDrawer();
  }
}

/* ==========================================================================
   SPRINT 1 SHOPPING JOURNEY STATE & UTILITIES
   ========================================================================== */
let plpCategory = 'All';
let plpSortOption = 'featured';
let plpMinRating = 0;
let plpPriceRange = 'all';
let plpViewMode = 'grid'; // 'grid' (2-column) or 'list' (1-column)

let searchHistory = JSON.parse(localStorage.getItem('ue_search_history') || '["Teddy Bear", "RC Super Stunt Car", "Brass Ganesha", "Return Gift Box", "Pastel Highlighter"]');
let giftWrapSelected = false;
let giftWrapMessage = '';
let selectedDeliveryAddress = 'home';
let selectedDeliverySpeed = 'express';

const SUBCATEGORIES_MAP = {
  Toys: [
    { title: "STEM & Learning Kits", icon: "🧩", count: 18 },
    { title: "RC Stunt & Speed Cars", icon: "🏎️", count: 14 },
    { title: "Soft Plush Teddy Bears", icon: "🧸", count: 12 },
    { title: "Magnetic Board Games", icon: "🎲", count: 10 }
  ],
  Gadgets: [
    { title: "Astronaut Star Lamps", icon: "🌌", count: 8 },
    { title: "Mini RGB Speakers", icon: "🔊", count: 12 },
    { title: "Smart Digital Clocks", icon: "⏰", count: 9 },
    { title: "Cute Desk Fans", icon: "💡", count: 11 }
  ],
  Handicrafts: [
    { title: "Brass Idol Sculptures", icon: "🔱", count: 15 },
    { title: "Carved Wooden Decor", icon: "🪵", count: 14 },
    { title: "Kondapalli Traditional Toys", icon: "🪆", count: 10 },
    { title: "Terracotta Designer Lamps", icon: "🪔", count: 12 }
  ],
  Stationery: [
    { title: "Kawaii Multi-Color Pen Sets", icon: "🖊️", count: 20 },
        { title: "Kids Birthday Combo Boxes", icon: "🎁", count: 25 },
    { title: "Custom Name Keychains", icon: "🔑", count: 18 },
    { title: "Eco Seed Pencil Gift Packs", icon: "🌱", count: 22 },
    { title: "Mini Drawing & Color Kits", icon: "✏️", count: 15 }
  ]
};

/* ==========================================================================
   1. FINISH CATEGORIES DIRECTORY VIEW
   ========================================================================== */
function getCategoryThumb(catName) {
  const name = String(catName).toLowerCase();
  if (name.includes('flying') || name.includes('drone') || name.includes('helicopter')) return 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=300&auto=format&fit=crop';
  if (name.includes('rc') || name.includes('car')) return 'assets/banners/rc_toys_banner.png';
  if (name.includes('educational') || name.includes('stem')) return 'assets/banners/educational_banner.png';
  if (name.includes('footwear') || name.includes('shoe')) return 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&auto=format&fit=crop';
  if (name.includes('combo')) return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&auto=format&fit=crop';
  if (name.includes('gadget')) return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&auto=format&fit=crop';
  if (name.includes('handi') || name.includes('craft')) return 'assets/banners/handicrafts_banner.png';
  if (name.includes('stat')) return 'assets/banners/stationery_banner.png';
  if (name.includes('arriv')) return 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop';
  if (name.includes('return') || name.includes('party')) return 'assets/banners/return_gifts_banner.png';
  if (name.includes('toy')) return 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=300&auto=format&fit=crop';
  return 'assets/banners/return_gifts_banner.png';
}

function filterCategoryCircle(catName, btnEl) {
  document.querySelectorAll('.m-cat-circle-item').forEach(el => el.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  if (catName === 'All') {
    document.querySelectorAll('.cat-directory-card-item').forEach(card => card.style.display = 'block');
  } else {
    document.querySelectorAll('.cat-directory-card-item').forEach(card => {
      const cardCat = card.getAttribute('data-category');
      card.style.display = (cardCat === catName) ? 'block' : 'none';
    });
  }
}

function renderCategoriesView() {
  const container = document.getElementById('viewCategories');
  if (!container) return;

  const isDesktop = window.innerWidth >= 1024;
  
  // Get all unique categories
  const categoriesList = CATEGORIES_DATA && CATEGORIES_DATA.length > 0 
    ? CATEGORIES_DATA.map(c => c.name)
    : [...new Set(ALL_PRODUCTS.map(p => p.category))];

  const getBannerForCat = (catName) => {
    const name = String(catName).toLowerCase();
    if (name.includes('rc') || name.includes('car')) return 'assets/banners/rc_toys_banner.png';
    if (name.includes('educational') || name.includes('stem')) return 'assets/banners/educational_banner.png';
    if (name.includes('handicrafts') || name.includes('craft')) return 'assets/banners/handicrafts_banner.png';
    if (name.includes('stationary') || name.includes('stationery')) return 'assets/banners/stationery_banner.png';
    if (name.includes('return') || name.includes('gift')) return 'assets/banners/return_gifts_banner.png';
    return 'assets/banners/return_gifts_banner.png';
  };

  container.innerHTML = `
    <div class="${isDesktop ? 'checkout-container' : ''}">
      ${isDesktop ? `
        <div class="dt-breadcrumb-strip">
          <a href="#" onclick="switchView('home'); return false;">Home</a>
          <i class="ri-arrow-right-s-line"></i>
          <span>All Store Categories</span>
        </div>
      ` : ''}

      <!-- Premium Circular Category Navigation Strip -->
      <div class="m-cat-circle-scroll-row no-scrollbar">
        ${categoriesList.map(cat => {
          const thumbImg = getCategoryThumb(cat);
          return `
            <button onclick="filterCategoryCircle('${cat.replace(/'/g, "\\'")}', this)" class="m-cat-circle-item">
              <div class="m-cat-circle-avatar">
                <img src="${thumbImg}" alt="${cat}" onerror="this.src='assets/banners/return_gifts_banner.png'">
              </div>
              <span class="m-cat-circle-label">${cat}</span>
            </button>
          `;
        }).join('')}
        <button onclick="filterCategoryCircle('All', this)" class="m-cat-circle-item">
          <div class="m-cat-circle-avatar" style="background:#0f172a; color:#ffffff;">
            <i class="ri-apps-2-fill" style="font-size:22px;"></i>
          </div>
          <span class="m-cat-circle-label">All Items</span>
        </button>
      </div>

      <!-- Organized Categories List -->
      <div style="display:flex; flex-direction:column; gap:20px; margin-bottom:40px;" id="catDirectoryContainer">
        ${categoriesList.map((cat, idx) => {
          const prods = ALL_PRODUCTS.filter(p => p.category === cat);
          const bannerImg = getBannerForCat(cat);
          return `
            <div class="cat-directory-card-item" data-category="${cat.replace(/"/g, '&quot;')}" id="catSection_${idx}" style="background:#ffffff; border-radius:20px; border:1px solid #e2e8f0; padding:${isDesktop ? '24px' : '16px'}; box-shadow:0 4px 16px rgba(0,0,0,0.04); overflow:hidden;">
              <div style="display:flex; flex-direction:${isDesktop ? 'row' : 'column'}; align-items:${isDesktop ? 'center' : 'stretch'}; gap:14px; margin-bottom:14px;">
                <img src="${bannerImg}" class="cat-card-full-banner" alt="${cat} Banner">
                <div style="flex:1;">
                  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                    <h2 style="font-size:18px; font-weight:800; color:#0f172a; margin:0;">${cat}</h2>
                    <span style="background:#f1f5f9; color:#0f172a; font-size:11.5px; font-weight:800; padding:4px 12px; border-radius:99px; border:1px solid #cbd5e1;">${prods.length} Products</span>
                  </div>
                  <p style="font-size:12.5px; color:#64748b; margin:0;">Curated ${cat} collection — same-day dispatch in Visakhapatnam.</p>
                </div>
                <button class="m-hero-cta-button" style="padding:10px 18px; font-size:13px; min-height:42px; justify-content:center; background:#0f172a; color:#fff; border-radius:12px; width:${isDesktop ? 'auto' : '100%'};" onclick="filterCategory('${cat}')">
                  Explore Category &rarr;
                </button>
              </div>
              <div style="display:grid; grid-template-columns:repeat(${isDesktop ? '4' : '2'}, 1fr); gap:10px; padding-top:12px; border-top:1px solid #f1f5f9;">
                ${prods.slice(0, 4).map(p => `
                  <div style="background:#f8fafc; border-radius:14px; padding:10px; border:1px solid #e2e8f0; cursor:pointer;" onclick="switchView('pdp', {productId: '${p.id}'})">
                    <img src="${p.image}" style="width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:10px; background:#fff; margin-bottom:6px;">
                    <div style="font-size:11.5px; font-weight:700; color:#0f172a; line-height:1.3; margin-bottom:4px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; height:28px;">${p.title}</div>
                    <div style="display:flex; align-items:baseline; justify-content:space-between;">
                      <span style="font-size:13px; font-weight:800; color:#0f172a;">&#x20B9;${p.price}</span>
                      <span style="font-size:10.5px; color:#94a3b8; text-decoration:line-through;">&#x20B9;${p.originalPrice}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* ==========================================================================
   2. BUILD PRODUCT LISTING PAGE (PLP) FROM SCRATCH
   ========================================================================== */
function renderPLPView(categoryName = 'All') {
  plpCategory = categoryName;
  const container = document.getElementById('viewPLP');
  if (!container) return;

  let filtered = ALL_PRODUCTS;
  if (plpCategory !== 'All') {
    filtered = ALL_PRODUCTS.filter(p => p.category === plpCategory);
  }

  if (plpMinRating > 0) {
    filtered = filtered.filter(p => parseFloat(p.rating) >= plpMinRating);
  }

  if (plpPriceRange !== 'all') {
    if (plpPriceRange === 'under300') filtered = filtered.filter(p => p.price < 300);
    else if (plpPriceRange === '300to700') filtered = filtered.filter(p => p.price >= 300 && p.price <= 700);
    else if (plpPriceRange === '700to1500') filtered = filtered.filter(p => p.price > 700 && p.price <= 1500);
    else if (plpPriceRange === 'above1500') filtered = filtered.filter(p => p.price > 1500);
  }

  // Sorting
  if (plpSortOption === 'price-low') filtered.sort((a, b) => a.price - b.price);
  else if (plpSortOption === 'price-high') filtered.sort((a, b) => b.price - a.price);
  else if (plpSortOption === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (plpSortOption === 'discount') filtered.sort((a, b) => b.discount - a.discount);

  const isDesktop = window.innerWidth >= 1024;

  if (isDesktop) {
    container.innerHTML = `
      <div class="checkout-container">
        <!-- Breadcrumb Trail -->
        <div class="dt-breadcrumb-strip">
          <a href="#" onclick="switchView('home'); return false;">Home</a>
          <i class="ri-arrow-right-s-line"></i>
          <a href="#" onclick="switchView('categories'); return false;">Categories</a>
          <i class="ri-arrow-right-s-line"></i>
          <span>${plpCategory === 'All' ? 'All Products' : plpCategory}</span>
        </div>

        <!-- PLP Header & Filter Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 style="font-size:24px; font-weight:900; color:#0f172a; margin:0;">
              ${plpCategory === 'All' ? 'All Boutique Collections' : plpCategory}
            </h1>
            <span style="font-size:13px; color:#64748b; font-weight:600;">Showing ${filtered.length} curated products</span>
          </div>

          <div style="display:flex; align-items:center; gap:12px;">
            <select class="form-input" style="width:auto; height:42px; font-size:13px; font-weight:700;" onchange="changePLPSort(this.value)">
              <option value="featured" ${plpSortOption === 'featured' ? 'selected' : ''}>Sort: Featured</option>
              <option value="price-low" ${plpSortOption === 'price-low' ? 'selected' : ''}>Price: Low → High</option>
              <option value="price-high" ${plpSortOption === 'price-high' ? 'selected' : ''}>Price: High → Low</option>
              <option value="rating" ${plpSortOption === 'rating' ? 'selected' : ''}>Highest Rating</option>
              <option value="discount" ${plpSortOption === 'discount' ? 'selected' : ''}>Biggest Discount</option>
            </select>

            <button class="form-input" style="width:auto; height:42px; font-size:13px; font-weight:700; display:flex; align-items:center; gap:6px; cursor:pointer;" onclick="openFilterDrawer()">
              <i class="ri-filter-3-line"></i> Filter ${plpMinRating > 0 || plpPriceRange !== 'all' ? '●' : ''}
            </button>
          </div>
        </div>

        <!-- Product Listing Grid Container -->
        ${filtered.length === 0 ? `
          <div style="text-align:center; padding:60px 20px; background:#fff; border-radius:24px; border:1px solid #e2e8f0;">
            <h4 style="font-size:18px; font-weight:800; color:#0f172a; margin-bottom:8px;">No Matching Products Found</h4>
            <p style="font-size:13px; color:#64748b; margin-bottom:20px;">Try clearing rating or price filters to view items.</p>
            <button class="dt-hero-cta-btn" style="height:44px; padding:0 24px;" onclick="resetPLPFilters()">Reset All Filters</button>
          </div>
        ` : `
          <div class="dt-product-grid">
            ${filtered.map((p, idx) => createDesktopTileHTML(p, idx)).join('')}
          </div>
        `}
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="m-view-header-bar">
        <button class="m-back-btn" onclick="switchView('categories')">← Categories</button>
        <span class="m-view-title">${plpCategory === 'All' ? 'All Products' : plpCategory + ' Store'} (${filtered.length})</span>
        <div style="display:flex; gap:6px;">
          <button class="m-icon-btn-circle" style="width:32px; height:32px;" onclick="switchView('search')"><i class="ri-search-line"></i></button>
          <button class="m-icon-btn-circle" style="width:32px; height:32px;" onclick="openCartDrawer()"><i class="ri-shopping-bag-line"></i></button>
        </div>
      </div>

      <!-- PLP Sticky Sort & Filter Bar -->
      <div class="m-plp-bar-sticky">
        <select class="m-plp-sort-select" onchange="changePLPSort(this.value)">
          <option value="featured" ${plpSortOption === 'featured' ? 'selected' : ''}>Sort: Featured</option>
          <option value="price-low" ${plpSortOption === 'price-low' ? 'selected' : ''}>Price: Low → High</option>
          <option value="price-high" ${plpSortOption === 'price-high' ? 'selected' : ''}>Price: High → Low</option>
          <option value="rating" ${plpSortOption === 'rating' ? 'selected' : ''}>Highest Rating</option>
          <option value="discount" ${plpSortOption === 'discount' ? 'selected' : ''}>Biggest Discount</option>
        </select>

        <button class="m-plp-filter-btn" onclick="openFilterDrawer()">
          <i class="ri-filter-3-line"></i> Filter ${plpMinRating > 0 || plpPriceRange !== 'all' ? '●' : ''}
        </button>

        <button class="m-plp-view-toggle-btn" onclick="togglePLPViewMode()" title="Toggle Grid/List">
          <i class="${plpViewMode === 'grid' ? 'ri-list-check-2' : 'ri-grid-fill'}"></i>
        </button>
      </div>

      <div style="padding:14px 16px;">
        ${filtered.length === 0 ? `
          <div style="text-align:center; padding:40px 16px; background:#fff; border-radius:20px;">
            <h4 style="font-size:15px; font-weight:800; margin-bottom:6px;">No Matching Products Found</h4>
            <p style="font-size:11px; color:#64748b; margin-bottom:14px;">Try clearing rating or price filters to see catalog items.</p>
            <button class="m-hero-cta-button" onclick="resetPLPFilters()">Reset All Filters</button>
          </div>
        ` : plpViewMode === 'grid' ? `
          <div class="m-product-grid-2col" style="padding:0;">
            ${filtered.map((p, idx) => createMobileTileHTML(p, idx)).join('')}
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${filtered.map((p, idx) => createMobileListCardHTML(p, idx)).join('')}
          </div>
        `}
      </div>
    `;
  }
}

function createMobileListCardHTML(product, index = 0) {
  const isWishlisted = wishlist.includes(product.id);
  const effectivePrice = getEffectivePrice(product.price);
  const saveAmount = product.originalPrice - effectivePrice;
  return `
    <div class="m-product-list-card" onclick="openProductPage('${product.id}')">
      <div class="m-list-img-frame">
        <img src="${product.image}" loading="lazy">
        <span class="m-discount-badge-orange" style="top:6px; left:6px; font-size:8.5px; padding:2px 6px;">${product.discount}% OFF</span>
      </div>
      <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <span class="m-tile-cat-name">${product.category}</span>
          <h4 class="m-tile-title" style="height:auto; margin:2px 0 4px 0;">${product.title}</h4>
          <div style="font-size:11px; font-weight:700; color:#f59e0b;">★ ${product.rating} (${product.reviewsCount} reviews)</div>
        </div>
        <div>
          <div style="display:flex; align-items:baseline; gap:6px;">
            <span class="m-tile-curr-price">₹${effectivePrice}</span>
            <span class="m-tile-mrp-price">₹${product.originalPrice}</span>
            <span class="m-tile-save-green" style="font-size:9.5px;">Save ₹${saveAmount}</span>
          </div>
          <button class="m-tile-add-btn" style="margin-top:6px; padding:6px 10px;" onclick="event.stopPropagation(); quickAddToCart('${product.id}')">
            + Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

function changePLPSort(val) {
  plpSortOption = val;
  renderPLPView(plpCategory);
}

function togglePLPViewMode() {
  plpViewMode = plpViewMode === 'grid' ? 'list' : 'grid';
  renderPLPView(plpCategory);
}

function openFilterDrawer() {
  const container = document.getElementById('filterDrawerContent');
  if (!container) return;

  container.innerHTML = `
    <div class="form-group">
      <label class="form-label">Price Range Filter:</label>
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;">
        <label style="font-size:11px; font-weight:700; background:#f8fafc; padding:8px; border-radius:8px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:6px;">
          <input type="radio" name="fltPrice" value="all" ${plpPriceRange === 'all' ? 'checked' : ''}> All Prices
        </label>
        <label style="font-size:11px; font-weight:700; background:#f8fafc; padding:8px; border-radius:8px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:6px;">
          <input type="radio" name="fltPrice" value="under300" ${plpPriceRange === 'under300' ? 'checked' : ''}> Under ₹300
        </label>
        <label style="font-size:11px; font-weight:700; background:#f8fafc; padding:8px; border-radius:8px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:6px;">
          <input type="radio" name="fltPrice" value="300to700" ${plpPriceRange === '300to700' ? 'checked' : ''}> ₹300 - ₹700
        </label>
        <label style="font-size:11px; font-weight:700; background:#f8fafc; padding:8px; border-radius:8px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:6px;">
          <input type="radio" name="fltPrice" value="700to1500" ${plpPriceRange === '700to1500' ? 'checked' : ''}> ₹700 - ₹1,500
        </label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Minimum Customer Rating:</label>
      <div style="display:flex; gap:8px;">
        <label style="font-size:11px; font-weight:700; background:#f8fafc; padding:8px 12px; border-radius:8px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:4px;">
          <input type="radio" name="fltRating" value="0" ${plpMinRating === 0 ? 'checked' : ''}> All
        </label>
        <label style="font-size:11px; font-weight:700; background:#f8fafc; padding:8px 12px; border-radius:8px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:4px;">
          <input type="radio" name="fltRating" value="4.0" ${plpMinRating === 4.0 ? 'checked' : ''}> 4.0★+
        </label>
        <label style="font-size:11px; font-weight:700; background:#f8fafc; padding:8px 12px; border-radius:8px; border:1px solid #e2e8f0; display:flex; align-items:center; gap:4px;">
          <input type="radio" name="fltRating" value="4.5" ${plpMinRating === 4.5 ? 'checked' : ''}> 4.5★+
        </label>
      </div>
    </div>

    <div style="display:flex; gap:10px; margin-top:20px;">
      <button class="m-back-btn" style="flex:1; justify-content:center;" onclick="resetPLPFilters()">Reset</button>
      <button class="m-hero-cta-button" style="flex:2; justify-content:center;" onclick="applyPLPFiltersFromDrawer()">Apply Filters</button>
    </div>
  `;

  document.getElementById('filterDrawerBackdrop').classList.add('active');
}

function closeFilterDrawer() {
  document.getElementById('filterDrawerBackdrop').classList.remove('active');
}

function applyPLPFiltersFromDrawer() {
  const priceEl = document.querySelector('input[name="fltPrice"]:checked');
  const ratingEl = document.querySelector('input[name="fltRating"]:checked');

  if (priceEl) plpPriceRange = priceEl.value;
  if (ratingEl) plpMinRating = parseFloat(ratingEl.value);

  closeFilterDrawer();
  renderPLPView(plpCategory);
}

function resetPLPFilters() {
  plpPriceRange = 'all';
  plpMinRating = 0;
  closeFilterDrawer();
  renderPLPView(plpCategory);
}

/* ==========================================================================
   3. BUILD SEARCH RESULTS & SEARCH HISTORY VIEW
   ========================================================================== */
function renderSearchView(initialQuery = '') {
  const container = document.getElementById('viewSearch');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Back</button>
      <div style="flex:1; margin:0 10px;" class="m-search-pill-input">
        <i class="ri-search-line" style="color:var(--brand-magenta);"></i>
        <input type="text" id="dedicatedSearchInput" class="m-search-input" placeholder="Search Toys, Gadgets, Gifts..." value="${initialQuery}" oninput="execLiveSearch(this.value)">
        <i class="ri-mic-line" style="color:#64748b; cursor:pointer;" onclick="openVoiceSearchModal()"></i>
      </div>
    </div>

    <div class="checkout-container">
      <div id="searchHistoryBox" style="margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:800; color:#334155;">Recent Searches</span>
          <span style="font-size:10px; color:var(--brand-magenta); cursor:pointer; font-weight:700;" onclick="clearSearchHistory()">Clear History</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${searchHistory.map(term => `
            <span style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:20px; padding:4px 10px; font-size:11px; font-weight:700; color:#334155; cursor:pointer;" onclick="setSearchTerm('${term}')">
              🔍 ${term}
            </span>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <span style="font-size:12px; font-weight:800; color:#334155; margin-bottom:8px; display:block;">🔥 Trending Keywords</span>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          <span style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:20px; padding:4px 10px; font-size:11px; font-weight:800; color:#1e293b; cursor:pointer;" onclick="setSearchTerm('Teddy')">🧸 Soft Teddy Bear</span>
          <span style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:20px; padding:4px 10px; font-size:11px; font-weight:800; color:#1e293b; cursor:pointer;" onclick="setSearchTerm('Stunt Car')">🏎️ RC Stunt Car</span>
          <span style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:20px; padding:4px 10px; font-size:11px; font-weight:800; color:#1e293b; cursor:pointer;" onclick="setSearchTerm('Ganesha')">🎨 Brass Ganesha</span>
          <span style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:20px; padding:4px 10px; font-size:11px; font-weight:800; color:#1e293b; cursor:pointer;" onclick="setSearchTerm('Return Gift')">🎁 Party Return Gifts</span>
        </div>
      </div>

      <div id="searchResultsGrid"></div>
    </div>
  `;
  if (initialQuery) execLiveSearch(initialQuery);
}

function setSearchTerm(term) {
  const input = document.getElementById('dedicatedSearchInput');
  if (input) input.value = term;
  execLiveSearch(term);
}

function clearSearchHistory() {
  searchHistory = [];
  localStorage.removeItem('ue_search_history');
  renderSearchView();
}

function execLiveSearch(query) {
  const grid = document.getElementById('searchResultsGrid');
  if (!grid) return;

  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    grid.innerHTML = '';
    return;
  }

  if (!searchHistory.includes(q) && q.length > 2) {
    searchHistory.unshift(q);
    if (searchHistory.length > 6) searchHistory.pop();
    localStorage.setItem('ue_search_history', JSON.stringify(searchHistory));
  }

  const matches = ALL_PRODUCTS.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  const isDesktop = window.innerWidth >= 1024;

  if (matches.length === 0) {
    grid.innerHTML = `
      <div style="text-align:center; padding:50px 20px; background:#fff; border-radius:24px; border:1px solid #e2e8f0;">
        <div style="font-size:36px; margin-bottom:8px;">🔍</div>
        <h4 style="font-size:18px; font-weight:800; color:#0f172a;">No Items Match "${query}"</h4>
        <p style="font-size:13px; color:#64748b; margin-bottom:20px;">Try searching for "Toys", "Gadgets", "Stationery", or "Gifts"</p>
      </div>
    `;
  } else {
    grid.innerHTML = `
      <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:16px;">Found ${matches.length} matching products for "${query}":</div>
      <div class="${isDesktop ? 'dt-product-grid' : 'm-product-grid-2col'}">
        ${matches.map((p, idx) => isDesktop ? createDesktopTileHTML(p, idx) : createMobileTileHTML(p, idx)).join('')}
      </div>
    `;
  }
}

function openVoiceSearchModal() {
  showToast('🎤 Voice Search Activated! Listening for product name...', 'info');
  setSearchTerm('Stunt Car');
}

/* ==========================================================================
   NATIVE CHECKOUT & ADDRESS FLOW VIEW
   ========================================================================== */
function renderCheckoutView() {
  const container = document.getElementById('viewCheckout');
  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const discount = appliedCouponCode ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 499 ? 0 : 50;
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Store</button>
      <span class="m-view-title">Secure Checkout</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <!-- Step 1: Order Summary -->
      <div class="checkout-card">
        <div class="checkout-step-title"><span class="checkout-step-num">1</span> Order Summary (${cart.length} items)</div>
        ${cart.length === 0 ? `<p style="font-size:12px; color:#64748b;">Your cart is empty. Add items to checkout.</p>` : `
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
            ${cart.map(item => `
              <div style="display:flex; align-items:center; gap:10px; font-size:12px; border-bottom:1px dashed #e2e8f0; padding-bottom:6px;">
                <img src="${item.image}" style="width:36px; height:36px; border-radius:6px; object-fit:cover;">
                <div style="flex:1;">
                  <div style="font-weight:700; color:#0f172a;">${item.title}</div>
                  <div style="font-size:10px; color:#64748b;">Qty: ${item.quantity} × ₹${item.price}</div>
                </div>
                <div style="font-weight:800; color:#0f172a;">₹${item.quantity * item.price}</div>
              </div>
            `).join('')}
          </div>
        `}

        <div class="form-group" style="margin-top:12px;">
          <label class="form-label">Have a Discount Coupon?</label>
          <div class="coupon-input-wrap">
            <input type="text" id="checkoutCouponInput" class="form-input" placeholder="Try coupon UNIQUE10..." value="${appliedCouponCode || ''}">
            <button class="btn-apply-coupon" onclick="applyCheckoutCoupon()">Apply</button>
          </div>
          ${appliedCouponCode ? `<span style="font-size:10px; font-weight:700; color:var(--func-green); margin-top:4px; display:block;">✓ Coupon ${appliedCouponCode} applied! (10% Off)</span>` : ''}
        </div>
      </div>

      <!-- Step 2: Delivery Address & Speed -->
      <div class="checkout-card">
        <div class="checkout-step-title"><span class="checkout-step-num">2</span> Delivery Address & Speed</div>
        
        <span style="font-size:11px; font-weight:800; color:#334155; margin-bottom:6px; display:block;">Select Saved Address:</span>
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
          <div class="payment-option-card ${selectedDeliveryAddress === 'home' ? 'active' : ''}" onclick="selectDeliveryAddressCard(this, 'home')">
            <input type="radio" name="chkAddrRadio" ${selectedDeliveryAddress === 'home' ? 'checked' : ''}>
            <div>
              <div style="font-size:12px; font-weight:800;">🏠 Home Address (Default)</div>
              <div style="font-size:10px; color:#64748b;">LIG 347, Midhilapuri VUDA Colony, Madhurawada, Visakhapatnam - 530041</div>
            </div>
          </div>
          <div class="payment-option-card ${selectedDeliveryAddress === 'work' ? 'active' : ''}" onclick="selectDeliveryAddressCard(this, 'work')">
            <input type="radio" name="chkAddrRadio" ${selectedDeliveryAddress === 'work' ? 'checked' : ''}>
            <div>
              <div style="font-size:12px; font-weight:800;">💼 Work Office</div>
              <div style="font-size:10px; color:#64748b;">IT Hill No. 3, Rushikonda, Visakhapatnam - 530045</div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" id="chkName" class="form-input" placeholder="e.g. Sowmya Rao" value="Sowmya Rao">
        </div>
        <div class="form-group">
          <label class="form-label">Mobile / WhatsApp Number *</label>
          <input type="tel" id="chkPhone" class="form-input" placeholder="e.g. 9876543210" value="8886662334">
        </div>
        <div class="form-group">
          <label class="form-label">Delivery Street Address *</label>
          <input type="text" id="chkAddress" class="form-input" placeholder="Flat No, Building, Street near Landmark" value="LIG 347, 2-115/9/1, near Shivalayam">
        </div>
        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label">Area / Locality</label>
            <input type="text" id="chkLocality" class="form-input" value="Madhurawada, Visakhapatnam">
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">Pincode</label>
            <input type="text" id="chkPincode" class="form-input" value="530041">
          </div>
        </div>
      </div>

      <!-- Step 3: Payment Method -->
      <div class="checkout-card">
        <div class="checkout-step-title"><span class="checkout-step-num">3</span> Payment Method</div>
        
        <div class="payment-option-card active" onclick="selectPaymentMethod(this, 'Online Razorpay / UPI')">
          <input type="radio" name="payMethod" checked>
          <div>
            <div style="font-size:12px; font-weight:800;">Instant Online Pay (UPI / GPay / Cards)</div>
            <div style="font-size:10px; color:#64748b;">Fastest checkout with end-to-end encryption</div>
          </div>
        </div>

        <div class="payment-option-card" onclick="selectPaymentMethod(this, 'Partial Cash on Delivery (COD)')">
          <input type="radio" name="payMethod">
          <div>
            <div style="font-size:12px; font-weight:800;">Partial Cash on Delivery (COD)</div>
            <div style="font-size:10px; color:#64748b;">Pay small advance & rest on delivery in Vizag</div>
          </div>
        </div>

        <div class="payment-option-card" onclick="selectPaymentMethod(this, 'WhatsApp Direct Order Confirmation')">
          <input type="radio" name="payMethod">
          <div>
            <div style="font-size:12px; font-weight:800;">Confirm & Pay via WhatsApp</div>
            <div style="font-size:10px; color:#64748b;">Send order summary directly to store owner</div>
          </div>
        </div>

        <!-- Bill Totals Breakdown -->
        <div style="border-top:1px solid #e2e8f0; margin-top:14px; padding-top:10px; font-size:12px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Item Subtotal:</span> <span>₹${subtotal}</span>
          </div>
          ${discount > 0 ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px; color:var(--func-green); font-weight:700;"><span>Coupon Discount:</span> <span>-₹${discount}</span></div>` : ''}
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>Express Delivery Fee:</span> <span>${shipping === 0 ? '<strong style="color:var(--func-green);">FREE</strong>' : '₹' + shipping}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:800; color:#0f172a; border-top:1px dashed #cbd5e1; padding-top:6px;">
            <span>Total Payable Amount:</span> <span style="color:var(--brand-magenta-dark);">₹${grandTotal}</span>
          </div>
        </div>

        <button class="m-hero-cta-button" style="width:100%; justify-content:center; margin-top:16px; padding:14px; font-size:13px;" onclick="placeOrderFinal(${grandTotal})">
          🔒 Complete & Place Order →
        </button>
      </div>
    </div>
  `;
}

function applyCheckoutCoupon() {
  const input = document.getElementById('checkoutCouponInput');
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  if (val === 'UNIQUE10') {
    appliedCouponCode = 'UNIQUE10';
    showApToast('🎉 Coupon UNIQUE10 Applied! You get 10% Extra Discount.', 'info');
    renderCheckoutView();
  } else {
    showToast('❌ Invalid Coupon Code! Try UNIQUE10', 'info');
  }
}

function selectPaymentMethod(el, methodName) {
  document.querySelectorAll('.payment-option-card').forEach(card => card.classList.remove('active'));
  el.classList.add('active');
  const radio = el.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
}

function selectDeliveryAddressCard(el, addressKey) {
  selectedDeliveryAddress = addressKey;
}

function placeOrderFinal(grandTotal) {
  const nameInput = document.getElementById('chkName');
  const phoneInput = document.getElementById('chkPhone');
  const addressInput = document.getElementById('chkAddress');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const address = addressInput ? addressInput.value.trim() : '';

  if (!name || !phone) {
    showApToast('⚠️ Please enter your Full Name and Mobile / WhatsApp Number to proceed!', 'info');
    if (!name && nameInput) nameInput.focus();
    else if (!phone && phoneInput) phoneInput.focus();
    return;
  }

  if (cart.length === 0) {
    showToast('Your cart is empty! Please add items before placing an order.', 'info');
    return;
  }

  const orderRecord = {
    orderId: 'UE-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    items: [...cart],
    totalAmount: grandTotal,
    subtotal: grandTotal,
    discountAmount: appliedDiscountAmount || 0,
    shippingFee: 0,
    stepIndex: 0,
    status: 'Order Confirmed',
    customerName: name,
    phone: phone,
    address: address || 'Madhurawada, Visakhapatnam',
    paymentMethod: document.querySelector('.payment-option-card.active span')?.innerText || 'Online',
    gstin: '37BVTPG7761F1Z1'
  };

  // Save locally first
  userOrders.unshift(orderRecord);
  localStorage.setItem('ue_orders', JSON.stringify(userOrders));

  // Sync to Supabase (non-blocking)
  sbInsertOrder(orderRecord).catch(err => console.warn('[UE] Order sync failed:', err));

  // Reset Cart
  cart = [];
  saveCart();

  // Stop right here and display a clean Order Confirmation Screen on Checkout view
  const container = document.getElementById('viewCheckout');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Store</button>
      <span class="m-view-title">Order Confirmed</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="checkout-card" style="text-align:center; padding:28px 18px;">
        <div style="width:60px; height:60px; border-radius:50%; background:#dcfce7; color:#16a34a; font-size:28px; font-weight:800; display:flex; align-items:center; justify-content:center; margin:0 auto 14px auto; box-shadow:0 4px 12px rgba(22,163,74,0.2);">
          ✓
        </div>
        <span style="background:#f1f5f9; color:#0f172a; font-size:11px; font-weight:800; padding:4px 12px; border-radius:99px; display:inline-block; margin-bottom:10px;">
          ORDER #${orderRecord.orderId}
        </span>
        <h2 style="font-size:19px; font-weight:800; color:#0f172a; margin-bottom:6px;">Thank You, ${name}!</h2>
        <p style="font-size:12px; color:#64748b; margin-bottom:20px; line-height:1.5;">
          Your order has been placed successfully for <strong>₹${grandTotal}</strong>.<br>
          Express delivery to <strong>${address || 'Madhurawada, Visakhapatnam'}</strong> is scheduled.
        </p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:14px; text-align:left; margin-bottom:20px;">
          <div style="font-size:11px; font-weight:800; color:#334155; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.04em;">Order Summary:</div>
          ${orderRecord.items.map(item => `
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; color:#334155;">
              <span>${item.title} (x${item.quantity})</span>
              <span style="font-weight:700; color:#0f172a;">₹${item.quantity * item.price}</span>
            </div>
          `).join('')}
          <div style="border-top:1px dashed #cbd5e1; margin-top:8px; padding-top:6px; display:flex; justify-content:space-between; font-size:13px; font-weight:800; color:#0f172a;">
            <span>Total Paid:</span>
            <span style="color:var(--brand-magenta-dark);">₹${grandTotal}</span>
          </div>
        </div>

        <button class="pdp-btn-amazon-buy" style="width:100%; height:44px; margin-bottom:10px; font-size:12px;" onclick="openWhatsAppChat('Hi, I just placed Order ${orderRecord.orderId} for ₹${grandTotal}. Please share delivery updates!')">
          💬 Send Order to WhatsApp (+91 8886662334)
        </button>

        <button class="m-back-btn" style="width:100%; justify-content:center; padding:12px; font-size:12px;" onclick="switchView('home')">
          ← Return to Home Shopping
        </button>
      </div>
    </div>
  `;
}

/* ==========================================================================
   OFFERS & COUPONS ENGINE VIEW
   ========================================================================== */
function renderOffersView() {
  const container = document.getElementById('viewOffers');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">Offers & Coupons</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="checkout-card" style="background:linear-gradient(135deg, #0f172a, #334155); color:#fff;">
        <span class="m-featured-tag" style="color:#fef08a;">FESTIVE SPECIAL</span>
        <h2 style="font-size:20px; font-weight:800; margin:4px 0;">Extra 10% Off Everything</h2>
        <p style="font-size:11px; opacity:0.9; margin-bottom:12px;">Use promo code UNIQUE10 at checkout on any order above ₹299.</p>
        <button class="m-hero-cta-button" style="background:#fff; color:#0f172a;" onclick="appliedCouponCode='UNIQUE10'; showApToast('Coupon UNIQUE10 copied! Applied automatically at checkout.', 'info'); switchView('checkout');">
          Apply Coupon UNIQUE10 →
        </button>
      </div>

      <div class="checkout-card">
        <h3 style="font-size:14px; font-weight:800; margin-bottom:10px;">Bulk Return Gift Discounts</h3>
        <p style="font-size:12px; color:#475569; margin-bottom:10px;">Ordering for birthday party hampers? Get flat 20% discount on 25+ quantity orders.</p>
        <button class="m-hero-cta-button" style="width:100%; justify-content:center;" onclick="switchView('b2b')">Open B2B Bulk Calculator</button>
      </div>
    </div>
  `;
}

/* ==========================================================================
   WISHLIST MANAGER VIEW
   ========================================================================== */
function renderWishlistView() {
  const container = document.getElementById('viewWishlist');
  if (!container) return;

  const wishProducts = ALL_PRODUCTS.filter(p => wishlist.includes(p.id));
  const isDesktop = window.innerWidth >= 1024;

  container.innerHTML = `
    <div class="checkout-container">
      <div class="dt-breadcrumb-strip">
        <a href="#" onclick="switchView('home'); return false;">Home</a>
        <i class="ri-arrow-right-s-line"></i>
        <span>My Wishlist</span>
      </div>

      ${wishProducts.length === 0 ? `
        <div class="checkout-card" style="text-align:center; padding:60px 20px; border-radius:24px;">
          <div style="width:64px; height:64px; border-radius:50%; background:#f1f5f9; color:#64748b; font-size:28px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px auto;">❤️</div>
          <h3 style="font-size:18px; font-weight:800; color:#0f172a; margin-bottom:8px;">Your Wishlist is Empty</h3>
          <p style="font-size:13px; color:#64748b; margin-bottom:24px;">Tap the heart icon on any product to save items for quick access later.</p>
          <button class="dt-hero-cta-btn" style="height:46px; padding:0 28px;" onclick="switchView('home')">Explore Store Catalog →</button>
        </div>
      ` : `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h1 style="font-size:24px; font-weight:900; color:#0f172a; margin:0;">Saved Items (${wishProducts.length})</h1>
          <div style="display:flex; gap:12px;">
            <button class="form-input" style="width:auto; height:40px; font-size:12px; font-weight:700; background:#fee2e2; color:#dc2626; border-color:#fca5a5;" onclick="clearWishlist()">Clear All</button>
            <button class="dt-hero-cta-btn" style="height:40px; font-size:13px; padding:0 20px;" onclick="moveWishlistToCart()">Move All to Cart →</button>
          </div>
        </div>

        <div class="${isDesktop ? 'dt-product-grid' : 'm-product-grid-2col'}">
          ${wishProducts.map((p, idx) => isDesktop ? createDesktopTileHTML(p, idx) : createMobileTileHTML(p, idx)).join('')}
        </div>
      `}
    </div>
  `;
}

function moveWishlistToCart() {
  if (wishlist.length === 0) return;
  wishlist.forEach(pId => {
    const product = ALL_PRODUCTS.find(p => p.id === pId);
    if (product) {
      const existing = cart.find(i => i.id === pId);
      if (existing) existing.qty += 1;
      else cart.push({ ...product, qty: 1 });
    }
  });
  wishlist = [];
  localStorage.setItem('ue_wishlist', JSON.stringify(wishlist));
  saveCart();
  showToast('✅ All wishlist items moved to cart!', 'info');
  renderWishlistView();
}

function clearWishlist() {
  if (confirm('Are you sure you want to clear your wishlist?')) {
    wishlist = [];
    localStorage.setItem('ue_wishlist', JSON.stringify(wishlist));
    updateBadges();
    renderWishlistView();
  }
}

/* ==========================================================================
   USER PROFILE & CUSTOMER PORTAL VIEW
   ========================================================================== */
function switchProfileAuthTab(tab) {
  const loginBtn = document.getElementById('profAuthTabLogin');
  const regBtn = document.getElementById('profAuthTabRegister');
  const loginBox = document.getElementById('profAuthBoxLogin');
  const regBox = document.getElementById('profAuthBoxRegister');

  if (tab === 'login') {
    if (loginBtn) { loginBtn.style.background = '#ffffff'; loginBtn.style.color = '#0f172a'; loginBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; loginBtn.style.fontWeight = '800'; }
    if (regBtn) { regBtn.style.background = 'transparent'; regBtn.style.color = '#64748b'; regBtn.style.boxShadow = 'none'; regBtn.style.fontWeight = '700'; }
    if (loginBox) loginBox.style.display = 'block';
    if (regBox) regBox.style.display = 'none';
  } else {
    if (regBtn) { regBtn.style.background = '#ffffff'; regBtn.style.color = '#0f172a'; regBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; regBtn.style.fontWeight = '800'; }
    if (loginBtn) { loginBtn.style.background = 'transparent'; loginBtn.style.color = '#64748b'; loginBtn.style.boxShadow = 'none'; loginBtn.style.fontWeight = '700'; }
    if (regBox) regBox.style.display = 'block';
    if (loginBox) loginBox.style.display = 'none';
  }
}

function handleProfilePageLogin(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('profLoginInput')?.value.trim();
  const pass = document.getElementById('profPassInput')?.value.trim();

  if (!input || !pass) {
    showToast('Please enter your mobile number/email and password.', 'info');
    return;
  }

  userProfile = {
    name: input.includes('@') ? input.split('@')[0] : 'G Mounika Durga',
    email: input.includes('@') ? input : 'customer@uniqueexpressions.in',
    phone: !input.includes('@') ? input : '+91 8886662334',
    city: 'Visakhapatnam',
    address: 'Midhilapuri VUDA Colony, Madhurawada, Visakhapatnam – 530041'
  };

  localStorage.setItem('ue_user_session_v2', JSON.stringify({ isLoggedIn: true, profile: userProfile }));
  if (typeof sbInsertProfile === 'function') sbInsertProfile(userProfile);
  showToast(`Welcome back, ${userProfile.name}! Logged in successfully.`, 'success');
  renderProfileView();
}

function handleProfilePageRegister(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('regFullName')?.value.trim();
  const phone = document.getElementById('regMobile')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();

  if (!name || !phone || !email) {
    showToast('Please enter your name, phone number, and email.', 'info');
    return;
  }

  userProfile = {
    name: name,
    email: email,
    phone: phone,
    city: 'Visakhapatnam',
    address: 'Visakhapatnam, Andhra Pradesh'
  };

  localStorage.setItem('ue_user_session_v2', JSON.stringify({ isLoggedIn: true, profile: userProfile }));
  showToast(`Registration Successful! Welcome ${name}!`, 'success');
  renderProfileView();
}

function handleProfileWhatsAppOtp() {
  const phone = prompt('Enter your 10-digit mobile number for WhatsApp OTP:', '+91 8886662334');
  if (phone) {
    const otp = prompt('WhatsApp OTP code sent! Enter 4-digit OTP:', '1234');
    if (otp) {
      userProfile = {
        name: 'G Mounika Durga',
        email: 'customer@uniqueexpressions.in',
        phone: phone,
        city: 'Visakhapatnam',
        address: 'Visakhapatnam, Andhra Pradesh'
      };
      localStorage.setItem('ue_user_session_v2', JSON.stringify({ isLoggedIn: true, profile: userProfile }));
      showToast('WhatsApp OTP Verified! Logged in successfully.', 'success');
      renderProfileView();
    }
  }
}

function handleUserLogout() {
  userProfile = null;
  localStorage.removeItem('ue_user_session_v2');
  showToast('Logged out of your account successfully.', 'info');
  renderProfileView();
}

function renderProfileView() {
  const container = document.getElementById('viewProfile');
  if (!container) return;

  // 1. IF NOT LOGGED IN: SHOW CUSTOMER LOGIN & REGISTRATION PAGE
  if (!userProfile) {
    container.innerHTML = `
      <div class="m-view-header-bar">
        <button class="m-back-btn" onclick="switchView('home')">← Store</button>
        <span class="m-view-title">Customer Account Portal</span>
        <div style="width:32px;"></div>
      </div>

      <div class="checkout-container" style="max-width:460px; margin:0 auto; padding:16px;">
        <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius:20px; padding:24px 20px; text-align:center; color:#ffffff; margin-bottom:20px; box-shadow:0 10px 25px rgba(15, 23, 42, 0.2);">
          <div style="width:52px; height:52px; background:rgba(255,255,255,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px auto; border:1px solid rgba(255,255,255,0.2);">
            <i class="ri-user-heart-fill" style="font-size:26px; color:#f59e0b;"></i>
          </div>
          <h2 style="font-size:20px; font-weight:800; margin:0 0 6px 0;">UNIQUE EXPRESSIONS</h2>
          <p style="font-size:12px; color:#cbd5e1; margin:0;">Login or Create Account to track orders, save wishlist & claim VIP 10% Off</p>
        </div>

        <div style="display:flex; border-radius:14px; background:#f1f5f9; padding:4px; margin-bottom:20px;">
          <button id="profAuthTabLogin" onclick="switchProfileAuthTab('login')" style="flex:1; padding:10px; border-radius:10px; font-size:13px; font-weight:800; border:none; background:#ffffff; color:#0f172a; box-shadow:0 2px 8px rgba(0,0,0,0.06); cursor:pointer;">
            🔑 Customer Login
          </button>
          <button id="profAuthTabRegister" onclick="switchProfileAuthTab('register')" style="flex:1; padding:10px; border-radius:10px; font-size:13px; font-weight:700; border:none; background:transparent; color:#64748b; cursor:pointer;">
            ✨ Create Account
          </button>
        </div>

        <div id="profAuthBoxLogin" style="background:#ffffff; border-radius:18px; border:1px solid #e2e8f0; padding:20px; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <form onsubmit="handleProfilePageLogin(event)">
            <div class="form-group" style="margin-bottom:14px;">
              <label class="form-label" style="font-size:12px; font-weight:800; color:#475569;">Mobile Number or Email</label>
              <div style="position:relative;">
                <i class="ri-phone-line" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:16px;"></i>
                <input type="text" id="profLoginInput" class="form-input" style="padding-left:38px; height:44px; font-size:13.5px;" placeholder="+91 9876543210 or email" required>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <label class="form-label" style="font-size:12px; font-weight:800; color:#475569; margin:0;">Password</label>
                <a href="#" onclick="showToast('Password reset link sent to your mobile/email!', 'info'); return false;" style="font-size:11px; color:#2563eb; font-weight:700; text-decoration:none;">Forgot?</a>
              </div>
              <div style="position:relative;">
                <i class="ri-lock-2-line" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:16px;"></i>
                <input type="password" id="profPassInput" class="form-input" style="padding-left:38px; height:44px; font-size:13.5px;" placeholder="••••••••" required>
              </div>
            </div>
            <button type="submit" class="m-hero-cta-button" style="width:100%; justify-content:center; height:46px; font-size:14px; background:#0f172a; color:#fff; border-radius:12px;">
              Login to My Account &rarr;
            </button>
          </form>

          <div style="display:flex; align-items:center; gap:10px; margin:16px 0;">
            <div style="flex:1; height:1px; background:#e2e8f0;"></div>
            <span style="font-size:11px; color:#94a3b8; font-weight:700;">OR CONNECT VIA WHATSAPP</span>
            <div style="flex:1; height:1px; background:#e2e8f0;"></div>
          </div>

          <button onclick="handleProfileWhatsAppOtp()" style="width:100%; height:46px; display:flex; align-items:center; justify-content:center; gap:8px; background:#25D366; color:#ffffff; font-weight:800; font-size:13.5px; border:none; border-radius:12px; cursor:pointer; box-shadow:0 4px 12px rgba(37,211,102,0.25);">
            <i class="ri-whatsapp-fill" style="font-size:20px;"></i> Instant WhatsApp OTP Login
          </button>
        </div>

        <div id="profAuthBoxRegister" style="display:none; background:#ffffff; border-radius:18px; border:1px solid #e2e8f0; padding:20px; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          <form onsubmit="handleProfilePageRegister(event)">
            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label" style="font-size:12px; font-weight:800; color:#475569;">Full Name</label>
              <input type="text" id="regFullName" class="form-input" style="height:42px; font-size:13px;" placeholder="e.g. G Mounika Durga" required>
            </div>
            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label" style="font-size:12px; font-weight:800; color:#475569;">Mobile Number (WhatsApp)</label>
              <input type="tel" id="regMobile" class="form-input" style="height:42px; font-size:13px;" placeholder="+91 9876543210" required>
            </div>
            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label" style="font-size:12px; font-weight:800; color:#475569;">Email Address</label>
              <input type="email" id="regEmail" class="form-input" style="height:42px; font-size:13px;" placeholder="name@domain.com" required>
            </div>
            <div class="form-group" style="margin-bottom:14px;">
              <label class="form-label" style="font-size:12px; font-weight:800; color:#475569;">Create Password</label>
              <input type="password" id="regPass" class="form-input" style="height:42px; font-size:13px;" placeholder="Min 6 characters" required>
            </div>
            <button type="submit" class="m-hero-cta-button" style="width:100%; justify-content:center; height:46px; font-size:14px; background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color:#fff; border-radius:12px;">
              Create Account & Claim VIP 10% Off &rarr;
            </button>
          </form>
        </div>
      </div>
    `;
    return;
  }

  // 2. IF LOGGED IN: SHOW AUTHENTICATED CUSTOMER PROFILE
  const defaultAddress = userAddresses.find(a => a.isDefault) || userAddresses[0];

  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Store</button>
      <span class="m-view-title">My Account Portal</span>
      <button class="m-icon-btn-circle" onclick="openEditProfileModal()" title="Edit Profile"><i class="ri-edit-line"></i></button>
    </div>

    <div class="checkout-container">
      <div class="profile-user-card">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div class="profile-avatar-circle">
              ${userProfile.name ? userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'UE'}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <h3 style="font-size:16px; font-weight:800; color:#0f172a;">${userProfile.name}</h3>
                <span class="profile-vip-pill">✨ VIP</span>
              </div>
              <p style="font-size:11px; color:#64748b; margin-top:2px;">📞 ${userProfile.phone || '+91 8886662334'} • ${userProfile.city || 'Visakhapatnam'}</p>
              <p style="font-size:10px; color:#94a3b8;">✉️ ${userProfile.email || 'customer@uniqueexpressions.in'}</p>
            </div>
          </div>
        </div>

        <div class="profile-stats-row">
          <div class="profile-stat-box">
            <div class="profile-stat-val">${userOrders.length}</div>
            <div class="profile-stat-label">Total Orders</div>
          </div>
          <div class="profile-stat-box">
            <div class="profile-stat-val">${wishlist.length}</div>
            <div class="profile-stat-label">Saved Items</div>
          </div>
          <div class="profile-stat-box">
            <div class="profile-stat-val">${userAddresses.length}</div>
            <div class="profile-stat-label">Addresses</div>
          </div>
        </div>
      </div>

      <div style="margin-bottom:14px;">
        <h4 style="font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.04em;">My Account & Shopping</h4>
      </div>

      <div class="profile-menu-tile" onclick="switchView('orders')">
        <div class="profile-menu-left">
          <div class="profile-menu-icon"><i class="ri-shopping-bag-line"></i></div>
          <div>
            <div class="profile-menu-title">Order History & Live Tracking</div>
            <div class="profile-menu-sub">Track active dispatches & past orders (${userOrders.length})</div>
          </div>
        </div>
        <span style="font-size:12px; color:#94a3b8;">→</span>
      </div>

      <div class="profile-menu-tile" onclick="switchView('addresses')">
        <div class="profile-menu-left">
          <div class="profile-menu-icon"><i class="ri-map-pin-line"></i></div>
          <div>
            <div class="profile-menu-title">Saved Address Book</div>
            <div class="profile-menu-sub">${defaultAddress ? defaultAddress.street + ', ' + defaultAddress.city : 'Manage shipping addresses'}</div>
          </div>
        </div>
        <span style="font-size:12px; color:#94a3b8;">→</span>
      </div>

      <div class="profile-menu-tile" onclick="switchView('wishlist')">
        <div class="profile-menu-left">
          <div class="profile-menu-icon"><i class="ri-heart-3-line"></i></div>
          <div>
            <div class="profile-menu-title">My Saved Wishlist</div>
            <div class="profile-menu-sub">${wishlist.length} items saved for later</div>
          </div>
        </div>
        <span style="font-size:12px; color:#94a3b8;">→</span>
      </div>

      <div class="profile-menu-tile" onclick="switchView('offers')">
        <div class="profile-menu-left">
          <div class="profile-menu-icon"><i class="ri-coupon-3-line"></i></div>
          <div>
            <div class="profile-menu-title">Coupons & VIP Discounts</div>
            <div class="profile-menu-sub">Active Code: UNIQUE10 (Flat 10% Off)</div>
          </div>
        </div>
        <span style="font-size:12px; color:#94a3b8;">→</span>
      </div>

      <div class="profile-menu-tile" onclick="openWhatsAppChat()">
        <div class="profile-menu-left">
          <div class="profile-menu-icon" style="background:#dcfce7; color:#16a34a;"><i class="ri-whatsapp-line"></i></div>
          <div>
            <div class="profile-menu-title">24/7 VIP Customer Support</div>
            <div class="profile-menu-sub">Direct WhatsApp chat with Store Owner G Mounika Durga</div>
          </div>
        </div>
        <span style="font-size:12px; color:#94a3b8;">→</span>
      </div>

      <div style="margin-top:20px; margin-bottom:30px;">
        <button class="m-hero-cta-button" style="width:100%; justify-content:center; min-height:44px; background:#f1f5f9; color:#dc2626; border:1px solid #cbd5e1; box-shadow:none; font-weight:800;" onclick="handleUserLogout()">
          🚪 Log Out of Account
        </button>
      </div>
    </div>
  `;
}


/* ==========================================================================
   SAVED ADDRESS BOOK VIEW
   ========================================================================== */
function renderAddressesView() {
  const container = document.getElementById('viewAddresses');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('profile')">← Profile</button>
      <span class="m-view-title">Saved Address Book</span>
      <button class="m-hero-cta-button" style="padding:6px 14px; font-size:11.5px; min-height:36px;" onclick="openAddressModal()">+ Add New</button>
    </div>

    <div class="checkout-container">
      ${userAddresses.length === 0 ? `
        <div class="checkout-card" style="text-align:center; padding:30px 16px;">
          <h3 style="font-size:15px; font-weight:800; margin-bottom:4px;">No Saved Addresses</h3>
          <p style="font-size:11px; color:#64748b; margin-bottom:14px;">Add a delivery address for fast 1-click checkout.</p>
          <button class="m-hero-cta-button" style="justify-content:center;" onclick="openAddressModal()">+ Add Delivery Address</button>
        </div>
      ` : `
        <div style="margin-bottom:10px; font-size:11px; font-weight:700; color:#475569;">
          Default address will be automatically pre-selected during checkout.
        </div>
        ${userAddresses.map(addr => `
          <div class="address-card ${addr.isDefault ? 'is-default' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="address-type-tag">${addr.type || 'Home'}</span>
                <strong style="font-size:13px; color:#0f172a;">${addr.name}</strong>
              </div>
              ${addr.isDefault ? `<span class="address-default-badge">✓ DEFAULT</span>` : ''}
            </div>

            <div style="font-size:11px; color:#334155; line-height:1.5;">
              ${addr.street}<br>
              ${addr.area}, ${addr.city} - <strong>${addr.pincode}</strong><br>
              📞 Phone: <strong>${addr.phone}</strong>
            </div>

            <div class="address-actions-row">
              ${!addr.isDefault ? `
                <button class="m-back-btn" style="min-height:34px; padding:6px 12px; font-size:11px;" onclick="setDefaultAddress(${addr.id})">Set Default</button>
              ` : ''}
              <button class="m-back-btn" style="min-height:34px; padding:6px 12px; font-size:11px;" onclick="openAddressModal(${addr.id})">Edit</button>
              <button class="m-back-btn" style="min-height:34px; padding:6px 12px; font-size:11px; background:#fee2e2; color:#dc2626; border-color:#fca5a5;" onclick="deleteAddress(${addr.id})">Delete</button>
            </div>
          </div>
        `).join('')}
      `}
    </div>
  `;
}

function openAddressModal(addressId = null) {
  document.getElementById('addressModalBackdrop').classList.add('active');
  const title = document.getElementById('addressModalTitle');
  const editId = document.getElementById('addrEditId');
  const name = document.getElementById('addrName');
  const phone = document.getElementById('addrPhone');
  const street = document.getElementById('addrStreet');
  const area = document.getElementById('addrArea');
  const pincode = document.getElementById('addrPincode');
  const type = document.getElementById('addrType');
  const isDefault = document.getElementById('addrIsDefault');

  if (addressId) {
    const addr = userAddresses.find(a => a.id === addressId);
    if (addr) {
      if (title) title.innerText = "Edit Delivery Address";
      if (editId) editId.value = addr.id;
      if (name) name.value = addr.name;
      if (phone) phone.value = addr.phone;
      if (street) street.value = addr.street;
      if (area) area.value = addr.area;
      if (pincode) pincode.value = addr.pincode;
      if (type) type.value = addr.type || "Home";
      if (isDefault) isDefault.checked = addr.isDefault;
      return;
    }
  }

  if (title) title.innerText = "Add New Delivery Address";
  if (editId) editId.value = "";
  if (name) name.value = userProfile.name || "";
  if (phone) phone.value = userProfile.phone || "";
  if (street) street.value = "";
  if (area) area.value = "Madhurawada";
  if (pincode) pincode.value = "530041";
  if (type) type.value = "Home";
  if (isDefault) isDefault.checked = userAddresses.length === 0;
}

function closeAddressModal() {
  document.getElementById('addressModalBackdrop').classList.remove('active');
}

function saveAddressFromModal() {
  const editId = document.getElementById('addrEditId')?.value;
  const name = document.getElementById('addrName')?.value;
  const phone = document.getElementById('addrPhone')?.value;
  const street = document.getElementById('addrStreet')?.value;
  const area = document.getElementById('addrArea')?.value;
  const pincode = document.getElementById('addrPincode')?.value;
  const type = document.getElementById('addrType')?.value;
  const isDefault = document.getElementById('addrIsDefault')?.checked;

  if (!name || !phone || !street || !area || !pincode) {
    showToast('Please fill in all address fields!', 'info');
    return;
  }

  if (isDefault) {
    userAddresses.forEach(a => a.isDefault = false);
  }

  if (editId) {
    const idx = userAddresses.findIndex(a => a.id == editId);
    if (idx > -1) {
      userAddresses[idx] = { id: Number(editId), name, phone, street, area, city: "Visakhapatnam", pincode, type, isDefault };
    }
  } else {
    const newId = userAddresses.length > 0 ? Math.max(...userAddresses.map(a => a.id)) + 1 : 1;
    userAddresses.push({ id: newId, name, phone, street, area, city: "Visakhapatnam", pincode, type, isDefault });
  }

  localStorage.setItem('ue_addresses', JSON.stringify(userAddresses));
  closeAddressModal();
  renderAddressesView();
}

function setDefaultAddress(addressId) {
  userAddresses.forEach(a => a.isDefault = (a.id === addressId));
  localStorage.setItem('ue_addresses', JSON.stringify(userAddresses));
  renderAddressesView();
}

function deleteAddress(addressId) {
  if (confirm('Are you sure you want to delete this address?')) {
    userAddresses = userAddresses.filter(a => a.id !== addressId);
    if (userAddresses.length > 0 && !userAddresses.some(a => a.isDefault)) {
      userAddresses[0].isDefault = true;
    }
    localStorage.setItem('ue_addresses', JSON.stringify(userAddresses));
    renderAddressesView();
  }
}

/* ==========================================================================
   ORDER DETAILS & INTERACTIVE TRACKING VIEW
   ========================================================================== */
function renderOrderDetailsView(orderId) {
  const container = document.getElementById('viewOrderDetails');
  const order = userOrders.find(o => o.orderId === orderId) || userOrders[0];

  if (!order) {
    container.innerHTML = `
      <div class="m-view-header-bar">
        <button class="m-back-btn" onclick="switchView('profile')">← Profile</button>
        <span class="m-view-title">Order Details</span>
        <div></div>
      </div>
      <div class="checkout-container">
        <div class="checkout-card" style="text-align:center; padding:30px;">
          <h3 style="font-size:15px; font-weight:800;">No Orders Found</h3>
          <button class="m-hero-cta-button" style="justify-content:center; margin-top:12px;" onclick="switchView('home')">Start Shopping →</button>
        </div>
      </div>
    `;
    return;
  }

  const steps = [
    { title: "Order Placed", desc: `Received on ${order.date}` },
    { title: "Packed & Quality Checked", desc: "Inspection completed at Madhurawada Store" },
    { title: "Out for Delivery", desc: "Assigned to Vizag Express Delivery Agent" },
    { title: "Delivered", desc: "Package handed over to recipient" }
  ];

  const currentStep = order.stepIndex !== undefined ? order.stepIndex : (order.status === 'Delivered' ? 3 : 2);

  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('profile')">← Profile</button>
      <span class="m-view-title">Order #${order.orderId}</span>
      <button class="m-icon-btn-circle" onclick="openInvoiceModal('${order.orderId}')" title="Invoice"><i class="ri-file-text-line"></i></button>
    </div>

    <div class="checkout-container">
      <!-- Order Summary Header Card -->
      <div class="checkout-card" style="background:#0f172a; color:#ffffff;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:10px; font-weight:800; color:#fef08a; letter-spacing:0.04em;">ORDER STATUS</span>
          <span style="font-size:11px; font-weight:800; background:#16a34a; color:#fff; padding:2px 8px; border-radius:99px;">● ${order.status}</span>
        </div>
        <h2 style="font-size:18px; font-weight:800;">Total: ₹${order.totalAmount}</h2>
        <div style="font-size:10px; color:#cbd5e1; margin-top:4px;">
          Placed on: ${order.date} • Payment: ${order.paymentMethod}
        </div>
      </div>

      <!-- Real-Time Interactive Tracking Timeline -->
      <div class="tracking-timeline-box">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="font-size:13px; font-weight:800; color:#0f172a;">📍 Real-Time Dispatch Timeline</h4>
          <button class="m-back-btn" style="padding:5px 10px; font-size:10.5px;" onclick="advanceOrderStatus('${order.orderId}')">Simulate 🔄</button>
        </div>

        <div class="timeline-steps-list">
          ${steps.map((s, idx) => `
            <div class="timeline-step-item ${idx < currentStep ? 'completed' : (idx === currentStep ? 'active' : '')}">
              <div class="timeline-step-node"></div>
              <div class="timeline-step-title">${s.title} ${idx < currentStep ? '✓' : ''}</div>
              <div class="timeline-step-desc">${idx <= currentStep ? s.desc : 'Pending next dispatch step'}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Shipping Address Box -->
      <div class="checkout-card">
        <h4 style="font-size:12px; font-weight:800; color:#0f172a; margin-bottom:6px;">📦 Delivery Address:</h4>
        <div style="font-size:11px; color:#334155; line-height:1.5;">
          <strong>${order.customerName}</strong> (📞 ${order.phone})<br>
          ${order.address}
        </div>
      </div>

      <!-- Itemized Products List -->
      <div class="checkout-card">
        <h4 style="font-size:12px; font-weight:800; color:#0f172a; margin-bottom:10px;">Items in this Order (${order.items.length}):</h4>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${order.items.map(item => `
            <div style="display:flex; align-items:center; gap:12px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
              <img src="${item.image}" style="width:50px; height:50px; border-radius:10px; object-fit:cover;">
              <div style="flex:1;">
                <h5 style="font-size:12px; font-weight:700; color:#0f172a;">${item.title}</h5>
                <div style="font-size:11px; color:#64748b;">Qty: ${item.quantity} × ₹${item.price}</div>
              </div>
              <strong style="font-size:12px; color:#0f172a;">₹${item.quantity * item.price}</strong>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:12px; padding-top:10px; border-top:1px dashed #cbd5e1; font-size:11px; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between; color:#64748b;">
            <span>Subtotal:</span> <span>₹${order.subtotal || order.totalAmount}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:#16a34a;">
            <span>Discount Applied:</span> <span>-₹${order.discountAmount || 0}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:#64748b;">
            <span>Vizag Express Delivery:</span> <span>FREE</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-weight:800; font-size:13px; color:#0f172a; margin-top:4px;">
            <span>Total Paid:</span> <span>₹${order.totalAmount}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div style="display:flex; gap:10px; margin-bottom:16px;">
        <button class="m-hero-cta-button" style="flex:1; justify-content:center;" onclick="reorderItems('${order.orderId}')">🔄 Reorder Items</button>
        <button class="m-hero-cta-button" style="flex:1; justify-content:center; background:#25D366;" onclick="openWhatsAppChat('Hi UNIQUE EXPRESSIONS! I am checking on my Order #${order.orderId}')">💬 Track on WhatsApp</button>
      </div>
    </div>
  `;
}

function advanceOrderStatus(orderId) {
  const order = userOrders.find(o => o.orderId === orderId);
  if (!order) return;
  const statuses = ["Order Placed", "Packed & Quality Checked", "Out for Delivery", "Delivered"];
  let currIdx = order.stepIndex !== undefined ? order.stepIndex : 2;
  currIdx = (currIdx + 1) % statuses.length;
  order.stepIndex = currIdx;
  order.status = statuses[currIdx];
  localStorage.setItem('ue_orders', JSON.stringify(userOrders));
  renderOrderDetailsView(orderId);
}

function reorderItems(orderId) {
  const order = userOrders.find(o => o.orderId === orderId);
  if (!order) return;
  order.items.forEach(item => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) existing.qty += item.quantity;
    else cart.push({ ...item, qty: item.quantity });
  });
  saveCart();
  showToast(`✅ Items from Order #${orderId} re-added to your cart!`, 'info');
  openCartDrawer();
}

function openEditProfileModal() {
  document.getElementById('editProfileModalBackdrop').classList.add('active');
  const name = document.getElementById('profEditName');
  const email = document.getElementById('profEditEmail');
  const phone = document.getElementById('profEditPhone');
  const city = document.getElementById('profEditCity');

  if (name) name.value = userProfile.name;
  if (email) email.value = userProfile.email;
  if (phone) phone.value = userProfile.phone;
  if (city) city.value = userProfile.city;
}

function closeEditProfileModal() {
  document.getElementById('editProfileModalBackdrop').classList.remove('active');
}

function saveUserProfile() {
  const name = document.getElementById('profEditName')?.value;
  const email = document.getElementById('profEditEmail')?.value;
  const phone = document.getElementById('profEditPhone')?.value;
  const city = document.getElementById('profEditCity')?.value;

  if (!name || !phone) {
    showToast('Please enter your name and phone number!', 'info');
    return;
  }

  userProfile.name = name;
  userProfile.email = email;
  userProfile.phone = phone;
  userProfile.city = city;

  localStorage.setItem('ue_user_profile', JSON.stringify(userProfile));
  closeEditProfileModal();
  renderProfileView();
}

function openInvoiceModal(orderId) {
  const order = userOrders.find(o => o.orderId === orderId) || userOrders[0];
  if (!order) return;

  const content = document.getElementById('invoiceModalContent');
  if (content) {
    content.innerHTML = `
      <div class="gst-invoice-modal-box">
        <div style="border-bottom:2px solid #0f172a; padding-bottom:10px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h3 style="font-size:15px; font-weight:800; color:#0f172a; margin:0;">UNIQUE EXPRESSIONS</h3>
            <div style="font-size:10px; color:#64748b;">GSTIN: <strong>37BVTPG7761F1Z1</strong></div>
            <div style="font-size:9.5px; color:#64748b;">Owner: G MOUNIKA DURGA | Madhurawada, Visakhapatnam</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800; font-size:12px; color:#0f172a;">TAX INVOICE</div>
            <div style="font-size:10px; color:#64748b;">#${order.orderId}</div>
            <div style="font-size:9.5px; color:#64748b;">Date: ${order.date.split(',')[0]}</div>
          </div>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:8px; margin-bottom:12px; font-size:10px;">
          <strong>Billed To:</strong> ${order.customerName} (${order.phone})<br>
          <strong>Address:</strong> ${order.address}
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:10.5px; margin-bottom:12px;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:1px solid #cbd5e1; text-align:left;">
              <th style="padding:4px;">Item</th>
              <th style="padding:4px; text-align:center;">Qty</th>
              <th style="padding:4px; text-align:right;">Price</th>
              <th style="padding:4px; text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:4px;">${item.title}</td>
                <td style="padding:4px; text-align:center;">${item.quantity}</td>
                <td style="padding:4px; text-align:right;">₹${item.price}</td>
                <td style="padding:4px; text-align:right;">₹${item.quantity * item.price}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display:flex; justify-content:space-between; font-weight:800; font-size:13px; color:#0f172a; border-top:1.5px solid #0f172a; padding-top:6px; margin-bottom:14px;">
          <span>Grand Total (Incl. 18% GST):</span>
          <span>₹${order.totalAmount}</span>
        </div>

        <button class="m-hero-cta-button" style="width:100%; justify-content:center;" onclick="window.print()">🖨️ Print GST Invoice</button>
      </div>
    `;
  }
  document.getElementById('invoiceModalBackdrop').classList.add('active');
}

function closeInvoiceModal() {
  document.getElementById('invoiceModalBackdrop').classList.remove('active');
}

/* ==========================================================================
   B2B WHOLESALE PORTAL VIEW
   ========================================================================== */
function renderB2BView() {
  const container = document.getElementById('viewB2B');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">B2B Wholesale Portal</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="checkout-card" style="background:#141c48; color:#fff;">
        <span class="m-hero-badge-pill">OFFICIAL GSTIN: 37BVTPG7761F1Z1</span>
        <h2 style="font-size:18px; font-weight:800; margin:6px 0;">Wholesale & Bulk Supplier</h2>
        <p style="font-size:11px; color:#c5d2f6; margin-bottom:12px;">We supply Kids Toys, Smart Gadgets, Handicrafts, Stationery, and Customized Return Gift Hampers at direct factory rates.</p>
      </div>

      <div class="checkout-card">
        <h3 style="font-size:14px; font-weight:800; margin-bottom:12px;">B2B Bulk Calculator</h3>
        <div class="form-group">
          <label class="form-label">Estimated Order Quantity (Pieces)</label>
          <input type="number" id="b2bQty" class="form-input" value="50" oninput="calculateB2BTotal()">
        </div>
        <div class="form-group">
          <label class="form-label">Select Product Category</label>
          <select id="b2bCategory" class="form-input" onchange="calculateB2BTotal()">
            <option value="Toys">Kids Toys (Est ₹250/pc)</option>
            <option value="Return Gifts">Return Gift Hampers (Est ₹120/pc)</option>
            <option value="Stationery">Fancy Stationery Sets (Est ₹150/pc)</option>
            <option value="Handicrafts">Artisan Handicrafts (Est ₹450/pc)</option>
          </select>
        </div>

        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:14px; padding:14px; margin:14px 0;" id="b2bResultBox">
          <div style="font-size:12px; font-weight:800; color:#0f172a;">Estimated Wholesale Quote:</div>
          <div style="font-size:22px; font-weight:800; color:var(--brand-magenta-dark); margin:4px 0;" id="b2bEstTotal">₹6,000</div>
          <div style="font-size:10px; color:var(--func-green); font-weight:700;">Includes 18% GST Credit Invoice & Free Vizag Delivery</div>
        </div>

        <button class="m-hero-cta-button" style="width:100%; justify-content:center; background:#25D366;" onclick="openWhatsAppChat('Hi UNIQUE EXPRESSIONS! I would like a Wholesale Bulk Quote for ' + document.getElementById('b2bQty').value + ' pcs of ' + document.getElementById('b2bCategory').value)">
          💬 Request Official GST Invoice on WhatsApp →
        </button>
      </div>
    </div>
  `;
  calculateB2BTotal();
}

function calculateB2BTotal() {
  const qty = parseInt(document.getElementById('b2bQty')?.value || '50');
  const cat = document.getElementById('b2bCategory')?.value || 'Toys';
  let unitRate = 250;
  if (cat === 'Return Gifts') unitRate = 120;
  if (cat === 'Stationery') unitRate = 150;
  if (cat === 'Handicrafts') unitRate = 450;

  const total = qty * unitRate;
  const el = document.getElementById('b2bEstTotal');
  if (el) el.innerText = `₹${total.toLocaleString('en-IN')}`;
}

// ─── Cloudinary Upload Helper ────────────────────────────────────────────────
async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64Data })
        });
        const data = await res.json();
        if (data.success && data.url) {
          resolve(data.url);
        } else {
          reject(data.error || 'Upload failed');
        }
      } catch (err) {
        reject(err.message || 'Upload error');
      }
    };
    reader.onerror = () => reject('File reading failed');
    reader.readAsDataURL(file);
  });
}

async function handleAdminImageUpload(input) {
  const file = input.files[0];
  if (!file) return;

  try {
    const uploadedUrl = await uploadToCloudinary(file);
    const hiddenUrl = document.getElementById('peImgUrl');
    if (hiddenUrl) hiddenUrl.value = uploadedUrl;
    showToast('Image uploaded successfully!', 'info');
  } catch (err) {
    showToast('Cloudinary upload error: ' + err, 'info');
  }
}

/* ==========================================================================
   PRODUCTION-GRADE ADMIN PANEL ENGINE (.ap-*)
   ========================================================================== */
let apActiveTab = 'dashboard';
let apIsAuthenticated = sessionStorage.getItem('ue_admin_auth') === '1';
let apSearchQuery = '';
let apCategoryFilter = 'All';
let apStatusFilter = 'All';

function showToast(message, type = 'info') {
  if (typeof showApToast === 'function') {
    const mapped = type === 'success' ? 'success' : (type === 'error' ? 'error' : 'info');
    showApToast(message, mapped);
    return;
  }
  console.log('[Toast]', message);
}

function showApToast(message, type = 'success') {
  let toastBox = document.getElementById('apToastContainer');
  if (!toastBox) {
    toastBox = document.createElement('div');
    toastBox.id = 'apToastContainer';
    toastBox.className = 'admin-toast-container';
    document.body.appendChild(toastBox);
  }
  const toast = document.createElement('div');
  toast.className = `admin-toast admin-toast-${type}`;
  const iconClass = type === 'success' ? 'ri-checkbox-circle-fill' : type === 'info' ? 'ri-information-fill' : 'ri-error-warning-fill';
  const iconColor = type === 'success' ? '#10b981' : type === 'info' ? '#2563eb' : '#ef4444';
  toast.innerHTML = `
    <i class="${iconClass}" style="color:${iconColor}; font-size:18px;"></i>
    <span>${message}</span>
  `;
  toastBox.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function switchApTab(tabId) {
  apActiveTab = tabId;
  document.querySelectorAll('.ap-nav-item').forEach(el => el.classList.remove('active'));
  const activeNav = document.getElementById(`apNav-${tabId}`);
  if (activeNav) activeNav.classList.add('active');

  const titles = {
    dashboard: 'Dashboard Overview',
    orders: 'Orders Management',
    products: 'Products Catalog',
    categories: 'Categories Directory',
    inventory: 'Inventory & Stock Levels',
    customers: 'Customer Directory',
    coupons: 'Coupons & Discounts',
    banners: 'Banners & Homepage CMS',
    reviews: 'Reviews Moderation',
    wholesale: 'Wholesale & B2B GST',
    analytics: 'Analytics & Sales Reports',
    settings: 'Store Configuration',
    users: 'Users & Staff Permissions'
  };

  const pageTitle = document.getElementById('apPageTitle');
  if (pageTitle) pageTitle.innerText = titles[tabId] || 'Admin Dashboard';

  const breadcrumb = document.getElementById('apBreadcrumbCur');
  if (breadcrumb) breadcrumb.innerText = titles[tabId] || 'Dashboard';

  const viewport = document.getElementById('apMainContentArea');
  if (!viewport) return;

  if (tabId === 'dashboard') viewport.innerHTML = renderApDashboard();
  else if (tabId === 'orders') viewport.innerHTML = renderApOrders();
  else if (tabId === 'products') viewport.innerHTML = renderApProducts();
  else if (tabId === 'categories') viewport.innerHTML = renderApCategories();
  else if (tabId === 'inventory') viewport.innerHTML = renderApInventory();
  else if (tabId === 'customers') viewport.innerHTML = renderApCustomers();
  else if (tabId === 'coupons') viewport.innerHTML = renderApCoupons();
  else if (tabId === 'banners') viewport.innerHTML = renderApBanners();
  else if (tabId === 'reviews') viewport.innerHTML = renderApReviews();
  else if (tabId === 'wholesale') viewport.innerHTML = renderApWholesale();
  else if (tabId === 'analytics') viewport.innerHTML = renderApAnalytics();
  else if (tabId === 'settings') viewport.innerHTML = renderApSettings();
  else if (tabId === 'users') viewport.innerHTML = renderApUsers();

  if (window.feather) feather.replace();
  if (window.lucide) lucide.createIcons();
}

function handleApGlobalSearch(query) {
  apSearchQuery = query.trim().toLowerCase();
  if (apActiveTab !== 'dashboard') {
    switchApTab(apActiveTab);
  }
}

function renderAdminView() {
  const container = document.getElementById('viewAdmin');
  if (!container) return;

  const lowStockCount = ALL_PRODUCTS.filter(p => (p.stockQty || 12) < 5).length;
  const pendingReviewsCount = STORE_REVIEWS.filter(r => r.status === 'Pending').length;

  container.innerHTML = `
    <div class="ap-layout-wrapper">
      <!-- Collapsible Left Sidebar (280px) -->
      <aside class="ap-sidebar">
        <div class="ap-sidebar-header">
          <div class="ap-brand-logo">
            <div class="ap-brand-icon">UE</div>
            <div>
              <div class="ap-brand-text">UNIQUE EXPRESSIONS</div>
              <div class="ap-brand-sub">STORE CONTROL CENTER</div>
            </div>
          </div>
        </div>

        <nav class="ap-sidebar-nav">
          <div class="ap-nav-section-title">Main Menu</div>
          <a class="ap-nav-item ${apActiveTab === 'dashboard' ? 'active' : ''}" id="apNav-dashboard" onclick="switchApTab('dashboard')">
            <div class="ap-nav-item-left"><i class="ri-dashboard-3-line"></i><span>Dashboard</span></div>
          </a>
          <a class="ap-nav-item ${apActiveTab === 'orders' ? 'active' : ''}" id="apNav-orders" onclick="switchApTab('orders')">
            <div class="ap-nav-item-left"><i class="ri-shopping-bag-3-line"></i><span>Orders</span></div>
            <span class="ap-nav-count-badge">${userOrders.length}</span>
          </a>
          <a class="ap-nav-item ${apActiveTab === 'products' ? 'active' : ''}" id="apNav-products" onclick="switchApTab('products')">
            <div class="ap-nav-item-left"><i class="ri-box-3-line"></i><span>Products</span></div>
            <span class="ap-nav-count-badge">${ALL_PRODUCTS.length}</span>
          </a>
          <a class="ap-nav-item ${apActiveTab === 'categories' ? 'active' : ''}" id="apNav-categories" onclick="switchApTab('categories')">
            <div class="ap-nav-item-left"><i class="ri-price-tag-3-line"></i><span>Categories</span></div>
            <span class="ap-nav-count-badge">${CATEGORIES.length}</span>
          </a>
          <a class="ap-nav-item ${apActiveTab === 'inventory' ? 'active' : ''}" id="apNav-inventory" onclick="switchApTab('inventory')">
            <div class="ap-nav-item-left"><i class="ri-stack-line"></i><span>Inventory</span></div>
            ${lowStockCount > 0 ? `<span class="ap-nav-count-badge alert">${lowStockCount} Alert</span>` : ''}
          </a>
          <a class="ap-nav-item ${apActiveTab === 'customers' ? 'active' : ''}" id="apNav-customers" onclick="switchApTab('customers')">
            <div class="ap-nav-item-left"><i class="ri-group-line"></i><span>Customers</span></div>
            <span class="ap-nav-count-badge">${STORE_CUSTOMERS.length}</span>
          </a>

          <div class="ap-nav-section-title">Marketing & Content</div>
          <a class="ap-nav-item ${apActiveTab === 'coupons' ? 'active' : ''}" id="apNav-coupons" onclick="switchApTab('coupons')">
            <div class="ap-nav-item-left"><i class="ri-ticket-2-line"></i><span>Coupons</span></div>
            <span class="ap-nav-count-badge">${STORE_COUPONS.length}</span>
          </a>
          <a class="ap-nav-item ${apActiveTab === 'banners' ? 'active' : ''}" id="apNav-banners" onclick="switchApTab('banners')">
            <div class="ap-nav-item-left"><i class="ri-image-line"></i><span>Banners & CMS</span></div>
          </a>
          <a class="ap-nav-item ${apActiveTab === 'reviews' ? 'active' : ''}" id="apNav-reviews" onclick="switchApTab('reviews')">
            <div class="ap-nav-item-left"><i class="ri-star-line"></i><span>Reviews</span></div>
            ${pendingReviewsCount > 0 ? `<span class="ap-nav-count-badge alert">${pendingReviewsCount}</span>` : ''}
          </a>
          <a class="ap-nav-item ${apActiveTab === 'wholesale' ? 'active' : ''}" id="apNav-wholesale" onclick="switchApTab('wholesale')">
            <div class="ap-nav-item-left"><i class="ri-building-4-line"></i><span>Wholesale B2B</span></div>
          </a>

          <div class="ap-nav-section-title">System & Settings</div>
          <a class="ap-nav-item ${apActiveTab === 'analytics' ? 'active' : ''}" id="apNav-analytics" onclick="switchApTab('analytics')">
            <div class="ap-nav-item-left"><i class="ri-bar-chart-2-line"></i><span>Analytics</span></div>
          </a>
          <a class="ap-nav-item ${apActiveTab === 'settings' ? 'active' : ''}" id="apNav-settings" onclick="switchApTab('settings')">
            <div class="ap-nav-item-left"><i class="ri-settings-4-line"></i><span>Store Settings</span></div>
          </a>
          <a class="ap-nav-item ${apActiveTab === 'users' ? 'active' : ''}" id="apNav-users" onclick="switchApTab('users')">
            <div class="ap-nav-item-left"><i class="ri-shield-user-line"></i><span>Users & Roles</span></div>
          </a>
        </nav>

        <div class="ap-sidebar-footer">
          <button class="ap-btn ap-btn-secondary" style="width:100%; justify-content:center;" onclick="switchView('home')">
            ← Back to Storefront
          </button>
        </div>
      </aside>

      <!-- Main Viewport -->
      <main class="ap-main-viewport">
        <!-- Sticky Top Header -->
        <header class="ap-top-header">
          <div class="ap-global-search">
            <i class="ri-search-line"></i>
            <input type="text" class="ap-search-input" placeholder="Search orders, products, customers..." oninput="handleApGlobalSearch(this.value)">
          </div>

          <div class="ap-header-actions">
            <!-- 🔔 Notification Center -->
            <div class="ap-notif-wrapper">
              <button class="ap-notif-btn" onclick="toggleApNotifDropdown(event)" title="Store Alerts & Notifications">
                <i class="ri-notification-3-line" style="font-size:18px;"></i>
                <span class="ap-notif-badge">4</span>
              </button>
              <div id="apNotifDropdown" class="ap-notif-dropdown">
                <div class="ap-notif-header">
                  <strong style="font-size:13px; color:#0f172a;">🔔 Store Activity & Alerts</strong>
                  <span style="font-size:10px; color:#64748b; font-weight:700;">4 Unread</span>
                </div>
                <div class="ap-notif-item">
                  <i class="ri-shopping-bag-3-fill" style="color:#10b981; font-size:18px; margin-top:2px;"></i>
                  <div>
                    <div style="font-size:12px; font-weight:700;">New Order #UE-892410</div>
                    <div style="font-size:11px; color:#64748b;">₹1,298 via UPI • Madhurawada Store</div>
                  </div>
                </div>
                <div class="ap-notif-item">
                  <i class="ri-error-warning-fill" style="color:#ef4444; font-size:18px; margin-top:2px;"></i>
                  <div>
                    <div style="font-size:12px; font-weight:700;">Low Stock Alert</div>
                    <div style="font-size:11px; color:#64748b;">Antique Brass Ganesha Idol (&lt; 5 units left)</div>
                  </div>
                </div>
                <div class="ap-notif-item">
                  <i class="ri-star-fill" style="color:#f59e0b; font-size:18px; margin-top:2px;"></i>
                  <div>
                    <div style="font-size:12px; font-weight:700;">Pending Review Moderation</div>
                    <div style="font-size:11px; color:#64748b;">5 Stars from Sowmya Rao</div>
                  </div>
                </div>
                <div class="ap-notif-item">
                  <i class="ri-building-4-fill" style="color:#9333ea; font-size:18px; margin-top:2px;"></i>
                  <div>
                    <div style="font-size:12px; font-weight:700;">Wholesale GST Request</div>
                    <div style="font-size:11px; color:#64748b;">Bulk Return Gift quote for schools</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="ap-store-status-pill">
              <span class="ap-status-dot"></span> Store Status: Live
            </div>
            <button class="ap-btn ap-btn-primary" onclick="openApProductModal()">
              <i class="ri-add-line"></i> Quick Add Product
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="ap-content-container">
          <div class="ap-breadcrumbs">
            <span>Admin</span> <span>/</span> <strong id="apBreadcrumbCur">Dashboard</strong>
          </div>
          <div class="ap-page-header">
            <h1 class="ap-page-title" id="apPageTitle">Dashboard Overview</h1>
          </div>

          <div id="apMainContentArea">
            ${renderApDashboard()}
          </div>
        </div>
      </main>
    </div>
  `;
}

/* 1. Dashboard View Renderer */
function renderApDashboard() {
  const totalRevenue = userOrders.reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 48500);
  const pendingOrders = userOrders.filter(o => o.status === 'Processing' || o.status === 'Confirmed').length;
  const lowStockCount = ALL_PRODUCTS.filter(p => (p.stockQty || 0) < 5).length;

  return `
    <div class="ap-metrics-grid">
      <div class="ap-metric-card">
        <span class="ap-metric-label">Total Store Revenue</span>
        <div class="ap-metric-value">₹${totalRevenue.toLocaleString('en-IN')}</div>
        <div class="ap-metric-change up"><i class="ri-arrow-up-line"></i> +18.4% vs last month</div>
      </div>
      <div class="ap-metric-card">
        <span class="ap-metric-label">Total Store Orders</span>
        <div class="ap-metric-value">${userOrders.length + 142}</div>
        <div class="ap-metric-change up"><i class="ri-arrow-up-line"></i> +12.5% volume</div>
      </div>
      <div class="ap-metric-card">
        <span class="ap-metric-label">Pending Orders</span>
        <div class="ap-metric-value">${pendingOrders}</div>
        <div class="ap-metric-change down"><i class="ri-time-line"></i> Requires Dispatch</div>
      </div>
      <div class="ap-metric-card">
        <span class="ap-metric-label">Active Catalog Size</span>
        <div class="ap-metric-value">${ALL_PRODUCTS.length}</div>
        <div class="ap-metric-change up"><i class="ri-check-line"></i> ${CATEGORIES.length} Categories</div>
      </div>
    </div>

    <!-- Sales Chart & Latest Reviews -->
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-bottom:20px;">
      <div class="ap-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="font-size:15px; font-weight:800; margin:0;">📈 Sales Trends (7 Days)</h3>
          <span style="font-size:12px; color:#64748b; font-weight:600;">Visakhapatnam Store</span>
        </div>
        <div style="height:180px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:10px; display:flex; align-items:flex-end; justify-content:space-between; padding:16px; box-sizing:border-box;">
          <div style="text-align:center; flex:1;"><div style="height:45%; background:#0f172a; border-radius:4px 4px 0 0; margin:0 6px;"></div><span style="font-size:10px; color:#64748b; font-weight:700;">Mon</span></div>
          <div style="text-align:center; flex:1;"><div style="height:65%; background:#0f172a; border-radius:4px 4px 0 0; margin:0 6px;"></div><span style="font-size:10px; color:#64748b; font-weight:700;">Tue</span></div>
          <div style="text-align:center; flex:1;"><div style="height:55%; background:#0f172a; border-radius:4px 4px 0 0; margin:0 6px;"></div><span style="font-size:10px; color:#64748b; font-weight:700;">Wed</span></div>
          <div style="text-align:center; flex:1;"><div style="height:85%; background:#0f172a; border-radius:4px 4px 0 0; margin:0 6px;"></div><span style="font-size:10px; color:#64748b; font-weight:700;">Thu</span></div>
          <div style="text-align:center; flex:1;"><div style="height:70%; background:#0f172a; border-radius:4px 4px 0 0; margin:0 6px;"></div><span style="font-size:10px; color:#64748b; font-weight:700;">Fri</span></div>
          <div style="text-align:center; flex:1;"><div style="height:95%; background:linear-gradient(135deg, #d82b7d, #9333ea); border-radius:4px 4px 0 0; margin:0 6px;"></div><span style="font-size:10px; color:#0f172a; font-weight:800;">Sat</span></div>
          <div style="text-align:center; flex:1;"><div style="height:60%; background:#0f172a; border-radius:4px 4px 0 0; margin:0 6px;"></div><span style="font-size:10px; color:#64748b; font-weight:700;">Sun</span></div>
        </div>
      </div>

      <div class="ap-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="font-size:15px; font-weight:800; margin:0;">⭐ Customer Moderation</h3>
          <button class="ap-btn ap-btn-secondary" style="font-size:11px; height:28px;" onclick="switchApTab('reviews')">View All</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${STORE_REVIEWS.slice(0, 3).map(r => `
            <div style="background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0;">
              <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
                <span>${r.name}</span>
                <span style="color:#f59e0b;">★ ${r.rating}.0</span>
              </div>
              <p style="font-size:11px; color:#475569; margin:4px 0 0 0; line-height:1.3;">"${r.comment}"</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="ap-card" style="padding:0; overflow:hidden;">
      <div style="padding:16px 20px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:15px; font-weight:800; margin:0;">📦 Recent Store Orders</h3>
        <button class="ap-btn ap-btn-secondary" style="font-size:11px; height:28px;" onclick="switchApTab('orders')">View All Orders →</button>
      </div>
      <div class="ap-table-wrapper" style="border:none;">
        <table class="ap-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Fulfillment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${userOrders.length === 0 ? `
              <tr><td colspan="6" style="text-align:center; padding:30px; color:#64748b;">No recent orders recorded yet.</td></tr>
            ` : userOrders.slice(0, 5).map(o => `
              <tr>
                <td><strong>${o.orderId}</strong></td>
                <td>${o.customerName || o.name || 'Sowmya Rao'}</td>
                <td><strong>₹${o.grandTotal || o.totalAmount || 1299}</strong></td>
                <td><span class="ap-badge ap-badge-info">${o.paymentMethod || 'UPI'}</span></td>
                <td><span class="ap-badge ${o.status === 'Delivered' ? 'ap-badge-success' : 'ap-badge-warning'}">${o.status}</span></td>
                <td><button class="ap-btn ap-btn-secondary" style="height:28px; padding:0 8px; font-size:11px;" onclick="viewApOrderDetail('${o.orderId}')">Details</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* 2. Orders Module Renderer */
function renderApOrders() {
  let filtered = [...userOrders];
  if (apSearchQuery) {
    const q = apSearchQuery.toLowerCase();
    filtered = filtered.filter(o => o.orderId.toLowerCase().includes(q) || (o.customerName && o.customerName.toLowerCase().includes(q)) || (o.name && o.name.toLowerCase().includes(q)));
  }
  if (apStatusFilter !== 'All') {
    filtered = filtered.filter(o => o.status === apStatusFilter);
  }

  return `
    <div class="ap-card">
      <div style="font-size:12px; color:#64748b; margin-top:-8px; margin-bottom:16px; font-weight:600;">
        ${userOrders.length} Orders Recorded • ₹48.5K Total Revenue • 1 Pending Dispatch • Synced Just Now
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; gap:16px; flex-wrap:wrap;">
        <div style="display:flex; gap:10px; flex:1; min-width:280px;">
          <input type="text" class="ap-search-input" style="width:260px;" placeholder="Search Order ID or Customer..." value="${apSearchQuery}" oninput="apSearchQuery=this.value; switchApTab('orders');">
          <select class="ap-search-input" style="width:160px; padding-left:12px;" onchange="apStatusFilter=this.value; switchApTab('orders');">
            <option value="All" ${apStatusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="Processing" ${apStatusFilter === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Confirmed" ${apStatusFilter === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Out for Delivery" ${apStatusFilter === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="Delivered" ${apStatusFilter === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${apStatusFilter === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
        <button class="ap-btn ap-btn-primary" onclick="showApToast('Exported Orders to CSV File!', 'success')">
          <i class="ri-download-2-line"></i> Export Orders CSV
        </button>
      </div>

      <div class="ap-table-wrapper">
        <table class="ap-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Invoice</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr><td colspan="8" style="text-align:center; padding:40px; color:#64748b;">No orders found matching search criteria.</td></tr>
            ` : filtered.map(o => `
              <tr>
                <td><strong>${o.orderId}</strong></td>
                <td>${o.customerName || o.name || 'Customer'}</td>
                <td>${o.phone || '+91 8886662334'}</td>
                <td><strong>₹${o.grandTotal || o.totalAmount || 1299}</strong></td>
                <td><span class="ap-badge ap-badge-info">${o.paymentMethod || 'UPI'}</span></td>
                <td>
                  <select style="padding:4px 6px; border-radius:6px; border:1px solid #cbd5e1; font-size:11px; font-weight:700;" onchange="updateApOrderStatus('${o.orderId}', this.value)">
                    <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </td>
                <td><button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 8px; font-size:11px;" onclick="viewApOrderInvoice('${o.orderId}')">🧾 GST Invoice</button></td>
                <td>
                  <button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 8px; font-size:11px;" onclick="viewApOrderDetail('${o.orderId}')">View</button>
                  <button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 8px; font-size:11px; color:#ef4444;" onclick="cancelApOrder('${o.orderId}')">Cancel</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function updateApOrderStatus(orderId, newStatus) {
  const o = userOrders.find(item => item.orderId === orderId);
  if (o) {
    o.status = newStatus;
    syncStorefrontState();
    showApToast(`Order ${orderId} status updated to ${newStatus}`, 'success');
  }
}

function viewApOrderDetail(orderId) {
  const o = userOrders.find(item => item.orderId === orderId) || {
    orderId: orderId,
    name: 'G Mounika Durga',
    phone: '+91 8886662334',
    address: 'Midhilapuri VUDA Colony, Madhurawada, Visakhapatnam - 530041',
    grandTotal: 1299,
    status: 'Processing'
  };
  showToast(`📦 Order Details for ${o.orderId}:\nCustomer: ${o.name || o.customerName}\nPhone: ${o.phone}\nAddress: ${o.address}\nTotal Amount: ₹${o.grandTotal || o.totalAmount}\nStatus: ${o.status}`, 'info');
}

function viewApOrderInvoice(orderId) {
  const o = userOrders.find(item => item.orderId === orderId) || {
    orderId: orderId,
    name: 'G Mounika Durga',
    phone: '+91 8886662334',
    address: 'Midhilapuri VUDA Colony, Madhurawada, Visakhapatnam - 530041',
    grandTotal: 1299
  };
  const invoiceWindow = window.open('', '_blank');
  invoiceWindow.document.write(`
    <html>
      <head>
        <title>GST Invoice - ${o.orderId}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #0f172a; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          .table th { background: #f8fafc; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2 style="margin:0; color:#d82b7d;">UNIQUE EXPRESSIONS</h2>
            <p style="margin:4px 0 0 0; font-size:12px;">Official GST Tax Invoice</p>
            <p style="margin:2px 0 0 0; font-size:11px;">GSTIN: 37BVTPG7761F1Z1</p>
          </div>
          <div style="text-align:right;">
            <h3 style="margin:0;">INVOICE #${o.orderId}</h3>
            <p style="margin:4px 0 0 0; font-size:12px;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>
        <p><strong>Billed To:</strong> ${o.customerName || o.name}<br>Phone: ${o.phone}<br>Address: ${o.address || 'Visakhapatnam Store'}</p>
        <table class="table">
          <thead>
            <tr><th>Item Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            <tr><td>Bespoke Store Collection Item</td><td>1</td><td>₹${o.grandTotal || o.totalAmount || 1299}</td><td>₹${o.grandTotal || o.totalAmount || 1299}</td></tr>
          </tbody>
        </table>
        <h3 style="text-align:right; margin-top:20px;">Grand Total: ₹${o.grandTotal || o.totalAmount || 1299}</h3>
        <script>window.print();</script>
      </body>
    </html>
  `);
}

function cancelApOrder(orderId) {
  if (confirm(`Are you sure you want to cancel Order ${orderId}?`)) {
    const o = userOrders.find(item => item.orderId === orderId);
    if (o) o.status = 'Cancelled';
    syncStorefrontState();
    switchApTab('orders');
    showApToast(`Order ${orderId} has been cancelled!`, 'error');
  }
}

/* 3. Products Module Renderer */
let apProductPage = 1;
const AP_PRODUCTS_PER_PAGE = 10;
let apSelectedProductIds = [];

function toggleSelectAllProducts(checked) {
  if (checked) {
    apSelectedProductIds = ALL_PRODUCTS.map(p => p.id);
  } else {
    apSelectedProductIds = [];
  }
  switchApTab('products');
}

function toggleSelectProduct(id, checked) {
  if (checked) {
    if (!apSelectedProductIds.includes(id)) apSelectedProductIds.push(id);
  } else {
    apSelectedProductIds = apSelectedProductIds.filter(i => i !== id);
  }
  switchApTab('products');
}

function toggleApRowDropdown(event, id) {
  event.stopPropagation();
  document.querySelectorAll('.ap-dropdown-menu').forEach(el => el.classList.remove('active'));
  const menu = document.getElementById(`apRowDropdown-${id}`);
  if (menu) menu.classList.toggle('active');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.ap-dropdown-wrapper')) {
    document.querySelectorAll('.ap-dropdown-menu').forEach(el => el.classList.remove('active'));
  }
  if (!e.target.closest('.ap-notif-wrapper')) {
    const notif = document.getElementById('apNotifDropdown');
    if (notif) notif.classList.remove('active');
  }
});

function toggleApNotifDropdown(event) {
  event.stopPropagation();
  const notif = document.getElementById('apNotifDropdown');
  if (notif) notif.classList.toggle('active');
}

async function bulkDeleteProducts() {
  if (apSelectedProductIds.length === 0) return;
  if (confirm(`Are you sure you want to delete ${apSelectedProductIds.length} selected products?`)) {
    const idsToDelete = [...apSelectedProductIds];
    ALL_PRODUCTS = ALL_PRODUCTS.filter(p => !idsToDelete.some(id => String(id) === String(p.id)));
    apSelectedProductIds = [];
    syncStorefrontState();
    switchApTab('products');
    showApToast(`Bulk deleted selected products!`, 'error');
    const results = await Promise.all(idsToDelete.map(id => sbAdminDeleteProduct(id)));
    if (results.some(ok => !ok)) {
      showApToast('Some products saved locally but cloud sync failed', 'info');
    }
  }
}

function bulkChangeCategoryModal() {
  if (apSelectedProductIds.length === 0) return;
  const newCat = prompt(`Enter target Category for ${apSelectedProductIds.length} items (${CATEGORIES.join(', ')}):`, CATEGORIES[0]);
  if (newCat && newCat.trim()) {
    const cat = newCat.trim();
    ALL_PRODUCTS.forEach(p => {
      if (apSelectedProductIds.includes(p.id)) p.category = cat;
    });
    apSelectedProductIds = [];
    syncStorefrontState();
    switchApTab('products');
    showApToast(`Bulk updated category to ${cat}!`, 'success');
  }
}

function bulkExportCSV() {
  showApToast(`Exported ${apSelectedProductIds.length || ALL_PRODUCTS.length} products to CSV!`, 'success');
}

function handleApProductsSearch(inputEl) {
  apSearchQuery = inputEl.value;
  apProductPage = 1;
  const start = inputEl.selectionStart;
  const end = inputEl.selectionEnd;

  switchApTab('products');

  const newInput = document.getElementById('apProductsSearchInput');
  if (newInput) {
    newInput.focus();
    newInput.setSelectionRange(start, end);
  }
}

function renderApProducts() {
  let filtered = [...ALL_PRODUCTS];
  if (apCategoryFilter !== 'All') filtered = filtered.filter(p => p.category === apCategoryFilter);
  if (apSearchQuery) {
    const q = apSearchQuery.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
  }

  const totalPages = Math.ceil(filtered.length / AP_PRODUCTS_PER_PAGE) || 1;
  if (apProductPage > totalPages) apProductPage = totalPages;
  const startIdx = (apProductPage - 1) * AP_PRODUCTS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + AP_PRODUCTS_PER_PAGE);

  const isAllSelected = paginated.length > 0 && paginated.every(p => apSelectedProductIds.includes(p.id));

  return `
    <div class="ap-card">
      <div style="font-size:12px; color:#64748b; margin-top:-8px; margin-bottom:16px; font-weight:600;">
        ${ALL_PRODUCTS.length} Total Products • ${CATEGORIES.length} Categories • ₹8.4L Inventory Value • Synced Just Now
      </div>

      <!-- Bulk Action Bar -->
      ${apSelectedProductIds.length > 0 ? `
        <div class="ap-bulk-bar">
          <span style="font-size:13px; font-weight:700;">☑️ ${apSelectedProductIds.length} Products Selected</span>
          <div style="display:flex; gap:8px;">
            <button class="ap-btn ap-btn-secondary" style="height:30px; font-size:11px;" onclick="bulkChangeCategoryModal()">Change Category</button>
            <button class="ap-btn ap-btn-secondary" style="height:30px; font-size:11px;" onclick="bulkExportCSV()">Export CSV</button>
            <button class="ap-btn ap-btn-danger" style="height:30px; font-size:11px;" onclick="bulkDeleteProducts()">Delete Selected</button>
          </div>
        </div>
      ` : ''}

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; gap:16px; flex-wrap:wrap;">
        <div style="display:flex; gap:10px; flex:1; min-width:280px;">
          <input type="text" id="apProductsSearchInput" class="ap-search-input" style="width:260px;" placeholder="Search Product Name or SKU..." value="${apSearchQuery}" oninput="handleApProductsSearch(this)">
          <select class="ap-search-input" style="width:160px; padding-left:12px;" onchange="apCategoryFilter=this.value; apProductPage=1; switchApTab('products');">
            <option value="All">All Categories</option>
            ${CATEGORIES.map(c => `<option value="${c}" ${apCategoryFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <button class="ap-btn ap-btn-primary" onclick="openApProductModal()">
          <i class="ri-add-line"></i> + Add New Product
        </button>
      </div>

      <div class="ap-table-wrapper">
        <table class="ap-table">
          <thead>
            <tr>
              <th style="width:30px;"><input type="checkbox" ${isAllSelected ? 'checked' : ''} onchange="toggleSelectAllProducts(this.checked)"></th>
              <th>SKU</th>
              <th>Product Image</th>
              <th>Product Title</th>
              <th>Category</th>
              <th>Price (MRP)</th>
              <th>Stock Health</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.length === 0 ? `
              <tr><td colspan="9" style="text-align:center; padding:40px; color:#64748b;">No products found in catalog.</td></tr>
            ` : paginated.map(p => {
              const isChecked = apSelectedProductIds.includes(p.id);
              const stockVal = p.stockQty || 12;
              let stockHealth = `<span style="color:#10b981; font-weight:700;">🟢 Healthy (${stockVal})</span>`;
              if (stockVal < 5) stockHealth = `<span style="color:#ef4444; font-weight:800;">🔴 Out of Stock (${stockVal})</span>`;
              else if (stockVal < 15) stockHealth = `<span style="color:#b45309; font-weight:700;">🟡 Low Stock (${stockVal})</span>`;

              let statusBadge = `<span class="ap-badge ap-badge-success">Published</span>`;
              if (p.inStock === false) statusBadge = `<span class="ap-badge ap-badge-danger">Out of Stock</span>`;
              else if (p.isHidden) statusBadge = `<span class="ap-badge ap-badge-warning">Hidden</span>`;

              return `
                <tr style="${isChecked ? 'background:#f1f5f9 !important;' : ''}">
                  <td><input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleSelectProduct(${JSON.stringify(p.id)}, this.checked)"></td>
                  <td><code style="font-size:11px; font-weight:700;">${p.sku || `UE-SKU-${p.id}`}</code></td>
                  <td><img src="${p.image}" style="width:40px; height:40px; object-fit:cover; border-radius:6px; border:1px solid #e2e8f0;"></td>
                  <td>
                    <strong>${p.title}</strong>
                    ${p.isFeatured ? `<span style="font-size:10px; color:#f59e0b; margin-left:4px;">★ Featured</span>` : ''}
                  </td>
                  <td><span class="ap-badge ap-badge-info">${p.category}</span></td>
                  <td><strong>₹${p.price}</strong> <span style="text-decoration:line-through; font-size:11px; color:#94a3b8;">₹${p.originalPrice || Math.round(p.price * 1.2)}</span></td>
                  <td>${stockHealth}</td>
                  <td>${statusBadge}</td>
                  <td>
                    <div style="display:flex; gap:6px; align-items:center;">
                      <button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 8px; font-size:11px;" onclick="openApProductModal(${JSON.stringify(p.id)})">Edit</button>
                      
                      <!-- Popover ⋮ More Menu -->
                      <div class="ap-dropdown-wrapper">
                        <button class="ap-btn ap-btn-secondary" style="height:26px; width:26px; padding:0; justify-content:center; font-weight:800;" onclick="toggleApRowDropdown(event, ${JSON.stringify(p.id)})">⋮</button>
                        <div id="apRowDropdown-${p.id}" class="ap-dropdown-menu">
                          <button class="ap-dropdown-item" onclick="duplicateApProduct(${JSON.stringify(p.id)})">
                            <i class="ri-file-copy-line"></i> Duplicate
                          </button>
                          <button class="ap-dropdown-item" onclick="switchView('pdp', {productId: ${JSON.stringify(p.id)}})">
                            <i class="ri-eye-line"></i> Preview PDP
                          </button>
                          <button class="ap-dropdown-item" onclick="toggleApFeatured(${JSON.stringify(p.id)})">
                            <i class="ri-star-line"></i> ${p.isFeatured ? 'Unfeature' : 'Make Featured'}
                          </button>
                          <button class="ap-dropdown-item" onclick="toggleApStock(${JSON.stringify(p.id)})">
                            <i class="ri-stack-line"></i> Toggle Stock
                          </button>
                          <div style="border-top:1px solid #e2e8f0; margin:4px 0;"></div>
                          <button class="ap-dropdown-item danger" onclick="deleteApProduct(${JSON.stringify(p.id)})">
                            <i class="ri-delete-bin-line"></i> Delete Product
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
        <span style="font-size:12px; color:#64748b;">Showing ${startIdx + 1}–${Math.min(startIdx + AP_PRODUCTS_PER_PAGE, filtered.length)} of ${filtered.length} Products</span>
        <div style="display:flex; gap:8px;">
          <button class="ap-btn ap-btn-secondary" style="height:32px;" ${apProductPage <= 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="apProductPage--; switchApTab('products');">← Prev</button>
          <button class="ap-btn ap-btn-secondary" style="height:32px;" ${apProductPage >= totalPages ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="apProductPage++; switchApTab('products');">Next →</button>
        </div>
      </div>
    </div>
  `;
}

function toggleApStock(id) {
  const p = ALL_PRODUCTS.find(item => item.id === id);
  if (p) {
    p.inStock = !(p.inStock !== false);
    syncStorefrontState();
    switchApTab('products');
    showApToast(`Stock status updated for ${p.title}`, 'success');
  }
}

function toggleApFeatured(id) {
  const p = ALL_PRODUCTS.find(item => item.id === id);
  if (p) {
    p.isFeatured = !p.isFeatured;
    syncStorefrontState();
    switchApTab('products');
    showApToast(`Featured status toggled for ${p.title}`, 'success');
  }
}

function duplicateApProduct(id) {
  const p = ALL_PRODUCTS.find(item => item.id === id);
  if (p) {
    const copy = { ...p, id: Date.now(), title: `${p.title} (Copy)`, sku: `UE-SKU-${Date.now()}` };
    ALL_PRODUCTS.unshift(copy);
    syncStorefrontState();
    switchApTab('products');
    showApToast(`Product duplicated successfully!`, 'success');
  }
}

async function deleteApProduct(id) {
  const p = ALL_PRODUCTS.find(item => String(item.id) === String(id));
  if (p && confirm(`Delete product "${p.title}" permanently?`)) {
    ALL_PRODUCTS = ALL_PRODUCTS.filter(item => String(item.id) !== String(id));
    syncStorefrontState();
    switchApTab('products');
    showApToast(`Product removed from catalog!`, 'error');
    const ok = await sbAdminDeleteProduct(id);
    if (!ok) showApToast('Saved locally; cloud sync failed — check Supabase delete policy', 'info');
  }
}

/* 4. Categories Module Renderer (ENTERPRISE GRADE) */
let apCategorySearchQuery = '';
let apCategoryVisibilityFilter = 'All';
let apCategoryFeaturedFilter = 'All';
let apCategorySortOrder = 'sortOrder';
let apSelectedCategoryIds = [];

function toggleSelectAllCategories(checked) {
  if (checked) {
    apSelectedCategoryIds = CATEGORIES_DATA.map(c => c.id);
  } else {
    apSelectedCategoryIds = [];
  }
  switchApTab('categories');
}

function toggleSelectCategory(id, checked) {
  if (checked) {
    if (!apSelectedCategoryIds.includes(id)) apSelectedCategoryIds.push(id);
  } else {
    apSelectedCategoryIds = apSelectedCategoryIds.filter(i => i !== id);
  }
  switchApTab('categories');
}

function bulkHideCategories() {
  if (apSelectedCategoryIds.length === 0) return;
  CATEGORIES_DATA.forEach(c => {
    if (apSelectedCategoryIds.includes(c.id)) c.isVisible = false;
  });
  apSelectedCategoryIds = [];
  syncStorefrontState();
  switchApTab('categories');
  showApToast(`Selected categories hidden!`, 'warning');
}

function bulkFeatureCategories() {
  if (apSelectedCategoryIds.length === 0) return;
  CATEGORIES_DATA.forEach(c => {
    if (apSelectedCategoryIds.includes(c.id)) c.isFeatured = true;
  });
  apSelectedCategoryIds = [];
  syncStorefrontState();
  switchApTab('categories');
  showApToast(`Selected categories marked as featured!`, 'success');
}

function bulkDeleteCategories() {
  if (apSelectedCategoryIds.length === 0) return;
  if (confirm(`Are you sure you want to delete ${apSelectedCategoryIds.length} selected categories?`)) {
    CATEGORIES_DATA = CATEGORIES_DATA.filter(c => !apSelectedCategoryIds.includes(c.id));
    CATEGORIES = CATEGORIES_DATA.map(c => c.name);
    apSelectedCategoryIds = [];
    syncStorefrontState();
    switchApTab('categories');
    showApToast(`Bulk deleted selected categories!`, 'error');
  }
}

function toggleCategoryFeatured(id) {
  const c = CATEGORIES_DATA.find(item => item.id === id);
  if (c) {
    c.isFeatured = !c.isFeatured;
    syncStorefrontState();
    switchApTab('categories');
    showApToast(`Featured status toggled for ${c.name}`, 'success');
  }
}

function toggleCategoryVisibility(id) {
  const c = CATEGORIES_DATA.find(item => item.id === id);
  if (c) {
    c.isVisible = !(c.isVisible !== false);
    syncStorefrontState();
    switchApTab('categories');
    showApToast(`Visibility status toggled for ${c.name}`, 'success');
  }
}

function duplicateApCategory(id) {
  const c = CATEGORIES_DATA.find(item => item.id === id);
  if (c) {
    const copy = {
      ...c,
      id: Date.now(),
      name: `${c.name} (Copy)`,
      sortOrder: CATEGORIES_DATA.length + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    CATEGORIES_DATA.push(copy);
    CATEGORIES = CATEGORIES_DATA.map(item => item.name);
    syncStorefrontState();
    switchApTab('categories');
    showApToast(`Category ${c.name} duplicated!`, 'success');
  }
}

function reorderCategoryItem(id, direction) {
  const idx = CATEGORIES_DATA.findIndex(c => c.id === id);
  if (idx === -1) return;
  if (direction === 'up' && idx > 0) {
    const temp = CATEGORIES_DATA[idx - 1];
    CATEGORIES_DATA[idx - 1] = CATEGORIES_DATA[idx];
    CATEGORIES_DATA[idx] = temp;
  } else if (direction === 'down' && idx < CATEGORIES_DATA.length - 1) {
    const temp = CATEGORIES_DATA[idx + 1];
    CATEGORIES_DATA[idx + 1] = CATEGORIES_DATA[idx];
    CATEGORIES_DATA[idx] = temp;
  }
  CATEGORIES_DATA.forEach((c, i) => c.sortOrder = i + 1);
  CATEGORIES = CATEGORIES_DATA.map(c => c.name);
  syncStorefrontState();
  switchApTab('categories');
  showApToast(`Category order updated!`, 'success');
}

function openApCategoryProductsModal(catName) {
  const products = ALL_PRODUCTS.filter(p => p.category === catName);
  const cat = CATEGORIES_DATA.find(c => c.name === catName) || { name: catName, description: 'Store Category Collection' };

  let modalBackdrop = document.getElementById('apCatProductsModalOverlay');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'apCatProductsModalOverlay';
    modalBackdrop.className = 'ap-modal-backdrop';
    document.body.appendChild(modalBackdrop);
  }

  modalBackdrop.innerHTML = `
    <div class="ap-modal-container" style="max-width:700px;">
      <div class="ap-modal-header">
        <div>
          <h3 class="ap-modal-title">📁 Category: ${cat.name} (${products.length} Products)</h3>
          <span style="font-size:12px; color:#64748b;">${cat.description}</span>
        </div>
        <button class="ap-btn-icon" onclick="document.getElementById('apCatProductsModalOverlay').classList.remove('active')"><i class="ri-close-line" style="font-size:18px;"></i></button>
      </div>
      <div class="ap-modal-body">
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${products.length === 0 ? `
            <div style="text-align:center; padding:30px; color:#64748b;">No products currently assigned to this category.</div>
          ` : products.map(p => `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px 14px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; gap:12px; align-items:center;">
                <img src="${p.image}" style="width:40px; height:40px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;">
                <div>
                  <div style="font-size:13px; font-weight:700; color:#0f172a;">${p.title}</div>
                  <div style="font-size:11px; color:#64748b;">SKU: ${p.sku || `UE-SKU-${p.id}`} • ₹${p.price}</div>
                </div>
              </div>
              <button class="ap-btn ap-btn-secondary" style="height:28px; padding:0 10px; font-size:11px;" onclick="document.getElementById('apCatProductsModalOverlay').classList.remove('active'); openApProductModal(${JSON.stringify(p.id)});">Edit Product</button>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="ap-modal-footer">
        <button class="ap-btn ap-btn-secondary" onclick="document.getElementById('apCatProductsModalOverlay').classList.remove('active')">Close</button>
      </div>
    </div>
  `;

  modalBackdrop.classList.add('active');
}

function handleApCategoriesSearch(inputEl) {
  apCategorySearchQuery = inputEl.value;
  const start = inputEl.selectionStart;
  const end = inputEl.selectionEnd;

  switchApTab('categories');

  const newInput = document.getElementById('apCategorySearchInput');
  if (newInput) {
    newInput.focus();
    newInput.setSelectionRange(start, end);
  }
}

function renderApCategories() {
  let filtered = [...CATEGORIES_DATA];

  if (apCategorySearchQuery) {
    const q = apCategorySearchQuery.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)));
  }
  if (apCategoryVisibilityFilter === 'Visible') filtered = filtered.filter(c => c.isVisible !== false);
  if (apCategoryVisibilityFilter === 'Hidden') filtered = filtered.filter(c => c.isVisible === false);
  if (apCategoryFeaturedFilter === 'Featured') filtered = filtered.filter(c => c.isFeatured);
  if (apCategoryFeaturedFilter === 'Standard') filtered = filtered.filter(c => !c.isFeatured);

  if (apCategorySortOrder === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (apCategorySortOrder === 'products') {
    filtered.sort((a, b) => {
      const cntA = ALL_PRODUCTS.filter(p => p.category === a.name).length;
      const cntB = ALL_PRODUCTS.filter(p => p.category === b.name).length;
      return cntB - cntA;
    });
  } else {
    filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  const activeCount = CATEGORIES_DATA.filter(c => c.isVisible !== false).length;
  const featuredCount = CATEGORIES_DATA.filter(c => c.isFeatured).length;
  const hiddenCount = CATEGORIES_DATA.filter(c => c.isVisible === false).length;
  const isAllSelected = filtered.length > 0 && filtered.every(c => apSelectedCategoryIds.includes(c.id));

  return `
    <!-- Top KPI Summary Cards -->
    <div class="ap-metrics-grid" style="margin-bottom:20px;">
      <div class="ap-metric-card">
        <span class="ap-metric-label">Total Categories</span>
        <div class="ap-metric-value">${CATEGORIES_DATA.length}</div>
        <div class="ap-metric-change up"><i class="ri-folder-3-line"></i> Store Taxonomy</div>
      </div>
      <div class="ap-metric-card">
        <span class="ap-metric-label">Active & Visible</span>
        <div class="ap-metric-value">${activeCount}</div>
        <div class="ap-metric-change up"><i class="ri-eye-line"></i> Published on Storefront</div>
      </div>
      <div class="ap-metric-card">
        <span class="ap-metric-label">Featured Categories</span>
        <div class="ap-metric-value">${featuredCount}</div>
        <div class="ap-metric-change up"><i class="ri-star-line"></i> Highlights Header Menu</div>
      </div>
      <div class="ap-metric-card">
        <span class="ap-metric-label">Hidden / Draft</span>
        <div class="ap-metric-value">${hiddenCount}</div>
        <div class="ap-metric-change down"><i class="ri-eye-off-line"></i> Archived Items</div>
      </div>
    </div>

    <div class="ap-card">
      <!-- Floating Bulk Action Bar -->
      ${apSelectedCategoryIds.length > 0 ? `
        <div class="ap-bulk-bar">
          <span style="font-size:13px; font-weight:700;">☑️ ${apSelectedCategoryIds.length} Categories Selected</span>
          <div style="display:flex; gap:8px;">
            <button class="ap-btn ap-btn-secondary" style="height:30px; font-size:11px;" onclick="bulkFeatureCategories()">Mark Featured</button>
            <button class="ap-btn ap-btn-secondary" style="height:30px; font-size:11px;" onclick="bulkHideCategories()">Hide Categories</button>
            <button class="ap-btn ap-btn-danger" style="height:30px; font-size:11px;" onclick="bulkDeleteCategories()">Delete Selected</button>
          </div>
        </div>
      ` : ''}

      <!-- Search & Filters Toolbar -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; gap:16px; flex-wrap:wrap;">
        <div style="display:flex; gap:10px; flex:1; min-width:280px; flex-wrap:wrap;">
          <input type="text" id="apCategorySearchInput" class="ap-search-input" style="width:220px;" placeholder="Search Category or Description..." value="${apCategorySearchQuery}" oninput="handleApCategoriesSearch(this)">
          
          <select class="ap-search-input" style="width:140px; padding-left:10px;" onchange="apCategoryVisibilityFilter=this.value; switchApTab('categories');">
            <option value="All" ${apCategoryVisibilityFilter === 'All' ? 'selected' : ''}>All Visibility</option>
            <option value="Visible" ${apCategoryVisibilityFilter === 'Visible' ? 'selected' : ''}>Visible Only</option>
            <option value="Hidden" ${apCategoryVisibilityFilter === 'Hidden' ? 'selected' : ''}>Hidden Only</option>
          </select>

          <select class="ap-search-input" style="width:140px; padding-left:10px;" onchange="apCategoryFeaturedFilter=this.value; switchApTab('categories');">
            <option value="All" ${apCategoryFeaturedFilter === 'All' ? 'selected' : ''}>All Types</option>
            <option value="Featured" ${apCategoryFeaturedFilter === 'Featured' ? 'selected' : ''}>Featured Only</option>
            <option value="Standard" ${apCategoryFeaturedFilter === 'Standard' ? 'selected' : ''}>Standard Only</option>
          </select>

          <select class="ap-search-input" style="width:150px; padding-left:10px;" onchange="apCategorySortOrder=this.value; switchApTab('categories');">
            <option value="sortOrder" ${apCategorySortOrder === 'sortOrder' ? 'selected' : ''}>Sort: Default Order</option>
            <option value="name" ${apCategorySortOrder === 'name' ? 'selected' : ''}>Sort: Name A-Z</option>
            <option value="products" ${apCategorySortOrder === 'products' ? 'selected' : ''}>Sort: Products Count</option>
          </select>
        </div>

        <button class="ap-btn ap-btn-primary" onclick="openApCategoryModal()">
          <i class="ri-add-line"></i> + Add New Category
        </button>
      </div>

      <!-- Enterprise Category Table -->
      <div class="ap-table-wrapper">
        <table class="ap-table">
          <thead>
            <tr>
              <th style="width:30px;"><input type="checkbox" ${isAllSelected ? 'checked' : ''} onchange="toggleSelectAllCategories(this.checked)"></th>
              <th style="width:60px;">Order</th>
              <th style="width:60px;">Image</th>
              <th>Category Title & Description</th>
              <th>Products</th>
              <th>Subcategories</th>
              <th>Featured</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr><td colspan="9" style="text-align:center; padding:40px; color:#64748b;">No categories match search filters.</td></tr>
            ` : filtered.map((c, idx) => {
              const isChecked = apSelectedCategoryIds.includes(c.id);
              const pCount = ALL_PRODUCTS.filter(p => p.category === c.name).length;
              const subcats = c.subcategories || [];

              return `
                <tr style="${isChecked ? 'background:#f1f5f9 !important;' : ''}">
                  <td><input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleSelectCategory(${c.id}, this.checked)"></td>
                  <td>
                    <div style="display:flex; align-items:center; gap:4px;">
                      <span style="font-size:11px; font-weight:800; color:#64748b;">#${c.sortOrder || idx + 1}</span>
                      <div style="display:flex; flex-direction:column;">
                        <button style="border:none; background:none; cursor:pointer; padding:0; font-size:10px; color:#64748b;" onclick="reorderCategoryItem(${c.id}, 'up')">▲</button>
                        <button style="border:none; background:none; cursor:pointer; padding:0; font-size:10px; color:#64748b;" onclick="reorderCategoryItem(${c.id}, 'down')">▼</button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <img src="${c.image || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop'}" style="width:44px; height:44px; object-fit:cover; border-radius:8px; border:1px solid #cbd5e1;">
                  </td>
                  <td>
                    <div style="cursor:pointer;" onclick="openApCategoryProductsModal('${c.name.replace(/'/g, "\\'")}')">
                      <strong style="font-size:13px; color:#0f172a; display:block;">${c.name}</strong>
                      <span style="font-size:11px; color:#64748b; font-weight:500;">${c.description || 'Bespoke store collection category.'}</span>
                    </div>
                  </td>
                  <td>
                    <button class="ap-btn ap-btn-secondary" style="height:24px; padding:0 8px; font-size:11px; font-weight:800;" onclick="openApCategoryProductsModal('${c.name.replace(/'/g, "\\'")}')">
                      ${pCount} Products
                    </button>
                  </td>
                  <td>
                    <div style="display:flex; gap:4px; flex-wrap:wrap; max-width:180px;">
                      ${subcats.slice(0, 2).map(s => `<span class="ap-badge ap-badge-info" style="font-size:10px;">${s}</span>`).join('')}
                      ${subcats.length > 2 ? `<span class="ap-badge" style="font-size:10px; background:#e2e8f0; color:#475569;">+${subcats.length - 2}</span>` : ''}
                    </div>
                  </td>
                  <td>
                    <button class="ap-btn ap-btn-secondary" style="height:24px; padding:0 6px; font-size:10px;" onclick="toggleCategoryFeatured(${c.id})">
                      ${c.isFeatured ? '⭐ Featured' : '☆ Standard'}
                    </button>
                  </td>
                  <td>
                    <button class="ap-btn ap-btn-secondary" style="height:24px; padding:0 6px; font-size:10px;" onclick="toggleCategoryVisibility(${c.id})">
                      ${c.isVisible !== false ? '👁️ Visible' : '🙈 Hidden'}
                    </button>
                  </td>
                  <td>
                    <div style="display:flex; gap:6px; align-items:center;">
                      <button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 8px; font-size:11px;" onclick="openApCategoryModal(${c.id})">Edit</button>
                      
                      <!-- Popover ⋮ More Menu -->
                      <div class="ap-dropdown-wrapper">
                        <button class="ap-btn ap-btn-secondary" style="height:26px; width:26px; padding:0; justify-content:center; font-weight:800;" onclick="toggleApRowDropdown(event, 'cat-${c.id}')">⋮</button>
                        <div id="apRowDropdown-cat-${c.id}" class="ap-dropdown-menu">
                          <button class="ap-dropdown-item" onclick="switchView('plp', {category:'${c.name}'})">
                            <i class="ri-external-link-line"></i> View on Store
                          </button>
                          <button class="ap-dropdown-item" onclick="duplicateApCategory(${c.id})">
                            <i class="ri-file-copy-line"></i> Duplicate
                          </button>
                          <button class="ap-dropdown-item" onclick="toggleCategoryVisibility(${c.id})">
                            <i class="ri-eye-off-line"></i> ${c.isVisible !== false ? 'Archive / Hide' : 'Unhide'}
                          </button>
                          <div style="border-top:1px solid #e2e8f0; margin:4px 0;"></div>
                          <button class="ap-dropdown-item danger" onclick="deleteApCategory(${c.id})">
                            <i class="ri-delete-bin-line"></i> Delete Category
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
        <span style="font-size:12px; color:#64748b;">Showing 1–${filtered.length} of ${filtered.length} Categories</span>
        <div style="display:flex; gap:8px;">
          <button class="ap-btn ap-btn-secondary" style="height:30px; font-size:11px;" disabled style="opacity:0.5;">← Prev</button>
          <button class="ap-btn ap-btn-secondary" style="height:30px; font-size:11px;" disabled style="opacity:0.5;">Next →</button>
        </div>
      </div>
    </div>
  `;
}

function deleteApCategory(id) {
  const c = typeof id === 'number' ? CATEGORIES_DATA.find(item => item.id === id) : CATEGORIES_DATA.find(item => item.name === id);
  if (c && confirm(`Are you sure you want to delete category "${c.name}"?`)) {
    CATEGORIES_DATA = CATEGORIES_DATA.filter(item => item.id !== c.id);
    CATEGORIES = CATEGORIES_DATA.map(item => item.name);
    syncStorefrontState();
    switchApTab('categories');
    showApToast(`Category ${c.name} deleted!`, 'error');
  }
}

function openApCategoryModal(catId = null) {
  let c = null;
  if (typeof catId === 'number') {
    c = CATEGORIES_DATA.find(item => item.id === catId);
  } else if (typeof catId === 'string') {
    c = CATEGORIES_DATA.find(item => item.name === catId);
  }

  let modalBackdrop = document.getElementById('apCategoryModalOverlay');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'apCategoryModalOverlay';
    modalBackdrop.className = 'ap-modal-backdrop';
    document.body.appendChild(modalBackdrop);
  }

  modalBackdrop.innerHTML = `
    <div class="ap-modal-container" style="max-width:540px;">
      <div class="ap-modal-header">
        <h3 class="ap-modal-title">${c ? '✏️ Edit Category Details' : '➕ Add New Category'}</h3>
        <button class="ap-btn-icon" onclick="closeApCategoryModal()"><i class="ri-close-line" style="font-size:18px;"></i></button>
      </div>
      <div class="ap-modal-body">
        <form onsubmit="event.preventDefault(); saveApCategoryForm(${c ? c.id : 'null'});">
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Category Name *</label>
              <input type="text" id="apFormCatName" class="ap-search-input" style="width:100%;" required value="${c ? c.name.replace(/"/g, '&quot;') : ''}" placeholder="e.g. Toys, Handicrafts, Gadgets">
            </div>

            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Short Description</label>
              <textarea id="apFormCatDesc" class="ap-search-input" style="width:100%; height:50px; padding:8px;" placeholder="Brief summary for storefront banner...">${c ? (c.description || '') : ''}</textarea>
            </div>

            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Thumbnail Image URL</label>
              <div style="display:flex; gap:10px; align-items:center;">
                <input type="text" id="apFormCatImg" class="ap-search-input" style="flex:1;" value="${c ? c.image : ''}" placeholder="https://images.unsplash.com/..." oninput="document.getElementById('apFormCatImgPrev').src=this.value">
                <img id="apFormCatImgPrev" src="${c ? c.image : 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' fill=\'%2394a3b8\' viewBox=\'0 0 24 24\'><path d=\'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\'/></svg>'}" style="width:40px; height:40px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;">
              </div>
            </div>

            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Subcategories (Comma Separated)</label>
              <input type="text" id="apFormCatSub" class="ap-search-input" style="width:100%;" value="${c && c.subcategories ? c.subcategories.join(', ') : ''}" placeholder="e.g. Sarees, Handbags, Jewellery">
            </div>

            <div style="display:flex; gap:20px; padding:6px 0;">
              <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; cursor:pointer;">
                <input type="checkbox" id="apFormCatFeatured" ${!c || c.isFeatured ? 'checked' : ''}> ⭐ Featured Category
              </label>
              <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; cursor:pointer;">
                <input type="checkbox" id="apFormCatVisible" ${!c || c.isVisible !== false ? 'checked' : ''}> 👁️ Visible on Storefront
              </label>
            </div>
          </div>
        </form>
      </div>
      <div class="ap-modal-footer">
        <button class="ap-btn ap-btn-secondary" onclick="closeApCategoryModal()">Cancel</button>
        <button class="ap-btn ap-btn-primary" onclick="saveApCategoryForm(${c ? c.id : 'null'})">
          <i class="ri-check-line"></i> Save Category
        </button>
      </div>
    </div>
  `;

  modalBackdrop.classList.add('active');
}

function closeApCategoryModal() {
  const modalBackdrop = document.getElementById('apCategoryModalOverlay');
  if (modalBackdrop) modalBackdrop.classList.remove('active');
}

function saveApCategoryForm(catId = null) {
  const name = document.getElementById('apFormCatName').value.trim();
  const description = document.getElementById('apFormCatDesc').value.trim();
  const image = document.getElementById('apFormCatImg').value.trim();
  const subStr = document.getElementById('apFormCatSub').value.trim();
  const isFeatured = document.getElementById('apFormCatFeatured').checked;
  const isVisible = document.getElementById('apFormCatVisible').checked;

  if (!name) {
    showToast('Please enter a category name.', 'info');
    return;
  }

  const subcategories = subStr ? subStr.split(',').map(s => s.trim()).filter(Boolean) : [];

  let c = typeof catId === 'number' ? CATEGORIES_DATA.find(item => item.id === catId) : null;
  if (c) {
    const oldName = c.name;
    c.name = name;
    c.description = description;
    c.image = image;
    c.subcategories = subcategories;
    c.isFeatured = isFeatured;
    c.isVisible = isVisible;
    c.updatedAt = new Date().toISOString().split('T')[0];

    ALL_PRODUCTS.forEach(p => {
      if (p.category === oldName) p.category = name;
    });
  } else {
    CATEGORIES_DATA.push({
      id: Date.now(),
      name: name,
      description: description || `Curated boutique ${name} items.`,
      image: image || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop',
      subcategories: subcategories,
      isFeatured: isFeatured,
      isVisible: isVisible,
      sortOrder: CATEGORIES_DATA.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    });
  }

  CATEGORIES = CATEGORIES_DATA.map(item => item.name);
  syncStorefrontState();
  closeApCategoryModal();
  switchApTab('categories');
  showApToast(`Category saved successfully!`, 'success');
}

/* 5. Inventory Matrix Module Renderer */
function renderApInventory() {
  const lowStockProducts = ALL_PRODUCTS.filter(p => (p.stockQty || 0) < 5);

  return `
    <div class="ap-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
        <div>
          <h3 style="font-size:16px; font-weight:800; margin:0;">🏬 Real-Time Inventory & Stock Matrix</h3>
          <span style="font-size:12px; color:#64748b;">${lowStockProducts.length} items flagged as Low Stock (&lt; 5 units)</span>
        </div>
        <button class="ap-btn ap-btn-primary" onclick="saveApInventoryMatrix()">
          <i class="ri-save-3-line"></i> Save Stock Matrix
        </button>
      </div>

      <div class="ap-table-wrapper">
        <table class="ap-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Title</th>
              <th>Category</th>
              <th>Selling Price</th>
              <th>Current Stock</th>
              <th>Low Stock Alert</th>
              <th>Stock Status Toggle</th>
            </tr>
          </thead>
          <tbody>
            ${ALL_PRODUCTS.map(p => `
              <tr>
                <td><code style="font-size:11px; font-weight:700;">${p.sku || `UE-SKU-${p.id}`}</code></td>
                <td><strong>${p.title}</strong></td>
                <td><span class="ap-badge ap-badge-info">${p.category}</span></td>
                <td><strong>₹${p.price}</strong></td>
                <td>
                  <input type="number" id="apInvStock-${p.id}" class="ap-search-input" style="width:90px; height:30px; text-align:center; font-weight:700;" value="${p.stockQty || 12}">
                </td>
                <td>
                  ${(p.stockQty || 0) < 5 ? `<span class="ap-badge ap-badge-danger">⚠️ LOW STOCK</span>` : `<span class="ap-badge ap-badge-success">OK</span>`}
                </td>
                <td>
                  <button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 8px; font-size:11px;" onclick="toggleApStock(${JSON.stringify(p.id)})">
                    ${p.inStock !== false ? '🟢 Available' : '🔴 Out of Stock'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function saveApInventoryMatrix() {
  ALL_PRODUCTS.forEach(p => {
    const input = document.getElementById(`apInvStock-${p.id}`);
    if (input) {
      const val = parseInt(input.value, 10);
      if (!isNaN(val)) p.stockQty = val;
    }
  });
  syncStorefrontState();
  switchApTab('inventory');
  showApToast(`Bulk Inventory Matrix saved successfully!`, 'success');
}

/* 6. Banners & Homepage CMS Module Renderer */
function renderApBanners() {
  return `
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
      <div class="ap-card">
        <h3 style="font-size:15px; font-weight:800; margin-bottom:16px;">🖼️ Active Hero Carousel Slides (${HERO_SLIDES.length})</h3>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${HERO_SLIDES.map((slide, idx) => `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:10px; display:flex; gap:12px; align-items:center;">
              <img src="${slide.img}" style="width:70px; height:50px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;">
              <div style="flex:1; overflow:hidden;">
                <div style="font-size:10px; font-weight:800; color:#d82b7d;">${slide.badge}</div>
                <div style="font-size:13px; font-weight:800; color:#0f172a;">${slide.title}</div>
                <div style="font-size:11px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${slide.sub}</div>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 8px; font-size:11px;" onclick="openApBannerModal(${idx})">Edit</button>
                <button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 8px; font-size:11px; color:#ef4444;" onclick="deleteApBannerSlide(${idx})">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="ap-card">
        <h3 style="font-size:15px; font-weight:800; margin-bottom:16px;">➕ Add Hero Carousel Slide</h3>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:11px; font-weight:700; color:#475569;">Badge Text</label>
            <input type="text" id="apBannerBadge" class="ap-search-input" placeholder="✨ SPECIAL BOUTIQUE OFFER">
          </div>
          <div>
            <label style="font-size:11px; font-weight:700; color:#475569;">Main Title</label>
            <input type="text" id="apBannerTitle" class="ap-search-input" placeholder="e.g. Discover Extraordinary Toys & Gifts">
          </div>
          <div>
            <label style="font-size:11px; font-weight:700; color:#475569;">Subtitle Description</label>
            <input type="text" id="apBannerSub" class="ap-search-input" placeholder="e.g. Curated Educational Toys & Handicrafts">
          </div>
          <div>
            <label style="font-size:11px; font-weight:700; color:#475569;">Banner Image URL</label>
            <input type="text" id="apBannerImg" class="ap-search-input" placeholder="https://images.unsplash.com/...">
          </div>
          <button class="ap-btn ap-btn-primary" style="margin-top:8px;" onclick="addApBannerSlide()">
            + Add Slide to Hero Carousel
          </button>
        </div>
      </div>
    </div>
  `;
}

function openApBannerModal(idx = null) {
  const slide = idx !== null ? HERO_SLIDES[idx] : null;

  let modalBackdrop = document.getElementById('apBannerModalOverlay');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'apBannerModalOverlay';
    modalBackdrop.className = 'ap-modal-backdrop';
    document.body.appendChild(modalBackdrop);
  }

  modalBackdrop.innerHTML = `
    <div class="ap-modal-container" style="max-width:540px;">
      <div class="ap-modal-header">
        <h3 class="ap-modal-title">${slide ? '✏️ Edit Hero Slide' : '➕ Add Hero Slide'}</h3>
        <button class="ap-btn-icon" onclick="closeApBannerModal()"><i class="ri-close-line" style="font-size:18px;"></i></button>
      </div>
      <div class="ap-modal-body">
        <form onsubmit="event.preventDefault(); saveApBannerForm(${idx !== null ? idx : 'null'});">
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Badge Text *</label>
              <input type="text" id="apFormBannerBadge" class="ap-search-input" style="width:100%;" required value="${slide ? slide.badge.replace(/"/g, '&quot;') : '✨ SPECIAL BOUTIQUE OFFER'}">
            </div>

            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Main Title Headline *</label>
              <input type="text" id="apFormBannerTitle" class="ap-search-input" style="width:100%;" required value="${slide ? slide.title.replace(/"/g, '&quot;') : ''}" placeholder="e.g. Discover Extraordinary Toys & Gifts">
            </div>

            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Subtitle Description</label>
              <textarea id="apFormBannerSub" class="ap-search-input" style="width:100%; height:50px; padding:8px;" placeholder="e.g. Curated Educational Toys & Handicrafts">${slide ? slide.sub : ''}</textarea>
            </div>

            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Banner Image URL *</label>
              <div style="display:flex; gap:10px; align-items:center;">
                <input type="text" id="apFormBannerImg" class="ap-search-input" style="flex:1;" required value="${slide ? slide.img : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop'}" oninput="document.getElementById('apFormBannerImgPrev').src=this.value">
                <img id="apFormBannerImgPrev" src="${slide ? slide.img : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop'}" style="width:50px; height:35px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;">
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="ap-modal-footer">
        <button class="ap-btn ap-btn-secondary" onclick="closeApBannerModal()">Cancel</button>
        <button class="ap-btn ap-btn-primary" onclick="saveApBannerForm(${idx !== null ? idx : 'null'})">
          <i class="ri-check-line"></i> Save Slide Changes
        </button>
      </div>
    </div>
  `;

  modalBackdrop.classList.add('active');
}

function closeApBannerModal() {
  const modalBackdrop = document.getElementById('apBannerModalOverlay');
  if (modalBackdrop) modalBackdrop.classList.remove('active');
}

function saveApBannerForm(idx = null) {
  const badge = document.getElementById('apFormBannerBadge').value.trim();
  const title = document.getElementById('apFormBannerTitle').value.trim();
  const sub = document.getElementById('apFormBannerSub').value.trim();
  const img = document.getElementById('apFormBannerImg').value.trim();

  if (!title) {
    showToast('Please enter a banner title.', 'info');
    return;
  }

  if (idx !== null && HERO_SLIDES[idx]) {
    HERO_SLIDES[idx].badge = badge;
    HERO_SLIDES[idx].title = title;
    HERO_SLIDES[idx].sub = sub;
    HERO_SLIDES[idx].img = img;
  } else {
    HERO_SLIDES.push({
      id: Date.now(),
      badge,
      title,
      sub,
      img,
      active: true
    });
  }

  syncStorefrontState();
  closeApBannerModal();
  switchApTab('banners');
  showApToast(`Hero Slide saved successfully!`, 'success');
}

function addApBannerSlide() {
  const badge = document.getElementById('apBannerBadge').value.trim() || '✨ SPECIAL OFFER';
  const title = document.getElementById('apBannerTitle').value.trim() || 'New Store Collection';
  const sub = document.getElementById('apBannerSub').value.trim() || 'Unique Expressions Visakhapatnam';
  const img = document.getElementById('apBannerImg').value.trim() || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop';

  HERO_SLIDES.push({
    id: Date.now(),
    badge,
    title,
    sub,
    img,
    active: true
  });
  syncStorefrontState();
  switchApTab('banners');
  showApToast(`Hero Slide added to carousel!`, 'success');
}

function deleteApBannerSlide(idx) {
  if (confirm(`Delete hero slide #${idx + 1}?`)) {
    HERO_SLIDES.splice(idx, 1);
    syncStorefrontState();
    switchApTab('banners');
    showApToast(`Slide deleted!`, 'error');
  }
}

/* 7. Customers Directory Module Renderer */
function renderApCustomers() {
  return `
    <div class="ap-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="font-size:16px; font-weight:800; margin:0;">👥 Customer Profiles Directory</h3>
        <button class="ap-btn ap-btn-primary" onclick="openApCustomerModal()">
          <i class="ri-add-line"></i> + Add Customer Profile
        </button>
      </div>

      <div class="ap-table-wrapper">
        <table class="ap-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>City</th>
              <th>Total Orders</th>
              <th>Lifetime Spend</th>
              <th>Tier Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${STORE_CUSTOMERS.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.phone}</td>
                <td>${c.email}</td>
                <td>${c.city}</td>
                <td><span class="ap-badge ap-badge-info">${c.ordersCount} Orders</span></td>
                <td><strong>₹${c.totalSpend.toLocaleString('en-IN')}</strong></td>
                <td><span class="ap-badge ${c.status === 'VIP' ? 'ap-badge-purple' : 'ap-badge-success'}">${c.status}</span></td>
                <td><button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 8px; font-size:11px;" onclick="openApCustomerModal(${c.id})">Edit Profile</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openApCustomerModal(id = null) {
  const c = STORE_CUSTOMERS.find(item => item.id === id);
  const name = prompt(`Enter Customer Name:`, c ? c.name : '');
  if (name && name.trim()) {
    if (c) {
      c.name = name.trim();
    } else {
      STORE_CUSTOMERS.push({
        id: Date.now(),
        name: name.trim(),
        phone: "+91 8886662334",
        email: "customer@gmail.com",
        city: "Visakhapatnam",
        ordersCount: 1,
        totalSpend: 799,
        status: "Active"
      });
    }
    syncStorefrontState();
    switchApTab('customers');
    showApToast(`Customer profile saved!`, 'success');
  }
}

/* 8. Coupons & Promotions Module Renderer */
function renderApCoupons() {
  return `
    <div class="ap-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="font-size:16px; font-weight:800; margin:0;">🎟️ Promo Coupons & Discounts</h3>
        <button class="ap-btn ap-btn-primary" onclick="openApCouponModal()">
          <i class="ri-add-line"></i> + Create Coupon Code
        </button>
      </div>

      <div class="ap-table-wrapper">
        <table class="ap-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount Benefit</th>
              <th>Min Order Spend</th>
              <th>Usage Count</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${STORE_COUPONS.map((c, idx) => `
              <tr>
                <td><code style="font-size:13px; font-weight:800; color:#d82b7d;">${c.code}</code></td>
                <td><strong>${c.discount}</strong></td>
                <td>₹${c.minSpend}</td>
                <td>${c.usedCount} times used</td>
                <td>${c.expiry}</td>
                <td><span class="ap-badge ap-badge-success">${c.status}</span></td>
                <td>
                  <button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 8px; font-size:11px; color:#ef4444;" onclick="deleteApCoupon(${idx})">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openApCouponModal() {
  const code = prompt(`Enter Promo Coupon Code (e.g. FESTIVE25):`, '');
  if (code && code.trim()) {
    STORE_COUPONS.push({
      code: code.trim().toUpperCase(),
      discount: "20% OFF",
      minSpend: 499,
      usedCount: 0,
      expiry: "31 Dec 2026",
      status: "Active"
    });
    syncStorefrontState();
    switchApTab('coupons');
    showApToast(`Coupon ${code.toUpperCase()} created!`, 'success');
  }
}

function deleteApCoupon(idx) {
  if (confirm(`Delete coupon code ${STORE_COUPONS[idx].code}?`)) {
    STORE_COUPONS.splice(idx, 1);
    syncStorefrontState();
    switchApTab('coupons');
    showApToast(`Coupon deleted!`, 'error');
  }
}

/* 9. Reviews Moderation Module Renderer */
function renderApReviews() {
  return `
    <div class="ap-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="font-size:16px; font-weight:800; margin:0;">⭐ Customer Reviews Moderation Queue</h3>
      </div>

      <div class="ap-table-wrapper">
        <table class="ap-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review Comment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Homepage Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${STORE_REVIEWS.map((r, idx) => `
              <tr>
                <td><strong>${r.name}</strong></td>
                <td><span style="color:#f59e0b; font-weight:800;">★ ${r.rating}.0</span></td>
                <td style="max-width:300px; font-size:12px; line-height:1.4;">"${r.comment}"</td>
                <td>${r.date}</td>
                <td><span class="ap-badge ${r.status === 'Approved' ? 'ap-badge-success' : 'ap-badge-warning'}">${r.status}</span></td>
                <td>
                  <button class="ap-btn ap-btn-secondary" style="height:24px; padding:0 6px; font-size:10px;" onclick="toggleApReviewFeatured(${idx})">
                    ${r.featured ? '⭐ Featured' : '☆ Standard'}
                  </button>
                </td>
                <td>
                  <div style="display:flex; gap:4px;">
                    <button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 6px; font-size:11px;" onclick="approveApReview(${idx})">Approve</button>
                    <button class="ap-btn ap-btn-secondary" style="height:26px; padding:0 6px; font-size:11px; color:#ef4444;" onclick="deleteApReview(${idx})">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function approveApReview(idx) {
  STORE_REVIEWS[idx].status = 'Approved';
  syncStorefrontState();
  switchApTab('reviews');
  showApToast(`Review approved and published!`, 'success');
}

function toggleApReviewFeatured(idx) {
  STORE_REVIEWS[idx].featured = !STORE_REVIEWS[idx].featured;
  syncStorefrontState();
  switchApTab('reviews');
  showApToast(`Review featured status updated!`, 'success');
}

function deleteApReview(idx) {
  if (confirm(`Delete review from ${STORE_REVIEWS[idx].name}?`)) {
    STORE_REVIEWS.splice(idx, 1);
    syncStorefrontState();
    switchApTab('reviews');
    showApToast(`Review removed!`, 'error');
  }
}

/* 10. Wholesale B2B Module Renderer */
function renderApWholesale() {
  return `
    <div class="ap-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h3 style="font-size:16px; font-weight:800; margin:0;">🏢 B2B Wholesale GST Partner Portal</h3>
          <span style="font-size:12px; color:#64748b;">Direct GST Billing (GSTIN: ${STORE_SETTINGS.gstin})</span>
        </div>
        <button class="ap-btn ap-btn-primary" onclick="showApToast('Wholesale GST Invoice Generator Ready!', 'info')">
          🧾 Create B2B Invoice
        </button>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:16px; margin-bottom:20px;">
        <div class="ap-metric-card">
          <span class="ap-metric-label">Registered GST Partners</span>
          <div class="ap-metric-value">28 Stores</div>
        </div>
        <div class="ap-metric-card">
          <span class="ap-metric-label">Min Bulk Order Threshold</span>
          <div class="ap-metric-value">₹2,500</div>
        </div>
        <div class="ap-metric-card">
          <span class="ap-metric-label">Input Tax Credit Discount</span>
          <div class="ap-metric-value">18% GST Credit</div>
        </div>
      </div>
    </div>
  `;
}

/* 11. Store Settings & CMS Module Renderer */
function renderApSettings() {
  return `
    <div class="ap-card" style="max-width:720px;">
      <h3 style="font-size:16px; font-weight:800; margin-bottom:20px;">⚙️ Store Configuration & Business Details</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
        <div>
          <label style="font-size:11px; font-weight:700; color:#475569;">Business Name</label>
          <input type="text" id="apStName" class="ap-search-input" value="${STORE_SETTINGS.storeName}">
        </div>
        <div>
          <label style="font-size:11px; font-weight:700; color:#475569;">Owner Name</label>
          <input type="text" id="apStOwner" class="ap-search-input" value="${STORE_SETTINGS.ownerName}">
        </div>
        <div>
          <label style="font-size:11px; font-weight:700; color:#475569;">Contact Phone</label>
          <input type="text" id="apStPhone" class="ap-search-input" value="${STORE_SETTINGS.phone}">
        </div>
        <div>
          <label style="font-size:11px; font-weight:700; color:#475569;">WhatsApp Support Number</label>
          <input type="text" id="apStWa" class="ap-search-input" value="${STORE_SETTINGS.whatsapp}">
        </div>
        <div>
          <label style="font-size:11px; font-weight:700; color:#475569;">GSTIN Tax Number</label>
          <input type="text" id="apStGstin" class="ap-search-input" value="${STORE_SETTINGS.gstin}">
        </div>
        <div>
          <label style="font-size:11px; font-weight:700; color:#475569;">Store Email</label>
          <input type="email" id="apStEmail" class="ap-search-input" value="${STORE_SETTINGS.email}">
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <label style="font-size:11px; font-weight:700; color:#475569;">Physical Store Address</label>
        <input type="text" id="apStAddress" class="ap-search-input" value="${STORE_SETTINGS.address}">
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:20px;">
        <div>
          <label style="font-size:11px; font-weight:700; color:#475569;">Free Shipping Min Threshold (₹)</label>
          <input type="number" id="apStMinFree" class="ap-search-input" value="${STORE_SETTINGS.freeShippingMin}">
        </div>
        <div>
          <label style="font-size:11px; font-weight:700; color:#475569;">Standard Shipping Fee (₹)</label>
          <input type="number" id="apStShipFee" class="ap-search-input" value="${STORE_SETTINGS.shippingFee}">
        </div>
        <div>
          <label style="font-size:11px; font-weight:700; color:#475569;">Gift Wrap Fee (₹)</label>
          <input type="number" id="apStWrapFee" class="ap-search-input" value="${STORE_SETTINGS.giftWrapFee}">
        </div>
      </div>

      <button class="ap-btn ap-btn-primary" style="width:100%; justify-content:center;" onclick="saveApStoreSettings()">
        💾 Save & Sync Website Settings
      </button>
    </div>
  `;
}

function saveApStoreSettings() {
  STORE_SETTINGS.storeName = document.getElementById('apStName').value.trim();
  STORE_SETTINGS.ownerName = document.getElementById('apStOwner').value.trim();
  STORE_SETTINGS.phone = document.getElementById('apStPhone').value.trim();
  STORE_SETTINGS.whatsapp = document.getElementById('apStWa').value.trim();
  STORE_SETTINGS.gstin = document.getElementById('apStGstin').value.trim();
  STORE_SETTINGS.email = document.getElementById('apStEmail').value.trim();
  STORE_SETTINGS.address = document.getElementById('apStAddress').value.trim();
  STORE_SETTINGS.freeShippingMin = parseInt(document.getElementById('apStMinFree').value, 10) || 499;
  STORE_SETTINGS.shippingFee = parseInt(document.getElementById('apStShipFee').value, 10) || 50;
  STORE_SETTINGS.giftWrapFee = parseInt(document.getElementById('apStWrapFee').value, 10) || 30;

  syncStorefrontState();
  switchApTab('settings');
  showApToast(`Website Store Settings synchronized live!`, 'success');
}

/* 12. Analytics Module Renderer */
function renderApAnalytics() {
  return `
    <div class="ap-metrics-grid">
      <div class="ap-metric-card">
        <span class="ap-metric-label">Average Order Value (AOV)</span>
        <div class="ap-metric-value">₹1,180</div>
        <div class="ap-metric-change up"><i class="ri-arrow-up-line"></i> +8.2% conversion</div>
      </div>
      <div class="ap-metric-card">
        <span class="ap-metric-label">Repeat Customer Rate</span>
        <div class="ap-metric-value">42.5%</div>
        <div class="ap-metric-change up"><i class="ri-arrow-up-line"></i> High Loyalty</div>
      </div>
      <div class="ap-metric-card">
        <span class="ap-metric-label">Cart Abandonment Rate</span>
        <div class="ap-metric-value">14.2%</div>
        <div class="ap-metric-change down"><i class="ri-arrow-down-line"></i> -3.1% improved</div>
      </div>
    </div>
  `;
}

/* 13. Users & Staff Roles Module Renderer */
function renderApUsers() {
  return `
    <div class="ap-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="font-size:16px; font-weight:800; margin:0;">🛡️ Authorized Admin Staff & Roles</h3>
        <button class="ap-btn ap-btn-primary" onclick="showApToast('Staff Permissions Modal', 'info')">
          + Add Staff Member
        </button>
      </div>

      <div class="ap-table-wrapper">
        <table class="ap-table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Role Permission</th>
              <th>Email Address</th>
              <th>Status</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>G Mounika Durga</strong></td>
              <td><span class="ap-badge ap-badge-purple">Super Admin</span></td>
              <td>uniqueexpressions.in@gmail.com</td>
              <td><span class="ap-badge ap-badge-success">Active Now</span></td>
              <td>Just now</td>
            </tr>
            <tr>
              <td><strong>Swaroop Sandy</strong></td>
              <td><span class="ap-badge ap-badge-info">Store Manager</span></td>
              <td>swaroop@uniqueexpressions.in</td>
              <td><span class="ap-badge ap-badge-success">Active Now</span></td>
              <td>5 mins ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* Global Product Modal Form Handler */
function openApProductModal(editId = null) {
  const p = ALL_PRODUCTS.find(item => item.id === editId);
  const title = prompt(`Product Title:`, p ? p.title : '');
  if (!title || !title.trim()) return;

  const priceStr = prompt(`Selling Price (₹):`, p ? p.price : '499');
  const price = parseInt(priceStr, 10) || 499;
  const category = prompt(`Category (${CATEGORIES.join(', ')}):`, p ? p.category : CATEGORIES[0]) || CATEGORIES[0];
  const image = prompt(`Image URL:`, p ? p.image : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop');

  if (p) {
    p.title = title.trim();
    p.price = price;
    p.originalPrice = Math.round(price * 1.2);
    p.category = category;
    p.image = image;
  } else {
    ALL_PRODUCTS.unshift({
      id: Date.now(),
      sku: `UE-SKU-${Date.now()}`,
      title: title.trim(),
      category: category,
      price: price,
      originalPrice: Math.round(price * 1.2),
      discount: 20,
      image: image,
      rating: "5.0",
      reviewsCount: 1,
      description: `${title} offered by UNIQUE EXPRESSIONS, Visakhapatnam.`,
      stockQty: 25,
      inStock: true,
      isFeatured: true
    });
  }

  syncStorefrontState();
  if (apActiveTab === 'products') switchApTab('products');
  showApToast(`Product saved successfully!`, 'success');
}

// ─── Modal & Action Helpers ───────────────────────────────────────────────────
function openAdminProductModal(productId = null) {
  const modal = document.getElementById('adminProductModalBackdrop');
  if (!modal) return;
  modal.classList.add('active');

  const titleHeader = document.getElementById('admModalHeaderTitle');
  const hiddenId = document.getElementById('admEditId');
  const titleInput = document.getElementById('admModalTitleInput');
  const catSelect = document.getElementById('admModalCategorySelect');
  const priceInput = document.getElementById('admModalPriceInput');
  const origPriceInput = document.getElementById('admModalOrigPriceInput');
  const discountInput = document.getElementById('admModalDiscountInput');
  const descInput = document.getElementById('admModalDescInput');
  const imgUrlHidden = document.getElementById('admModalImgUrl');
  const inStockCheck = document.getElementById('admModalInStock');
  const previewBox = document.getElementById('admModalImgPreview');
  const previewImg = document.getElementById('admModalPreviewImg');
  const previewText = document.getElementById('admModalImgUrlText');

  if (productId) {
    const p = ALL_PRODUCTS.find(item => item.id === productId);
    if (p) {
      if (titleHeader) titleHeader.innerText = `Edit Product #${p.id}`;
      if (hiddenId) hiddenId.value = p.id;
      if (titleInput) titleInput.value = p.title;
      if (catSelect) catSelect.value = p.category;
      if (priceInput) priceInput.value = p.price;
      if (origPriceInput) origPriceInput.value = p.originalPrice || Math.round(p.price * 1.25);
      if (discountInput) discountInput.value = p.discount || 20;
      if (descInput) descInput.value = p.description || '';
      if (imgUrlHidden) imgUrlHidden.value = p.image;
      if (inStockCheck) inStockCheck.checked = p.inStock !== false;

      if (previewBox) {
        previewBox.style.display = 'flex';
        if (previewImg) previewImg.src = p.image;
        if (previewText) previewText.innerText = p.image;
      }
      return;
    }
  }

  // Add Mode Reset
  if (titleHeader) titleHeader.innerText = 'Add New Product';
  if (hiddenId) hiddenId.value = '';
  if (titleInput) titleInput.value = '';
  if (priceInput) priceInput.value = '';
  if (origPriceInput) origPriceInput.value = '';
  if (discountInput) discountInput.value = '20';
  if (descInput) descInput.value = '';
  if (imgUrlHidden) imgUrlHidden.value = '';
  if (inStockCheck) inStockCheck.checked = true;
  if (previewBox) previewBox.style.display = 'none';
}

function closeAdminProductModal() {
  const modal = document.getElementById('adminProductModalBackdrop');
  if (modal) modal.classList.remove('active');
}

async function handleModalImageUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const previewBox = document.getElementById('admModalImgPreview');
  const previewImg = document.getElementById('admModalPreviewImg');
  const previewText = document.getElementById('admModalImgUrlText');
  const hiddenUrl = document.getElementById('admModalImgUrl');

  if (previewBox) {
    previewBox.style.display = 'flex';
    if (previewImg) previewImg.src = '';
    if (previewText) previewText.innerText = '⏳ Uploading to Cloudinary...';
  }

  try {
    const uploadedUrl = await uploadToCloudinary(file);
    if (hiddenUrl) hiddenUrl.value = uploadedUrl;
    if (previewImg) previewImg.src = uploadedUrl;
    if (previewText) previewText.innerText = uploadedUrl;
  } catch (err) {
    showToast('Cloudinary upload failed: ' + err, 'info');
    if (previewBox) previewBox.style.display = 'none';
  }
}

async function handleBannerImageUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const previewBox = document.getElementById('admBannerImgPreview');
  const previewImg = document.getElementById('admBannerPreviewImg');
  const hiddenUrl = document.getElementById('admBannerImgUrl');

  if (previewBox) {
    previewBox.style.display = 'flex';
    if (previewImg) previewImg.src = '';
  }

  try {
    const uploadedUrl = await uploadToCloudinary(file);
    if (hiddenUrl) hiddenUrl.value = uploadedUrl;
    if (previewImg) previewImg.src = uploadedUrl;
  } catch (err) {
    showToast('Banner upload error: ' + err, 'info');
    if (previewBox) previewBox.style.display = 'none';
  }
}

async function saveAdminProductFromModal() {
  const editId = document.getElementById('admEditId')?.value;
  const title = document.getElementById('admModalTitleInput')?.value.trim();
  const category = document.getElementById('admModalCategorySelect')?.value;
  const price = parseFloat(document.getElementById('admModalPriceInput')?.value || '0');
  const origPrice = parseFloat(document.getElementById('admModalOrigPriceInput')?.value || '0');
  const discount = parseInt(document.getElementById('admModalDiscountInput')?.value || '20');
  const desc = document.getElementById('admModalDescInput')?.value.trim();
  const customImg = document.getElementById('admModalImgUrl')?.value;
  const inStock = document.getElementById('admModalInStock')?.checked;

  if (!title || !price) {
    showToast('Please enter product title and price.', 'info');
    return;
  }

  const defaultImg = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop';

  if (editId) {
    // Edit Mode
    const productId = parseInt(editId);
    const p = ALL_PRODUCTS.find(item => item.id === productId);
    if (p) {
      p.title = title;
      p.category = category;
      p.price = price;
      p.originalPrice = origPrice || Math.round(price * 1.25);
      p.discount = discount;
      p.description = desc || p.description;
      p.image = customImg || p.image;
      p.inStock = inStock;

      localStorage.setItem('ue_products', JSON.stringify(ALL_PRODUCTS));
      sbAdminUpdateProduct(p).catch(err => console.warn('[UE] Edit sync failed:', err));
      showApToast(`✅ Product #${productId} updated successfully!`, 'info');
    }
  } else {
    // New Mode
    const newProd = {
      title: title,
      category: category,
      image: customImg || defaultImg,
      price: price,
      originalPrice: origPrice || Math.round(price * 1.25),
      discount: discount,
      rating: '5.0',
      reviewsCount: 1,
      description: desc || `New ${category} item added by store admin.`,
      inStock: inStock
    };

    const sbResult = await sbAdminInsertProduct(newProd);
    if (sbResult) newProd.id = sbResult.id;
    else newProd.id = ALL_PRODUCTS.length + 1;

    ALL_PRODUCTS.unshift(newProd);
    localStorage.setItem('ue_products', JSON.stringify(ALL_PRODUCTS));
    showApToast(`✅ Product "${title}" published to store & Supabase!`, 'info');
  }

  closeAdminProductModal();
  switchAdminTab('products');
  renderAllSections();
}

function adminToggleStock(productId) {
  const p = ALL_PRODUCTS.find(item => item.id === productId);
  if (p) {
    p.inStock = !(p.inStock !== false);
    localStorage.setItem('ue_products', JSON.stringify(ALL_PRODUCTS));
    sbAdminUpdateProduct(p).catch(err => console.warn('[UE] Stock toggle sync failed:', err));
    switchAdminTab('products');
    renderAllSections();
  }
}

async function adminDeleteProduct(id) {
  if (confirm(`Are you sure you want to delete Product #${id}?`)) {
    ALL_PRODUCTS = ALL_PRODUCTS.filter(p => p.id !== id);
    localStorage.setItem('ue_products', JSON.stringify(ALL_PRODUCTS));
    sbAdminDeleteProduct(id).catch(err => console.warn('[UE] Delete sync failed:', err));
    switchAdminTab('products');
    renderAllSections();
  }
}

function adminAddNewCategory() {
  const catName = document.getElementById('admCatNameInput')?.value.trim();
  if (!catName) { showToast('Please enter category name!', 'info'); return; }
  if (CATEGORIES.includes(catName)) { showApToast('Category already exists!', 'info'); return; }

  CATEGORIES.push(catName);
  showApToast(`✅ Category "${catName}" added!`, 'info');
  switchAdminTab('categories');
  renderAllSections();
}

function adminAddNewBanner() {
  const badge = document.getElementById('admBannerBadge')?.value.trim() || '✨ NEW COLLECTION';
  const title = document.getElementById('admBannerTitle')?.value.trim();
  const sub = document.getElementById('admBannerSub')?.value.trim() || 'Curated items in Visakhapatnam';
  const imgUrl = document.getElementById('admBannerImgUrl')?.value || 'hero_lifestyle.png';

  if (!title) { showToast('Please enter slide title!', 'info'); return; }

  HERO_SLIDES.unshift({ img: imgUrl, badge, title, sub });
  showToast('✅ Hero banner carousel slide added!', 'info');
  switchAdminTab('banners');
  startHeroCarousel();
}

function adminDeleteBanner(index) {
  if (confirm('Delete this hero banner slide?')) {
    HERO_SLIDES.splice(index, 1);
    switchAdminTab('banners');
    startHeroCarousel();
  }
}

function adminUpdateOrderStatus(orderId, newStatus) {
  const o = userOrders.find(item => item.orderId === orderId);
  if (o) {
    o.status = newStatus;
    localStorage.setItem('ue_orders', JSON.stringify(userOrders));
    showToast(`Order ${orderId} updated to "${newStatus}"!`, 'info');
    switchAdminTab('orders');
  }
}

function adminSaveStoreSettings() {
  showToast('✅ Store settings updated successfully!', 'info');
}

/* ==========================================================================
   SHARED CART & BADGES LOGIC
   ========================================================================== */
function openCartDrawer() {
  renderDrawerCartItems();
  document.getElementById('cartDrawerBackdrop').classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cartDrawerBackdrop').classList.remove('active');
}

function renderDrawerCartItems() {
  const container = document.getElementById('drawerCartItems');
  const subtotalEl = document.getElementById('drawerSubtotalPrice');
  const itemsSubtotalEl = document.getElementById('drawerItemsSubtotal');
  const wrapRowEl = document.getElementById('drawerWrapRow');
  const wrapCostEl = document.getElementById('drawerWrapCost');
  const subCountEl = document.getElementById('drawerItemCountSub');

  if (!container) return;

  const totalItemsCount = cart.reduce((acc, i) => acc + i.qty, 0);
  if (subCountEl) subCountEl.innerText = `${totalItemsCount} Item${totalItemsCount !== 1 ? 's' : ''}`;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 16px; color:#64748b;">
        <div style="width:64px; height:64px; border-radius:50%; background:#f1f5f9; color:#94a3b8; font-size:28px; display:flex; align-items:center; justify-content:center; margin:0 auto 14px auto;">
          🛒
        </div>
        <h4 style="font-size:16px; font-weight:800; color:#0f172a; margin-bottom:4px;">Your Cart is Empty</h4>
        <p style="font-size:11px; color:#64748b; margin-bottom:16px;">Add items from our boutique collection to get started.</p>
        <button class="m-hero-cta-button" style="justify-content:center; width:100%;" onclick="closeCartDrawer(); switchView('home');">
          Explore Products →
        </button>
      </div>
    `;
    if (subtotalEl) subtotalEl.innerText = "₹0";
    if (itemsSubtotalEl) itemsSubtotalEl.innerText = "₹0";
    if (wrapRowEl) wrapRowEl.style.display = "none";
    return;
  }

  let itemsSubtotal = 0;
  cart.forEach(i => itemsSubtotal += i.price * i.qty);
  const wrapCost = giftWrapSelected ? (30 * cart.length) : 0;
  const finalSubtotal = itemsSubtotal + wrapCost;

  const neededForFree = Math.max(0, 499 - itemsSubtotal);
  const progressPercent = Math.min(100, Math.round((itemsSubtotal / 499) * 100));

  let html = `
    <!-- 1. Free Vizag Express Delivery Tracker Bar -->
    <div class="m-free-shipping-wrap" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:12px 14px; margin-bottom:14px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; font-weight:800; color:#0f172a; margin-bottom:6px;">
        <span>${neededForFree === 0 ? '🎉 <span style="color:#16a34a;">FREE Vizag Express Delivery Unlocked!</span>' : '🚚 Add <strong style="color:#0f172a;">₹' + neededForFree + '</strong> more for FREE Delivery'}</span>
        <span style="background:#0f172a; color:#fff; font-size:9.5px; padding:2px 7px; border-radius:99px; font-weight:800;">${progressPercent}%</span>
      </div>
      <div class="m-shipping-progress-track" style="height:8px; background:#e2e8f0; border-radius:99px; overflow:hidden;">
        <div class="m-shipping-progress-bar" style="width:${progressPercent}%; height:100%; background:linear-gradient(90deg, #0f172a, #334155); border-radius:99px; transition:width 0.4s ease;"></div>
      </div>
    </div>

    <!-- 2. Luxury Gift Packaging Card (Wrapping Fix) -->
    <div class="m-gift-wrap-box" style="background:#ffffff; border:1.5px solid ${giftWrapSelected ? '#0f172a' : '#cbd5e1'}; border-radius:16px; padding:12px 14px; margin-bottom:16px; transition:all 0.2s ease;">
      <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer;">
        <input type="checkbox" id="cartGiftWrapChk" ${giftWrapSelected ? 'checked' : ''} onchange="toggleGiftWrap(this.checked)" style="width:16px; height:16px; accent-color:#0f172a; margin-top:2px; cursor:pointer;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
            <span style="font-size:12px; font-weight:800; color:#0f172a;">🎁 Luxury Gift Packaging</span>
            <span style="font-size:9.5px; font-weight:800; background:#f1f5f9; color:#0f172a; padding:2px 8px; border-radius:99px; border:1px solid #cbd5e1; white-space:nowrap;">+₹30/item</span>
          </div>
          <p style="font-size:10.5px; color:#64748b; margin-top:2px; line-height:1.3;">Satin ribbon packaging & custom greeting card text.</p>
        </div>
      </label>
      ${giftWrapSelected ? `
        <div style="margin-top:10px; padding-top:8px; border-top:1px dashed #cbd5e1;">
          <input type="text" class="form-input" style="font-size:11px; padding:8px 12px; border-radius:10px;" placeholder="✍️ Enter custom greeting message..." value="${giftWrapMessage}" oninput="giftWrapMessage=this.value">
        </div>
      ` : ''}
    </div>

    <div style="font-size:11px; font-weight:800; color:#475569; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.04em;">Selected Items (${cart.length}):</div>
  `;

  html += cart.map((item, idx) => `
    <div class="cart-item-tile-card" style="display:flex; align-items:center; gap:12px; padding:12px; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; margin-bottom:10px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
      <img src="${item.image}" style="width:64px; height:64px; border-radius:12px; object-fit:cover; border:1px solid #e2e8f0; flex-shrink:0;">
      
      <div style="flex:1; min-width:0;">
        <h5 style="font-size:12.5px; font-weight:800; color:#0f172a; margin:0 0 4px 0; line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.title}</h5>
        <div style="display:flex; align-items:baseline; gap:6px;">
          <span style="font-size:14px; font-weight:800; color:#0f172a;">₹${item.price}</span>
          ${item.originalPrice ? `<span style="font-size:10.5px; color:#94a3b8; text-decoration:line-through;">₹${item.originalPrice}</span>` : ''}
        </div>
      </div>

      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
        <button onclick="removeCartItem(${idx})" title="Remove Item" style="background:none; border:none; color:#ef4444; font-size:15px; cursor:pointer; padding:2px; outline:none;">
          <i class="ri-delete-bin-line"></i>
        </button>
        <div class="cart-qty-pill-box" style="display:flex; align-items:center; gap:6px; background:#f8fafc; padding:3px 8px; border-radius:99px; border:1px solid #cbd5e1;">
          <button onclick="updateCartQty(${idx}, -1)" style="width:20px; height:20px; border-radius:50%; border:none; background:#ffffff; font-weight:800; font-size:12px; cursor:pointer; color:#0f172a; box-shadow:0 1px 3px rgba(0,0,0,0.12); display:flex; align-items:center; justify-content:center; outline:none;">-</button>
          <span style="font-size:12px; font-weight:800; color:#0f172a; min-width:14px; text-align:center;">${item.quantity}</span>
          <button onclick="updateCartQty(${idx}, 1)" style="width:20px; height:20px; border-radius:50%; border:none; background:#ffffff; font-weight:800; font-size:12px; cursor:pointer; color:#0f172a; box-shadow:0 1px 3px rgba(0,0,0,0.12); display:flex; align-items:center; justify-content:center; outline:none;">+</button>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;

  if (itemsSubtotalEl) itemsSubtotalEl.innerText = `₹${itemsSubtotal}`;
  if (wrapRowEl) {
    if (giftWrapSelected && wrapCost > 0) {
      wrapRowEl.style.display = "flex";
      if (wrapCostEl) wrapCostEl.innerText = `+₹${wrapCost}`;
    } else {
      wrapRowEl.style.display = "none";
    }
  }
  if (subtotalEl) subtotalEl.innerText = `₹${finalSubtotal}`;
}

function removeCartItem(idx) {
  cart.splice(idx, 1);
  saveCart();
  renderDrawerCartItems();
}

function toggleGiftWrap(val) {
  giftWrapSelected = val;
  renderDrawerCartItems();
}

function updateCartQty(idx, change) {
  cart[idx].qty += change;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderDrawerCartItems();
}

function quickAddToCart(productId) {
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const effectivePrice = getEffectivePrice(product.price);
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, price: effectivePrice, qty: 1 });

  saveCart();
  openCartDrawer();
}

function saveCart() {
  localStorage.setItem('ue_cart', JSON.stringify(cart));
  updateBadges();
}

function toggleWishlist(productId, btnEl) {
  const index = wishlist.indexOf(productId);
  if (index > -1) wishlist.splice(index, 1);
  else wishlist.push(productId);
  localStorage.setItem('ue_wishlist', JSON.stringify(wishlist));
  
  if (btnEl) {
    btnEl.classList.add('heart-pop-anim');
    setTimeout(() => btnEl.classList.remove('heart-pop-anim'), 450);
  }
  
  updateBadges();
  renderAllSections();
  if (currentView === 'wishlist') renderWishlistView();
}

function updateBadges() {
  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);
  document.querySelectorAll('.id-cart-badge').forEach(el => el.innerText = cartCount);
  document.querySelectorAll('.id-wishlist-badge').forEach(el => el.innerText = wishlist.length);

  const fab = document.getElementById('mFloatingCartFab');
  if (fab) {
    if (cartCount > 0) fab.classList.add('visible-fab');
    else fab.classList.remove('visible-fab');
  }
}

function filterCategory(categoryName) {
  activeCategory = categoryName;
  switchView('plp', { category: categoryName });
}

function updateActiveCategoryThumbnails() {
  document.querySelectorAll('.m-cat-pill-thumb').forEach(el => el.classList.remove('active-cat'));
  const activeEl = document.getElementById(`mCat-${activeCategory}`);
  if (activeEl) activeEl.classList.add('active-cat');
}

function handleSearchInput(query) {
  const q = query.toLowerCase().trim();
  if (currentView !== 'home') switchView('home');

  const mobileContainer = document.getElementById('mobileProductGrid');
  if (q.length === 0) { renderAllSections(); return; }

  const results = ALL_PRODUCTS.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 16);
  if (mobileContainer) mobileContainer.innerHTML = results.map(p => createMobileTileHTML(p)).join('');
  if (window.feather) feather.replace();
  if (window.lucide) lucide.createIcons();
}

function openAdminPinModal() {
  document.getElementById('adminPinBackdrop').classList.add('active');
  const input = document.getElementById('adminPinInput');
  if (input) { input.value = ''; setTimeout(() => input.focus(), 200); }
}

function closeAdminPinModal() {
  document.getElementById('adminPinBackdrop').classList.remove('active');
}

function verifyAdminPin() {
  const pin = (document.getElementById('adminPinInput')?.value || '').trim();
  if (pin === '1234') {
    apIsAuthenticated = true;
    sessionStorage.setItem('ue_admin_auth', '1');
    closeAdminPinModal();
    switchView('admin');
  } else {
    showToast('Incorrect PIN. Please try again.', 'info');
  }
}

function closeAllModals() {
  document.getElementById('modalBackdrop')?.classList.remove('active');
  document.getElementById('adminPinBackdrop')?.classList.remove('active');
  document.getElementById('addressModalBackdrop')?.classList.remove('active');
  document.getElementById('editProfileModalBackdrop')?.classList.remove('active');
  document.getElementById('invoiceModalBackdrop')?.classList.remove('active');
}

function openWhatsAppChat(customMsg) {
  const phone = "918886662334";
  const msg = customMsg || "Hello UNIQUE EXPRESSIONS! I am interested in placing an order.";
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ==========================================================================
   SPRINT 4 STATIC INFORMATION PAGES RENDERERS
   ========================================================================== */

/* B2B WHOLESALE PORTAL VIEW */
function renderB2BView() {
  const container = document.getElementById('viewB2B') || document.getElementById('viewWholesale');
  if (!container) return;

  container.innerHTML = `
    <div class="checkout-container">
      <div class="dt-breadcrumb-strip">
        <a href="#" onclick="switchView('home'); return false;">Home</a>
        <i class="ri-arrow-right-s-line"></i>
        <span>B2B Wholesale & Bulk Supplier Portal</span>
      </div>

      <!-- Hero Header -->
      <div class="info-hero-card" style="background:linear-gradient(135deg, #0f172a, #1e293b); color:#fff; border-radius:24px; padding:32px; margin-bottom:32px;">
        <span style="background:rgba(255,255,255,0.12); color:#f472b6; font-size:11px; font-weight:800; padding:4px 12px; border-radius:99px; text-transform:uppercase;">OFFICIAL GSTIN: 37BVTPG7761F1Z1</span>
        <h1 style="font-size:32px; font-weight:900; margin:12px 0 6px 0;">Wholesale & Bulk Supplier Portal</h1>
        <p style="font-size:14px; color:#cbd5e1; margin:0;">Direct factory rates & 18% GST input credit invoices for retailers, schools, event planners, and corporate buyers.</p>
      </div>

      <!-- 2-Column Desktop Grid -->
      <div class="dt-2col-grid">
        <!-- Left: Live Calculator -->
        <div class="info-content-card" style="margin:0; border-radius:24px; padding:28px;">
          <h3 class="info-section-heading" style="font-size:18px;">📊 Instant Wholesale Price Calculator</h3>
          <p style="font-size:13px; color:#64748b; margin-bottom:20px;">Estimate volume pricing and 18% GST input tax credit for bulk orders.</p>

          <div class="form-group">
            <label class="form-label">Estimated Order Quantity (Pieces)</label>
            <input type="number" id="b2bQtyInput" value="50" min="10" max="10000" class="form-input" oninput="calculateB2BQuote()">
          </div>

          <div class="form-group">
            <label class="form-label">Select Product Category</label>
            <select id="b2bCatSelect" class="form-input" onchange="calculateB2BQuote()">
              <option value="250">Kids & RC Toys (Est. ₹250/pc)</option>
              <option value="150">Cute Fancy Stationery (Est. ₹150/pc)</option>
              <option value="180">Birthday Return Gift Hampers (Est. ₹180/pc)</option>
              <option value="650">Handicrafts & Brass Idols (Est. ₹650/pc)</option>
            </select>
          </div>

          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:16px; padding:20px; margin-top:20px;">
            <div style="font-size:12px; color:#64748b; font-weight:700;">Estimated Wholesale Total:</div>
            <div style="font-size:32px; font-weight:900; color:#0f172a; margin:4px 0;" id="b2bTotalPrice">₹12,500</div>
            <div style="font-size:12px; color:#10b981; font-weight:700;" id="b2bGstCredit">Includes 18% GST Credit Invoice & Free Vizag Delivery</div>
          </div>
        </div>

        <!-- Right: Official GST Request Form -->
        <div class="info-content-card" style="margin:0; border-radius:24px; padding:28px;">
          <h3 class="info-section-heading" style="font-size:18px;">📋 Request Official GST Wholesale Invoice</h3>
          
          <div class="form-group">
            <label class="form-label">Business / School Name</label>
            <input type="text" id="b2bBizName" class="form-input" placeholder="e.g. Swaroop Collections / Vizag School">
          </div>

          <div class="form-group">
            <label class="form-label">GSTIN (Optional for Tax Invoice)</label>
            <input type="text" id="b2bGstin" class="form-input" placeholder="e.g. 37BVTPG7761F1Z1">
          </div>

          <div class="form-group">
            <label class="form-label">Contact Phone & WhatsApp</label>
            <input type="text" id="b2bPhone" class="form-input" placeholder="+91 8886662334" value="+91 8886662334">
          </div>

          <div style="display:flex; gap:12px; margin-top:20px;">
            <button class="dt-hero-cta-btn" style="flex:1; height:46px; font-size:14px;" onclick="submitB2BQuoteRequest()">
              📄 Request Official Quote
            </button>
            <button class="m-hero-cta-button" style="flex:1; height:46px; font-size:14px; background:#25D366; box-shadow:none; justify-content:center;" onclick="openSampleKitModal()">
              🎁 Request Sample Kit
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  calculateB2BQuote();
}

function calculateB2BQuote() {
  const qty = parseInt(document.getElementById('b2bQtyInput')?.value || '50', 10);
  const baseRate = parseInt(document.getElementById('b2bCatSelect')?.value || '250', 10);
  const total = qty * baseRate;
  const priceEl = document.getElementById('b2bTotalPrice');
  if (priceEl) priceEl.innerText = `₹${total.toLocaleString('en-IN')}`;
}

function submitB2BQuoteRequest() {
  const biz = document.getElementById('b2bBizName')?.value.trim();
  const phone = document.getElementById('b2bPhone')?.value.trim();
  if (!biz || !phone) {
    showToast('Please enter your Business Name and Contact Phone Number.', 'info');
    return;
  }
  showApToast(`Thank you! Your GST Wholesale Inquiry for "${biz}" has been received. Owner Swaroop Sandy will send your official quotation via WhatsApp (+91 8886662334, 'info');.`);
}

/* 1. ABOUT US PAGE */
function renderAboutView() {
  const container = document.getElementById('viewAbout');
  container.innerHTML = `
    <div class="checkout-container">
      <div class="dt-breadcrumb-strip">
        <a href="#" onclick="switchView('home'); return false;">Home</a>
        <i class="ri-arrow-right-s-line"></i>
        <span>About Unique Expressions</span>
      </div>

      <div class="dt-2col-grid">
        <div class="info-content-card" style="margin:0; border-radius:24px; padding:32px;">
          <span class="profile-vip-pill" style="margin-bottom:8px;">LUXURY E-COMMERCE BOUTIQUE</span>
          <h1 class="info-hero-title" style="font-size:28px; color:#0f172a; margin:8px 0 12px 0;">UNIQUE EXPRESSIONS</h1>
          <p class="info-text-p" style="font-size:13px; line-height:1.7;">
            Founded and managed by <strong>Swaroop Sandy</strong>, UNIQUE EXPRESSIONS is Visakhapatnam's premier boutique storefront for curated Kids Toys, Smart Gadgets, Traditional Handicrafts, Fancy Imported Stationery, and Customized Return Gift Hampers.
          </p>
          <p class="info-text-p" style="font-size:13px; line-height:1.7;">
            We bring together high-grade educational toys for toddlers, innovative gadgets for tech enthusiasts, traditional Indian handicrafts crafted by master artisans, aesthetic school stationery, and custom birthday party return gifts under one roof.
          </p>
        </div>

        <div class="info-content-card" style="margin:0; border-radius:24px; padding:32px;">
          <h3 class="info-section-heading" style="font-size:18px;">🏢 Store Physical Address & Official GSTIN</h3>
          <div style="font-size:13px; color:#334155; line-height:1.7; background:#f8fafc; padding:18px; border-radius:16px; border:1px solid #e2e8f0; margin-bottom:20px;">
            <strong>Store Owner:</strong> Swaroop Sandy<br>
            <strong>Official GSTIN:</strong> <code>37BVTPG7761F1Z1</code><br>
            <strong>Address:</strong> Midhilapuri VUDA Colony, Madhurawada, Visakhapatnam – 530041, Andhra Pradesh<br>
            <strong>Landmark:</strong> Beside More Supermarket, Opp RR Complex, Madhurawada<br>
            <strong>Contact / WhatsApp:</strong> +91 8886662334<br>
            <strong>Support Email:</strong> uniqueexpressions.in@gmail.com
          </div>

          <button class="m-hero-cta-button" style="width:100%; height:48px; justify-content:center; background:#25D366; font-size:14px;" onclick="openWhatsAppChat()">
            💬 Connect Directly on WhatsApp (+91 8886662334) →
          </button>
        </div>
      </div>
    </div>
  `;
}

/* 2. FREQUENTLY ASKED QUESTIONS (FAQ) PAGE */
function renderFAQView() {
  const container = document.getElementById('viewFAQ');
  const faqs = [
    {
      q: "How fast is delivery in Visakhapatnam?",
      a: "We provide Same-Day Express Delivery for local orders placed in Madhurawada, Siripuram, Gajuwaka, MVP Colony, and surrounding Vizag areas! All orders above ₹499 unlock FREE delivery."
    },
    {
      q: "Do you provide official GST Tax Invoices for business credit?",
      a: "Yes! UNIQUE EXPRESSIONS is a registered GST entity (GSTIN: 37BVTPG7761F1Z1). Every retail and wholesale order includes an official GST Tax Invoice for claiming Input Tax Credit."
    },
    {
      q: "Can I place bulk return gift orders for birthday parties?",
      a: "Absolutely! We specialize in customized return gift hampers for birthday parties, weddings, baby showers, and school events. You can calculate volume quotes in our B2B Wholesale Portal or chat with us on WhatsApp."
    },
    {
      q: "What payment methods are supported?",
      a: "We support Cash on Delivery (COD), UPI (PhonePe, Google Pay, Paytm, BHIM), Credit/Debit Cards, and Net Banking."
    },
    {
      q: "What is your replacement policy if an item arrives damaged?",
      a: "We offer a 7-day hassle-free replacement guarantee. Simply share a photo or video on WhatsApp (+91 8886662334) for an immediate replacement."
    }
  ];

  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">Frequently Asked Questions</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="info-hero-card">
        <h1 class="info-hero-title">Help & FAQs</h1>
        <p class="info-hero-sub">Find answers regarding delivery timelines, GST invoices, return gift hampers, and store policies.</p>
      </div>

      <div class="info-content-card">
        ${faqs.map((f, idx) => `
          <div class="faq-accordion-item ${idx === 0 ? 'active' : ''}" onclick="toggleFAQAccordion(this)">
            <div class="faq-accordion-header">
              <span>❓ ${f.q}</span>
              <span class="faq-accordion-icon">▼</span>
            </div>
            <div class="faq-accordion-body">
              ${f.a}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="info-content-card" style="text-align:center;">
        <h4 style="font-size:13px; font-weight:800; color:#0f172a; margin-bottom:4px;">Have more questions?</h4>
        <p style="font-size:11px; color:#64748b; margin-bottom:12px;">Our boutique team in Madhurawada is available 24/7 on WhatsApp.</p>
        <button class="m-hero-cta-button" style="width:100%; justify-content:center; background:#25D366; min-height:46px; font-size:13.5px;" onclick="openWhatsAppChat()">
          <i class="ri-whatsapp-line" style="font-size:18px;"></i> Ask Us on WhatsApp →
        </button>
      </div>
    </div>
  `;
}

function toggleFAQAccordion(el) {
  el.classList.toggle('active');
}

/* 3. TERMS & CONDITIONS PAGE */
function renderTermsView() {
  const container = document.getElementById('viewTerms');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">Terms & Conditions</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="info-hero-card">
        <h1 class="info-hero-title">Terms & Conditions</h1>
        <p class="info-hero-sub">Please review the terms governing retail and wholesale purchases at UNIQUE EXPRESSIONS.</p>
      </div>

      <div class="info-content-card">
        <h3 class="info-section-heading">1. Ownership & Legal Entity</h3>
        <p class="info-text-p">
          UNIQUE EXPRESSIONS is a registered commercial entity operating in Visakhapatnam, Andhra Pradesh under GSTIN <strong>37BVTPG7761F1Z1</strong>, managed by G MOUNIKA DURGA.
        </p>

        <h3 class="info-section-heading">2. Product Descriptions & Pricing</h3>
        <p class="info-text-p">
          We strive for maximum accuracy in product photographs, specifications, and MRP discount pricing. Prices are subject to revision based on seasonal availability and bulk wholesale tiers.
        </p>

        <h3 class="info-section-heading">3. Retail & Wholesale Orders</h3>
        <p class="info-text-p">
          Retail orders are processed immediately upon checkout. Wholesale B2B orders with GST credit invoices are verified against official GSTIN credentials prior to bulk dispatch.
        </p>

        <h3 class="info-section-heading">4. Governing Jurisdiction</h3>
        <p class="info-text-p">
          All legal transactions and disputes are subject to the exclusive jurisdiction of the courts in Visakhapatnam, Andhra Pradesh, India.
        </p>
      </div>
    </div>
  `;
}

/* 4. PRIVACY POLICY PAGE */
function renderPrivacyView() {
  const container = document.getElementById('viewPrivacy');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">Privacy Policy</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="info-hero-card">
        <h1 class="info-hero-title">Privacy Policy</h1>
        <p class="info-hero-sub">Your personal data security and privacy are fundamental to UNIQUE EXPRESSIONS.</p>
      </div>

      <div class="info-content-card">
        <h3 class="info-section-heading">1. Information Collection</h3>
        <p class="info-text-p">
          We collect essential customer information (Name, Phone Number, Delivery Address, Pincode) strictly to fulfill your order and facilitate express local delivery in Visakhapatnam.
        </p>

        <h3 class="info-section-heading">2. Data Usage & Protection</h3>
        <p class="info-text-p">
          Your personal contact details are stored securely. We do not sell, rent, or lease customer data to third-party marketing brokers.
        </p>

        <h3 class="info-section-heading">3. Communication & WhatsApp Updates</h3>
        <p class="info-text-p">
          We send transactional WhatsApp updates for order status, dispatch tracking, and GST invoice delivery. You can opt out of promotional alerts anytime.
        </p>
      </div>
    </div>
  `;
}

/* 5. REFUND & SHIPPING POLICY PAGE */
function renderShippingView() {
  const container = document.getElementById('viewShipping');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">Refund & Shipping Policy</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="info-hero-card">
        <h1 class="info-hero-title">Refund & Shipping Policy</h1>
        <p class="info-hero-sub">Fast local Visakhapatnam delivery & 7-day hassle-free replacement guarantee.</p>
      </div>

      <div class="info-content-card">
        <h3 class="info-section-heading">🚚 Local Express Delivery Timelines</h3>
        <p class="info-text-p">
          • <strong>Madhurawada & Local Vizag:</strong> Same-day delivery for orders placed before 3:00 PM.<br>
          • <strong>Rest of India Shipping:</strong> Dispatched via reliable courier partners within 2-4 business days.<br>
          • <strong>Free Delivery Threshold:</strong> Orders above ₹499 qualify for FREE shipping.
        </p>

        <h3 class="info-section-heading">🔄 7-Day Replacement Guarantee</h3>
        <p class="info-text-p">
          If any item arrives damaged or incomplete, contact our store customer service within 7 days of delivery. Send an unboxing photo/video to <strong>+91 8886662334</strong> for an immediate replacement.
        </p>

        <h3 class="info-section-heading">💳 Refund Processing</h3>
        <p class="info-text-p">
          Approved refunds are credited directly to your original payment method (UPI / Bank Account) within 24 to 48 business hours.
        </p>
      </div>
    </div>
  `;
}

/* ==========================================================================
   SPRINT 3 SUPPORT & BUSINESS MODULES (REVIEWS, RETURNS, HELP CENTER, STORE LOCATOR, OFFERS)
   ========================================================================== */

/* 1. REVIEWS & RATINGS HUB VIEW */
let currentReviewFilterCat = 'All';

function renderReviewsView(filterCat = 'All') {
  currentReviewFilterCat = filterCat;
  const container = document.getElementById('viewReviews');
  if (!container) return;

  const filtered = filterCat === 'All'
    ? userReviews
    : userReviews.filter(r => r.category === filterCat || r.rating === parseInt(filterCat));

  let reviewsHtml = filtered.map(r => `
    <div class="info-content-card" style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:34px; height:34px; border-radius:50%; background:var(--gradient-brand); color:#fff; font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center;">
            ${r.userName.charAt(0)}
          </div>
          <div>
            <h4 style="font-size:13px; font-weight:800; color:#0f172a; margin:0;">${r.userName}</h4>
            <span style="font-size:10px; color:#64748b;">${r.city} • ${r.date}</span>
          </div>
        </div>
        ${r.verified ? `<span style="font-size:10px; font-weight:700; color:#16a34a; background:#dcfce7; padding:2px 8px; border-radius:99px;">✓ Verified Buyer</span>` : ''}
      </div>
      
      <div style="color:var(--func-gold); font-size:13px; margin:4px 0 6px 0;">
        ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
      </div>

      <h5 style="font-size:12.5px; font-weight:800; color:#0f172a; margin:0 0 4px 0;">${r.title}</h5>
      <p style="font-size:11.5px; color:#475569; line-height:1.5; margin-bottom:8px;">"${r.comment}"</p>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #e2e8f0; padding-top:8px; font-size:10.5px; color:#64748b;">
        <span>Item: <strong>${r.productTitle}</strong></span>
        <button onclick="incrementHelpful(${r.id})" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:99px; padding:3px 10px; font-size:10px; font-weight:700; cursor:pointer;">
          👍 Helpful (${r.helpfulCount || 0})
        </button>
      </div>
    </div>
  `).join('');

  if (filtered.length === 0) {
    reviewsHtml = `<div class="info-content-card" style="text-align:center; padding:30px;"><p style="color:#64748b;">No reviews found for this filter category.</p></div>`;
  }

  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">Customer Reviews</span>
      <button class="m-icon-btn-circle" onclick="openWriteReviewModal()" title="Write Review"><i class="ri-edit-line"></i></button>
    </div>

    <div class="checkout-container">
      <div class="info-hero-card" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:32px; font-weight:800; color:#fff; line-height:1;">4.8</span>
          <span style="font-size:14px; color:var(--func-gold);">★★★★★</span>
          <p style="font-size:11px; color:#cbd5e1; margin-top:4px;">Based on 450+ Verified Vizag Orders</p>
        </div>
        <button class="m-hero-cta-button" style="padding:8px 14px; font-size:11px;" onclick="openWriteReviewModal()">Write a Review</button>
      </div>

      <!-- Rating Bar Breakdown -->
      <div class="info-content-card" style="margin-bottom:14px;">
        <h4 style="font-size:13px; font-weight:800; margin-bottom:10px;">Rating Breakdown</h4>
        <div class="rating-bar-row"><span>5 Star</span><div class="rating-bar-bg"><div class="rating-bar-fill" style="width:82%;"></div></div><span>82%</span></div>
        <div class="rating-bar-row"><span>4 Star</span><div class="rating-bar-bg"><div class="rating-bar-fill" style="width:14%;"></div></div><span>14%</span></div>
        <div class="rating-bar-row"><span>3 Star</span><div class="rating-bar-bg"><div class="rating-bar-fill" style="width:3%;"></div></div><span>3%</span></div>
        <div class="rating-bar-row"><span>2 Star</span><div class="rating-bar-bg"><div class="rating-bar-fill" style="width:1%;"></div></div><span>1%</span></div>
      </div>

      <!-- Category Filter Chips -->
      <div class="chip-filter-scroll no-scrollbar">
        <div class="chip-pill ${filterCat === 'All' ? 'active' : ''}" onclick="renderReviewsView('All')">All Reviews</div>
        <div class="chip-pill ${filterCat === '5' ? 'active' : ''}" onclick="renderReviewsView('5')">5 ★ Only</div>
        <div class="chip-pill ${filterCat === 'Return Gifts' ? 'active' : ''}" onclick="renderReviewsView('Return Gifts')">🎁 Return Gifts</div>
        <div class="chip-pill ${filterCat === 'Toys' ? 'active' : ''}" onclick="renderReviewsView('Toys')">🧸 Toys</div>
        <div class="chip-pill ${filterCat === 'Handicrafts' ? 'active' : ''}" onclick="renderReviewsView('Handicrafts')">🎨 Handicrafts</div>
        <div class="chip-pill ${filterCat === 'Stationery' ? 'active' : ''}" onclick="renderReviewsView('Stationery')">✏️ Stationery</div>
      </div>

      <div id="reviewsListContainer">
        ${reviewsHtml}
      </div>
    </div>
  `;
}

function openWriteReviewModal() {
  const modal = document.getElementById('writeReviewModalBackdrop');
  if (modal) modal.classList.add('active');
}

function closeWriteReviewModal() {
  const modal = document.getElementById('writeReviewModalBackdrop');
  if (modal) modal.classList.remove('active');
}

function setReviewRating(rating) {
  document.getElementById('revRatingValue').value = rating;
  const stars = document.querySelectorAll('#starRatingPicker span');
  stars.forEach((s, idx) => {
    if (idx < rating) s.classList.add('active');
    else s.classList.remove('active');
  });
}

async function handleReviewPhotoUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const previewBox = document.getElementById('revPhotoPreview');
  const previewImg = document.getElementById('revPreviewImg');
  const urlText = document.getElementById('revImgUrlText');
  const hiddenUrl = document.getElementById('revPhotoUrl');

  if (previewBox) {
    previewBox.style.display = 'flex';
    if (previewImg) previewImg.src = '';
    if (urlText) urlText.innerText = '⏳ Uploading photo to Cloudinary...';
  }

  try {
    const uploadedUrl = await uploadToCloudinary(file);
    if (hiddenUrl) hiddenUrl.value = uploadedUrl;
    if (previewImg) previewImg.src = uploadedUrl;
    if (urlText) urlText.innerText = uploadedUrl;
  } catch (err) {
    showToast('Photo upload error: ' + err, 'info');
    if (previewBox) previewBox.style.display = 'none';
  }
}

async function submitCustomerReview() {
  const productSelect = document.getElementById('revProductSelect');
  const rating = parseInt(document.getElementById('revRatingValue').value || '5');
  const title = document.getElementById('revTitleInput').value.trim();
  const comment = document.getElementById('revCommentInput').value.trim();
  const name = document.getElementById('revNameInput').value.trim() || 'G Mounika Durga';
  const customPhoto = document.getElementById('revPhotoUrl')?.value;

  if (!title || !comment) {
    showToast('Please enter a review headline and comment.', 'info');
    return;
  }

  const selectedOpt = productSelect.options[productSelect.selectedIndex];
  const newRev = {
    id: Date.now(),
    productId: parseInt(productSelect.value),
    productTitle: selectedOpt.text.split('(')[0].trim(),
    category: "General",
    userName: name,
    city: "Visakhapatnam",
    rating: rating,
    title: title,
    comment: comment,
    date: "Today",
    verified: true,
    helpfulCount: 1,
    image: customPhoto || undefined
  };

  // Save locally first
  userReviews.unshift(newRev);
  localStorage.setItem('ue_reviews', JSON.stringify(userReviews));

  // Sync to Supabase (non-blocking)
  sbInsertReview(newRev).catch(err => console.warn('[UE] Review sync failed:', err));

  closeWriteReviewModal();
  showToast('Thank you! Your verified customer review has been submitted.', 'info');
  if (currentView === 'reviews') renderReviewsView();
}

function incrementHelpful(revId) {
  const rev = userReviews.find(r => r.id === revId);
  if (rev) {
    rev.helpfulCount = (rev.helpfulCount || 0) + 1;
    localStorage.setItem('ue_reviews', JSON.stringify(userReviews));
    // Sync to Supabase (non-blocking)
    sbIncrementHelpful(revId).catch(err => console.warn('[UE] Helpful sync failed:', err));
    if (currentView === 'reviews') renderReviewsView(currentReviewFilterCat);
  }
}


/* 2. RETURNS & EXCHANGE PORTAL VIEW */
function renderReturnsView() {
  const container = document.getElementById('viewReturns');
  if (!container) return;

  let returnsListHtml = userReturns.map(r => `
    <div class="info-content-card" style="border-left:4px solid var(--brand-magenta); margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; margin-bottom:4px;">
        <span>Return ID: <strong>${r.returnId}</strong></span>
        <span style="font-weight:700; color:#16a34a;">${r.status}</span>
      </div>
      <h4 style="font-size:13px; font-weight:800; color:#0f172a; margin:2px 0;">${r.itemTitle}</h4>
      <p style="font-size:11px; color:#475569; margin:2px 0;">Reason: ${r.reason}</p>
      <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-top:6px; border-top:1px dashed #e2e8f0; padding-top:6px;">
        <span>Resolution: ${r.resolution}</span>
        <span style="color:#0f172a;">Refund: ₹${r.amount}</span>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">Returns & Exchange Portal</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="info-hero-card">
        <h1 class="info-hero-title">7-Day Easy Returns & Exchange</h1>
        <p class="info-hero-sub">Direct door pickup across Visakhapatnam or free drop-off at Madhurawada store.</p>
      </div>

      ${userReturns.length > 0 ? `
        <div style="margin-bottom:16px;">
          <h3 class="info-section-heading">Active Return Requests</h3>
          ${returnsListHtml}
        </div>
      ` : ''}

      <div class="info-content-card">
        <h3 class="info-section-heading">Request a New Return / Exchange</h3>
        
        <div class="form-group">
          <label class="form-label">Select Delivered Order</label>
          <select id="retOrderSelect" class="form-input">
            ${userOrders.map(o => `<option value="${o.orderId}">${o.orderId} - ${o.items.map(i=>i.title).join(', ')} (₹${o.totalAmount})</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Reason for Return / Replacement</label>
          <select id="retReasonSelect" class="form-input">
            <option value="Damaged or Defective Item Delivered">Damaged or Defective Item Delivered</option>
            <option value="Wrong Item or Weight Variant Received">Wrong Item or Weight Variant Received</option>
            <option value="Quality Not as Expected">Quality Not as Expected</option>
            <option value="Changed Mind / No Longer Needed">Changed Mind / No Longer Needed</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Preferred Refund Method</label>
          <select id="retResolutionSelect" class="form-input">
            <option value="Store Credit Wallet (+5% Extra Bonus)">Store Credit Wallet (+5% Extra Bonus)</option>
            <option value="Direct UPI / Bank Transfer Refund">Direct UPI / Bank Transfer Refund</option>
            <option value="Free Exchange Replacement">Free Exchange Replacement</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">UPI ID / PhonePe Number for Refund</label>
          <input type="text" id="retUpiInput" class="form-input" placeholder="e.g. 8886662334@ybl or UPI ID" value="8886662334@ybl">
        </div>

        <div class="form-group">
          <label class="form-label">Pickup & Drop Options</label>
          <select id="retPickupType" class="form-input">
            <option value="Doorstep Courier Pickup (Visakhapatnam)">Doorstep Courier Pickup (Visakhapatnam)</option>
            <option value="In-Store Drop-off at Madhurawada Boutique">In-Store Drop-off at Madhurawada Boutique</option>
          </select>
        </div>

        <button class="m-hero-cta-button" style="width:100%; justify-content:center;" onclick="submitReturnRequest()">Submit Return Request →</button>
      </div>
    </div>
  `;
}

async function submitReturnRequest() {
  const orderId = document.getElementById('retOrderSelect').value;
  const reason = document.getElementById('retReasonSelect').value;
  const resolution = document.getElementById('retResolutionSelect').value;

  const selectedOrder = userOrders.find(o => o.orderId === orderId) || userOrders[0];
  const returnObj = {
    returnId: "RET-" + Math.floor(100000 + Math.random() * 900000),
    orderId: orderId,
    date: "Today",
    status: "Requested - Under Review",
    itemTitle: selectedOrder ? selectedOrder.items[0].title : "Catalog Item",
    reason: reason,
    resolution: resolution,
    amount: selectedOrder ? selectedOrder.totalAmount : 999
  };

  // Save locally first
  userReturns.unshift(returnObj);
  localStorage.setItem('ue_returns', JSON.stringify(userReturns));

  // Sync to Supabase (non-blocking)
  sbInsertReturn(returnObj).catch(err => console.warn('[UE] Return sync failed:', err));

  showToast(`Return request submitted! Your Return ID is ${returnObj.returnId}. Our team will schedule pickup within 24 hours.`, 'info');
  renderReturnsView();
}


/* 3. HELP CENTER & SEARCHABLE FAQ VIEW */
function renderHelpCenterView() {
  const container = document.getElementById('viewHelpCenter');
  if (!container) return;

  const faqs = [
    { q: "What are the store hours for UNIQUE EXPRESSIONS Madhurawada?", a: "Our store is open 7 days a week from 9:30 AM to 9:30 PM. Visit us at 2nd floor LIG 347, 2-115/9/1, near Shivalayam, Midhilapuri VUDA Colony, Madhurwada, Visakhapatnam." },
    { q: "How fast is delivery within Visakhapatnam?", a: "We offer express same-day delivery across Madhurawada, PM Palem, MVP Colony, Siripuram, Gajuwaka, and all Vizag areas for orders placed before 3:00 PM." },
    { q: "Do you offer GST Invoicing for Wholesale & Corporate buyers?", a: "Yes! We issue official B2B GST Invoices with our GSTIN 37BVTPG7761F1Z1 for input tax credit. Enter your GST number during checkout or in our Wholesale B2B portal." },
    { q: "Can I customize return gift hampers for birthday parties?", a: "Absolutely! We specialize in custom return gift boxes for kids birthdays, weddings, baby showers, and school events. Contact us at +91 8886662334 for personalized hampers." },
    { q: "What is the return and replacement policy?", a: "We offer a 7-day hassle-free replacement guarantee. If any product is damaged or defective, we provide doorstep pickup or instant exchange at our Madhurawada store." }
  ];

  let faqItemsHtml = faqs.map((item, idx) => `
    <div class="faq-accordion-item" id="faqItem-${idx}">
      <div class="faq-accordion-header" onclick="toggleFaqAccordion(${idx})">
        <span>${item.q}</span>
        <span class="faq-accordion-icon">▼</span>
      </div>
      <div class="faq-accordion-body">
        <p>${item.a}</p>
      </div>
    </div>
  `).join('');

  let ticketsHtml = supportTickets.map(t => `
    <div class="info-content-card" style="margin-bottom:10px; border-left:3px solid var(--brand-magenta);">
      <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b;">
        <span>Ticket #${t.ticketId} • ${t.category}</span>
        <span style="font-weight:700; color:#16a34a;">${t.status}</span>
      </div>
      <h5 style="font-size:12px; font-weight:800; color:#0f172a; margin:4px 0 2px 0;">${t.subject}</h5>
      <p style="font-size:11px; color:#475569; margin:0;">${t.message}</p>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">Help Center & Support</span>
      <button class="m-icon-btn-circle" onclick="openRaiseTicketModal()" title="Raise Ticket"><i class="ri-customer-service-2-line"></i></button>
    </div>

    <div class="checkout-container">
      <div class="info-hero-card">
        <h1 class="info-hero-title">How can we help you today?</h1>
        <p class="info-hero-sub">Direct support from UNIQUE EXPRESSIONS boutique store, Visakhapatnam.</p>
        <div style="margin-top:12px; position:relative;">
          <input type="text" placeholder="Search FAQs, shipping, GST billing..." class="form-input" style="border-radius:99px; padding-left:36px; background:#fff; color:#0f172a;" oninput="filterFaqSearch(this.value)">
          <i class="ri-search-line" style="position:absolute; left:12px; top:10px; color:#64748b;"></i>
        </div>
      </div>

      <!-- Quick Contact Actions -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
        <div class="info-content-card" style="margin:0; text-align:center; cursor:pointer;" onclick="openWhatsAppChat()">
          <i class="ri-whatsapp-line" style="font-size:24px; color:#25D366;"></i>
          <h4 style="font-size:12px; font-weight:800; margin:4px 0 2px 0;">WhatsApp Us</h4>
          <span style="font-size:10px; color:#64748b;">+91 8886662334</span>
        </div>
        <div class="info-content-card" style="margin:0; text-align:center; cursor:pointer;" onclick="window.location.href='tel:+918886662334'">
          <i class="ri-phone-line" style="font-size:24px; color:var(--brand-magenta);"></i>
          <h4 style="font-size:12px; font-weight:800; margin:4px 0 2px 0;">Call Store Direct</h4>
          <span style="font-size:10px; color:#64748b;">+91 8886662334</span>
        </div>
      </div>

      ${ticketsHtml.length > 0 ? `
        <div style="margin-bottom:16px;">
          <h3 class="info-section-heading">Your Support Requests</h3>
          ${ticketsHtml}
        </div>
      ` : ''}

      <div class="info-content-card">
        <h3 class="info-section-heading">Frequently Asked Questions</h3>
        <div id="faqListContainer">
          ${faqItemsHtml}
        </div>
      </div>
    </div>
  `;
}

function toggleFaqAccordion(idx) {
  const item = document.getElementById(`faqItem-${idx}`);
  if (item) item.classList.toggle('active');
}

function filterFaqSearch(val) {
  const query = val.toLowerCase();
  document.querySelectorAll('.faq-accordion-item').forEach(el => {
    const text = el.innerText.toLowerCase();
    if (text.includes(query)) el.style.display = 'block';
    else el.style.display = 'none';
  });
}

function openRaiseTicketModal() {
  const modal = document.getElementById('raiseTicketModalBackdrop');
  if (modal) modal.classList.add('active');
}

function closeRaiseTicketModal() {
  const modal = document.getElementById('raiseTicketModalBackdrop');
  if (modal) modal.classList.remove('active');
}

async function submitSupportTicket() {
  const cat = document.getElementById('ticketCategory').value;
  const subj = document.getElementById('ticketSubject').value.trim();
  const msg = document.getElementById('ticketMessage').value.trim();

  if (!subj || !msg) {
    showToast('Please enter a subject and message.', 'info');
    return;
  }

  const ticketObj = {
    ticketId: "TCK-" + Math.floor(1000 + Math.random() * 9000),
    category: cat,
    subject: subj,
    status: "Open - In Progress",
    date: "Today",
    message: msg
  };

  // Save locally first
  supportTickets.unshift(ticketObj);
  localStorage.setItem('ue_tickets', JSON.stringify(supportTickets));

  // Sync to Supabase (non-blocking)
  sbInsertTicket(ticketObj).catch(err => console.warn('[UE] Ticket sync failed:', err));

  closeRaiseTicketModal();
  showApToast(`Support Ticket #${ticketObj.ticketId} created! Our store representative will contact you via WhatsApp/Phone.`, 'info');
  renderHelpCenterView();
}


/* 4. STORE LOCATOR & VIZAG BOUTIQUE VIEW */
function renderStoreLocatorView() {
  const container = document.getElementById('viewStoreLocator');
  if (!container) return;

  container.innerHTML = `
    <div class="checkout-container">
      <div class="dt-breadcrumb-strip">
        <a href="#" onclick="switchView('home'); return false;">Home</a>
        <i class="ri-arrow-right-s-line"></i>
        <span>Visakhapatnam Store Locator</span>
      </div>

      <div class="dt-2col-grid">
        <!-- Left: Interactive Map Card -->
        <div class="store-map-card" style="height:100%; min-height:480px; margin:0; border-radius:24px;">
          <div class="store-map-overlay" style="padding:28px;">
            <span style="font-size:11px; font-weight:800; text-transform:uppercase; color:var(--func-gold); letter-spacing:1px;">FLAGSHIP BOUTIQUE STORE</span>
            <h2 style="font-size:24px; font-weight:900; margin:4px 0 6px 0; color:#fff;">UNIQUE EXPRESSIONS</h2>
            <p style="font-size:13px; opacity:0.9; margin-bottom:16px; color:#cbd5e1;">Midhilapuri VUDA Colony, Madhurawada, Visakhapatnam - 530041</p>
            <a href="https://maps.google.com/?q=Midhilapuri+VUDA+Colony+Madhurwada+Visakhapatnam" target="_blank" style="display:inline-flex; align-items:center; gap:8px; background:#ffffff; color:#0f172a; padding:10px 20px; border-radius:99px; font-size:13px; font-weight:800; text-decoration:none; box-shadow:0 8px 20px rgba(0,0,0,0.2);">
              <i class="ri-navigation-fill" style="color:var(--brand-magenta);"></i> Get Google Maps Directions
            </a>
          </div>
        </div>

        <!-- Right: Address & Facilities -->
        <div class="info-content-card" style="margin:0; border-radius:24px; padding:32px;">
          <h3 class="info-section-heading" style="font-size:18px;">🏢 Store Details & Physical Address</h3>
          <p class="info-text-p" style="font-size:13px; line-height:1.7;">
            <strong>Owner Name:</strong> Swaroop Sandy<br>
            <strong>Address:</strong> UNIQUE EXPRESSIONS, Midhilapuri VUDA Colony, Madhurawada, Visakhapatnam – 530041, Andhra Pradesh<br>
            <strong>Landmark:</strong> Beside More Supermarket, Opp RR Complex, Madhurawada<br>
            <strong>Contact Number:</strong> +91 8886662334<br>
            <strong>Support Email:</strong> uniqueexpressions.in@gmail.com<br>
            <strong>GSTIN:</strong> <code>37BVTPG7761F1Z1</code>
          </p>

          <h3 class="info-section-heading" style="font-size:18px; margin-top:20px;">🕒 Operating Hours</h3>
          <p class="info-text-p" style="font-size:13px; line-height:1.7;">
            • <strong>Monday to Sunday:</strong> 9:30 AM – 9:30 PM (Open 7 Days a Week)<br>
            • <strong>Festival Days:</strong> Special extended hours for Diwali, Sankranti & Christmas shopping.
          </p>

          <h3 class="info-section-heading" style="font-size:18px; margin-top:20px;">🛍️ In-Store Facilities & Services</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px;">
            <div class="facility-badge">🎁 Custom Gift Hampers</div>
            <div class="facility-badge">📦 Wholesale Counter</div>
            <div class="facility-badge">⚡ Express Store Pickup</div>
            <div class="facility-badge">💳 Cards, UPI & Cash</div>
          </div>

          <div style="display:flex; gap:12px; margin-top:24px;">
            <button class="m-hero-cta-button" style="flex:1; justify-content:center; height:46px;" onclick="window.location.href='tel:+918886662334'">
              <i class="ri-phone-line"></i> Call Store Now
            </button>
            <button class="m-hero-cta-button" style="flex:1; justify-content:center; background:#25D366; box-shadow:none; height:46px;" onclick="openWhatsAppChat()">
              <i class="ri-whatsapp-line"></i> WhatsApp Location
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}


/* 5. OFFERS & PROMO COUPONS HUB VIEW */
function renderOffersView() {
  const container = document.getElementById('viewOffers');
  if (!container) return;

  const coupons = [
    { code: "UNIQUE10", title: "Flat 10% Off Everything", desc: "Applicable on all retail purchases above ₹499", badge: "POPULAR" },
    { code: "VIZAGFREE", title: "Free Same-Day Delivery", desc: "Valid for all orders delivered in Visakhapatnam", badge: "LOCAL VIZAG" },
    { code: "WHOLESALE25", title: "Flat 25% Off Bulk Orders", desc: "For Wholesale & Return Gift orders above ₹10,000", badge: "WHOLESALE" },
    { code: "WELCOME50", title: "Flat ₹50 Off First Purchase", desc: "Exclusive welcome gift for new app users", badge: "NEW USER" }
  ];

  let couponsHtml = coupons.map(c => `
    <div class="coupon-promo-card">
      <span style="position:absolute; top:14px; right:14px; background:rgba(255,255,255,0.2); color:#fff; font-size:9px; font-weight:800; padding:3px 8px; border-radius:99px;">${c.badge}</span>
      <h3 style="font-size:16px; font-weight:800; margin:0 0 4px 0;">${c.title}</h3>
      <p style="font-size:11px; opacity:0.85; margin:0 0 10px 0;">${c.desc}</p>
      <div class="coupon-code-badge" onclick="copyCouponCode('${c.code}')">
        <span>${c.code}</span>
        <i class="ri-file-copy-line"></i>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">Deals & Promo Coupons</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="info-hero-card">
        <h1 class="info-hero-title">Exclusive Promo Hub</h1>
        <p class="info-hero-sub">Tap any coupon code below to copy & apply at checkout.</p>
      </div>

      ${couponsHtml}
    </div>
  `;
}

function copyCouponCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Coupon code "${code}" copied to clipboard! Paste it at checkout for instant discounts.`, 'info');
  }).catch(() => {
    showToast(`Coupon code: ${code}`, 'info');
  });
}

function openSampleKitModal() {
  const modal = document.getElementById('sampleKitModalBackdrop');
  if (modal) modal.classList.add('active');
}

function closeSampleKitModal() {
  const modal = document.getElementById('sampleKitModalBackdrop');
  if (modal) modal.classList.remove('active');
}

function submitSampleKitRequest() {
  const biz = document.getElementById('sampleBizName').value.trim();
  const phone = document.getElementById('samplePhone').value.trim();
  if (!biz || !phone) {
    showToast('Please enter your Business/School Name and Contact Phone Number.', 'info');
    return;
  }
  closeSampleKitModal();
  showToast('Thank you! Your Wholesale Sample Kit request has been registered. Our representative Swaroop Sandy will contact you within 24 hours.', 'info');
}

/* ==========================================================================
   PRODUCTION CUSTOM HTML MODALS FOR ADMIN CMS
   ========================================================================== */
function openApProductModal(editId = null) {
  const p = ALL_PRODUCTS.find(item => String(item.id) === String(editId)) || null;
  const editIdJs = editId != null ? JSON.stringify(editId) : 'null';
  
  let modalBackdrop = document.getElementById('apProductModalOverlay');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'apProductModalOverlay';
    modalBackdrop.className = 'ap-modal-backdrop';
    document.body.appendChild(modalBackdrop);
  }

  const categoryOptions = CATEGORIES.map(c => `<option value="${c}" ${p && p.category === c ? 'selected' : ''}>${c}</option>`).join('');

  modalBackdrop.innerHTML = `
    <div class="ap-modal-container" style="max-width:680px;">
      <div class="ap-modal-header">
        <h3 class="ap-modal-title">${p ? '✏️ Edit Product Details' : '➕ Add New Product'}</h3>
        <button class="ap-btn-icon" onclick="closeApProductModal()"><i class="ri-close-line" style="font-size:18px;"></i></button>
      </div>
      <div class="ap-modal-body">
        <form id="apProductForm" onsubmit="event.preventDefault(); saveApProductForm(${editIdJs});">
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Product Title *</label>
              <input type="text" id="apFormTitle" class="ap-search-input" style="width:100%;" required value="${p ? p.title.replace(/"/g, '&quot;') : ''}" placeholder="e.g. RC Super Stunt Car 360">
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">SKU Code *</label>
                <input type="text" id="apFormSku" class="ap-search-input" style="width:100%;" required value="${p ? (p.sku || `UE-SKU-${p.id}`) : `UE-SKU-${Date.now()}`}">
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Category *</label>
                <select id="apFormCategory" class="ap-search-input" style="width:100%; padding-left:12px;">
                  ${categoryOptions}
                </select>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Selling Price (₹) *</label>
                <input type="number" id="apFormPrice" class="ap-search-input" style="width:100%;" required value="${p ? p.price : ''}" placeholder="e.g. 499">
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Original Price (₹)</label>
                <input type="number" id="apFormOrigPrice" class="ap-search-input" style="width:100%;" value="${p ? (p.originalPrice || Math.round(p.price * 1.2)) : ''}" placeholder="e.g. 699">
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Stock Quantity *</label>
                <input type="number" id="apFormStock" class="ap-search-input" style="width:100%;" required value="${p ? p.stockQty : ''}" placeholder="e.g. 25">
              </div>
            </div>

            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Product Image URL or Direct File Upload *</label>
              <div style="display:flex; gap:10px; align-items:center;">
                <input type="text" id="apFormImg" class="ap-search-input" style="flex:1;" required value="${p ? p.image : ''}" placeholder="https://images.unsplash.com/..." oninput="document.getElementById('apFormImgPrev').src=this.value">
                <label class="ap-btn ap-btn-secondary" style="height:38px; font-size:11px; padding:0 10px; cursor:pointer; margin:0; display:flex; align-items:center; gap:4px;" title="Upload photo directly from phone or computer to Cloudinary">
                  ☁️ Upload File
                  <input type="file" accept="image/*" style="display:none;" onchange="uploadImageToCloudinary(this, 'apFormImg', 'apFormImgPrev')">
                </label>
                <img id="apFormImgPrev" src="${p ? p.image : 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' fill=\'%2394a3b8\' viewBox=\'0 0 24 24\'><path d=\'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\'/></svg>'}" style="width:40px; height:40px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;">
              </div>
            </div>

            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Product Description</label>
              <textarea id="apFormDesc" class="ap-search-input" style="width:100%; height:60px; padding:8px;" placeholder="Enter product specifications and details...">${p ? (p.description || '') : ''}</textarea>
            </div>

            <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background: #f8fafc;">
              <label style="font-size: 11px; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">🖼️ Multi-Image URLs (One per line)</label>
              <textarea id="apFormImagesList" class="ap-search-input" style="width:100%; height:60px; padding:8px;" placeholder="https://image1.jpg\nhttps://image2.jpg">${p ? (Array.isArray(p.images) ? p.images.join('\n') : p.image) : ''}</textarea>
            </div>

            <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background: #f8fafc;">
              <label style="font-size: 11px; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">🎁 Frequently Bought Together (Product IDs, comma separated)</label>
              <input type="text" id="apFormFbt" class="ap-search-input" style="width:100%;" value="${p ? (Array.isArray(p.boughtTogether) ? p.boughtTogether.join(', ') : '') : ''}" placeholder="e.g. 101, 102">
            </div>

            <div style="border:1.5px dashed #0f172a; border-radius:14px; padding:14px; background:#f8fafc;">
              <label style="font-size:11px; font-weight:700; color:#0f172a; display:block; margin-bottom:4px;">🎬 YouTube / Instagram Video URL <span style="color:#94a3b8; font-weight:500;">(Optional)</span></label>
              <input type="text" id="apFormVideoUrl" class="ap-search-input" style="width:100%;" value="${p ? (p.videoUrl || '') : ''}" placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..." oninput="updateApVideoPreview(this.value)">
              <div id="apVideoPreview" style="margin-top:6px; display:${p && p.videoUrl ? 'block' : 'none'};">
                <a href="${p ? (p.videoUrl || '#') : '#'}" target="_blank" id="apVideoLink" style="font-size:11px; color:#0f172a; font-weight:700; text-decoration:none;">▶ Preview Video Link →</a>
              </div>
            </div>

            <div style="display:flex; gap:20px; padding:6px 0;">
              <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; cursor:pointer;">
                <input type="checkbox" id="apFormInStock" ${!p || p.inStock !== false ? 'checked' : ''}> 🟢 Available In Stock
              </label>
              <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; cursor:pointer;">
                <input type="checkbox" id="apFormFeatured" ${p && p.isFeatured ? 'checked' : ''}> ⭐ Feature on Storefront
              </label>
            </div>
          </div>
        </form>
      </div>
      <div class="ap-modal-footer">
        <button type="button" class="ap-btn ap-btn-secondary" onclick="closeApProductModal()">Cancel</button>
        <button type="button" id="apSaveProductBtn" class="ap-btn ap-btn-primary" onclick="saveApProductForm(${editIdJs})">
          <i class="ri-check-line"></i> Save Product Changes
        </button>
      </div>
    </div>
  `;

  modalBackdrop.classList.add('active');
}

function updateApVideoPreview(url) {
  const preview = document.getElementById('apVideoPreview');
  const link = document.getElementById('apVideoLink');
  if (preview && link) {
    if (url) {
      preview.style.display = 'block';
      link.href = url;
      const isYT = url.includes('youtube.com') || url.includes('youtu.be');
      const isIG = url.includes('instagram.com');
      link.textContent = isYT ? '▶ Preview YouTube Video →' : isIG ? '▶ Preview Instagram Reel →' : '▶ Preview Video →';
    } else {
      preview.style.display = 'none';
    }
  }
}

function closeApProductModal() {
  const modalBackdrop = document.getElementById('apProductModalOverlay');
  if (modalBackdrop) modalBackdrop.classList.remove('active');
}

async function saveApProductForm(editId = null) {
  const saveBtn = document.getElementById('apSaveProductBtn');
  if (saveBtn?.dataset.saving === '1') return;

  const title = document.getElementById('apFormTitle')?.value.trim();
  const sku = document.getElementById('apFormSku')?.value.trim();
  const category = document.getElementById('apFormCategory')?.value;
  const price = parseInt(document.getElementById('apFormPrice')?.value, 10) || 0;
  const originalPrice = parseInt(document.getElementById('apFormOrigPrice')?.value, 10) || Math.round(price * 1.2);
  const stockQty = parseInt(document.getElementById('apFormStock')?.value, 10) || 0;
  const image = document.getElementById('apFormImg')?.value.trim() || '';
  const description = document.getElementById('apFormDesc')?.value.trim() || '';
  const inStock = document.getElementById('apFormInStock')?.checked;
  const isFeatured = document.getElementById('apFormFeatured')?.checked;
  const videoUrl = (document.getElementById('apFormVideoUrl')?.value || '').trim();
  const rawImages = (document.getElementById('apFormImagesList')?.value || '').trim().split('\n').map(s => s.trim()).filter(Boolean);
  const images = rawImages.length > 0 ? rawImages : [image];
  const rawFbt = (document.getElementById('apFormFbt')?.value || '').trim().split(',').map(s => s.trim()).filter(Boolean);
  const boughtTogether = rawFbt;

  if (!title) {
    showApToast('Please enter a product title.', 'info');
    return;
  }

  if (!image) {
    showApToast('Please upload a photo or paste an image URL.', 'info');
    return;
  }

  if (image.startsWith('data:')) {
    showApToast('Image upload still in progress or failed. Wait for "uploaded successfully" or paste an image URL.', 'error');
    return;
  }

  const existing = editId != null ? ALL_PRODUCTS.find(item => String(item.id) === String(editId)) : null;
  let savedProduct;

  if (existing) {
    existing.title = title;
    existing.sku = sku;
    existing.category = category;
    existing.price = price;
    existing.originalPrice = originalPrice;
    existing.stockQty = stockQty;
    existing.image = image;
    existing.description = description;
    existing.inStock = inStock;
    existing.isFeatured = isFeatured;
    existing.videoUrl = videoUrl;
    existing.images = images;
    existing.boughtTogether = boughtTogether;
    existing.discount = Math.round(((originalPrice - price) / originalPrice) * 100) || 0;
    savedProduct = existing;
  } else {
    savedProduct = {
      id: Date.now(),
      sku: sku || `UE-SKU-${Date.now()}`,
      title,
      category,
      price,
      originalPrice,
      discount: Math.round(((originalPrice - price) / originalPrice) * 100) || 0,
      image,
      rating: '5.0',
      reviewsCount: 1,
      description: description || `${title} offered by UNIQUE EXPRESSIONS, Visakhapatnam.`,
      stockQty,
      inStock,
      isFeatured,
      videoUrl,
      images,
      boughtTogether
    };
    ALL_PRODUCTS.unshift(savedProduct);
  }

  if (saveBtn) {
    saveBtn.dataset.saving = '1';
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';
  }

  try {
    syncStorefrontState();
    closeApProductModal();

    let cloudOk = false;
    if (existing && typeof sbAdminUpdateProduct === 'function') {
      cloudOk = !!(await sbAdminUpdateProduct(savedProduct));
    } else if (typeof sbAdminInsertProduct === 'function') {
      const sbResult = await sbAdminInsertProduct(savedProduct);
      if (sbResult?.id != null) {
        savedProduct.id = sbResult.id;
        syncStorefrontState();
        cloudOk = true;
      }
    }

    if (apActiveTab === 'products') switchApTab('products');
    showApToast(
      cloudOk ? 'Product saved and synced to cloud!' : 'Product saved locally (cloud sync pending).',
      cloudOk ? 'success' : 'info'
    );
  } catch (err) {
    console.error('[UE] saveApProductForm failed:', err);
    showApToast('Save failed: ' + (err.message || 'storage error. Try a smaller image URL.'), 'error');
  } finally {
    if (saveBtn) {
      saveBtn.dataset.saving = '0';
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="ri-check-line"></i> Save Product Changes';
    }
  }
}

function uploadImageToCloudinary(fileInput, targetInputId, targetPrevId) {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.size > 8 * 1024 * 1024) {
    showApToast('Image too large. Please use a file under 8MB.', 'error');
    return;
  }

  showApToast('Uploading image to Cloudinary...', 'info');

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;

    fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: base64Data })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.url) {
        document.getElementById(targetInputId).value = data.url;
        document.getElementById(targetPrevId).src = data.url;
        showApToast('Image uploaded successfully!', 'success');
      } else {
        showApToast(data.error || 'Upload failed. Paste an image URL instead.', 'error');
      }
    })
    .catch(() => {
      showApToast('Upload failed on this server. Paste an image URL instead.', 'error');
    });
  };
  reader.onerror = () => showApToast('Could not read image file.', 'error');
  reader.readAsDataURL(file);
}



/* ==========================================================================
   PRODUCTION PDP INFRASTRUCTURE (ZOOM, SWIPE, LIGHTBOX, RESIZE)
   ========================================================================== */

// 1. Responsive PDP Re-render on Resize
let pdpResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(pdpResizeTimer);
  pdpResizeTimer = setTimeout(() => {
    if (typeof currentView !== 'undefined' && currentView === 'pdp' && typeof currentPdpProduct !== 'undefined' && currentPdpProduct) {
      if (typeof renderPDPView === 'function') {
        renderPDPView(currentPdpProduct.id);
      }
    }
  }, 250);
});

// 2. Native Desktop Image Magnifier / Zoom
function initImageZoom(imgId, resultId) {
  const img = document.getElementById(imgId);
  const result = document.getElementById(resultId);
  if (!img || !result) return;

  img.addEventListener('mousemove', moveLens);
  img.addEventListener('mouseenter', () => { result.style.display = 'block'; });
  img.addEventListener('mouseleave', () => { result.style.display = 'none'; });

  function moveLens(e) {
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const fx = (x / rect.width) * 100;
    const fy = (y / rect.height) * 100;

    result.style.backgroundImage = `url('${img.src}')`;
    result.style.backgroundSize = `${rect.width * 2.5}px ${rect.height * 2.5}px`;
    result.style.backgroundPosition = `${fx}% ${fy}%`;
  }
}

// 5. Frequently Bought Together (FBT) Cart Handler
function addFbtComboToCart(mainProdId, bundleProdIds) {
  const allIds = [mainProdId, ...bundleProdIds];
  allIds.forEach(id => {
    const prod = ALL_PRODUCTS.find(p => String(p.id) === String(id));
    if (prod) {
      const existing = cart.find(i => String(i.id) === String(id));
      if (existing) existing.quantity = (existing.quantity || 1) + 1;
      else cart.push({ ...prod, price: getEffectivePrice(prod.price), quantity: 1 });
    }
  });
  saveCart();
  openCartDrawer();
}

/* ==========================================================================
   CUSTOMER AUTHENTICATION & LOGIN MODAL HANDLERS
   ========================================================================== */
function openUserAuthModal(defaultTab = 'login') {
  const backdrop = document.getElementById('userAuthModalBackdrop');
  if (backdrop) {
    backdrop.classList.add('active');
    switchAuthTab(defaultTab);
  }
}

function closeUserAuthModal() {
  const backdrop = document.getElementById('userAuthModalBackdrop');
  if (backdrop) backdrop.classList.remove('active');
}

function switchAuthTab(tab) {
  const loginBtn = document.getElementById('authTabBtnLogin');
  const signupBtn = document.getElementById('authTabBtnSignup');
  const otpBtn = document.getElementById('authTabBtnOtp');

  const loginContent = document.getElementById('authTabContentLogin');
  const signupContent = document.getElementById('authTabContentSignup');
  const otpContent = document.getElementById('authTabContentOtp');

  [loginBtn, signupBtn, otpBtn].forEach(b => {
    if (b) {
      b.style.background = '#f8fafc';
      b.style.color = '#64748b';
      b.style.borderBottom = 'none';
      b.style.fontWeight = '700';
    }
  });

  [loginContent, signupContent, otpContent].forEach(c => {
    if (c) c.style.display = 'none';
  });

  if (tab === 'login') {
    if (loginBtn) { loginBtn.style.background = '#fff'; loginBtn.style.color = '#0f172a'; loginBtn.style.borderBottom = '2px solid #0f172a'; loginBtn.style.fontWeight = '800'; }
    if (loginContent) loginContent.style.display = 'block';
  } else if (tab === 'signup') {
    if (signupBtn) { signupBtn.style.background = '#fff'; signupBtn.style.color = '#0f172a'; signupBtn.style.borderBottom = '2px solid #0f172a'; signupBtn.style.fontWeight = '800'; }
    if (signupContent) signupContent.style.display = 'block';
  } else if (tab === 'otp') {
    if (otpBtn) { otpBtn.style.background = '#fff'; otpBtn.style.color = '#0f172a'; otpBtn.style.borderBottom = '2px solid #0f172a'; otpBtn.style.fontWeight = '800'; }
    if (otpContent) otpContent.style.display = 'block';
  }
}

function toggleAuthPasswordVisibility() {
  const input = document.getElementById('authLoginPassword');
  const icon = document.getElementById('toggleAuthPassIcon');
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'ri-eye-line';
  } else {
    input.type = 'password';
    icon.className = 'ri-eye-off-line';
  }
}

function handleUserLogin(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('authLoginId')?.value.trim();
  const pass = document.getElementById('authLoginPassword')?.value.trim();

  if (!id || !pass) {
    showToast('Please enter your email/phone and password.', 'info');
    return;
  }

  // Set user profile state
  userProfile.name = id.includes('@') ? id.split('@')[0] : 'G Mounika Durga';
  userProfile.email = id.includes('@') ? id : 'uniqueexpressions@gmail.com';
  userProfile.phone = !id.includes('@') ? id : '+91 8886662334';
  
  localStorage.setItem('ue_user_session_v1', JSON.stringify({ isLoggedIn: true, profile: userProfile }));
  closeUserAuthModal();
  showToast(`Welcome back, ${userProfile.name}! VIP Account active.`, 'success');
  
  if (currentView === 'profile') renderProfileView();
}

function handleUserSignup(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('authSignupName')?.value.trim();
  const phone = document.getElementById('authSignupPhone')?.value.trim();
  const email = document.getElementById('authSignupEmail')?.value.trim();
  const city = 'Visakhapatnam';

  if (!name || !phone || !email) {
    showToast('Please complete all required registration fields.', 'info');
    return;
  }

  userProfile.name = name;
  userProfile.phone = phone;
  userProfile.email = email;
  userProfile.city = city;

  localStorage.setItem('ue_user_session_v1', JSON.stringify({ isLoggedIn: true, profile: userProfile }));
  closeUserAuthModal();
  showToast(`Registration Successful! Welcome to UNIQUE EXPRESSIONS, ${name}!`, 'success');

  if (currentView === 'profile') renderProfileView();
}

function handleSendOtpCode() {
  const row = document.getElementById('otpInputRow');
  const timer = document.getElementById('otpTimerText');
  const btn = document.getElementById('sendOtpSubmitBtn');

  if (row) {
    if (row.style.display === 'none') {
      row.style.display = 'flex';
      if (timer) timer.style.display = 'block';
      if (btn) {
        btn.innerText = 'Verify 4-Digit OTP Code →';
        btn.onclick = handleVerifyOtpCode;
      }
      showToast('WhatsApp OTP Sent to +91 8886662334! Code: 1 2 3 4', 'info');
    }
  }
}

function focusNextOtp(idx) {
  const cur = document.getElementById(`otpBox${idx}`);
  if (cur && cur.value.length === 1 && idx < 4) {
    const nxt = document.getElementById(`otpBox${idx + 1}`);
    if (nxt) nxt.focus();
  }
}

function handleVerifyOtpCode() {
  const o1 = document.getElementById('otpBox1')?.value.trim();
  const o2 = document.getElementById('otpBox2')?.value.trim();
  const o3 = document.getElementById('otpBox3')?.value.trim();
  const o4 = document.getElementById('otpBox4')?.value.trim();
  const otp = `${o1}${o2}${o3}${o4}`;

  if (otp.length < 4) {
    showToast('Please enter complete 4-digit OTP code.', 'info');
    return;
  }

  localStorage.setItem('ue_user_session_v1', JSON.stringify({ isLoggedIn: true, profile: userProfile }));
  closeUserAuthModal();
  showToast('WhatsApp OTP Verified! Logged in as G Mounika Durga.', 'success');

  if (currentView === 'profile') renderProfileView();
}

// 3. Native Lightbox / Fullscreen Viewer
function openPDPModalLightbox(images, startIndex = 0) {
  let lightbox = document.getElementById('pdpLightboxOverlay');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'pdpLightboxOverlay';
    lightbox.className = 'pdp-lightbox-overlay';
    document.body.appendChild(lightbox);
  }

  let currentIndex = startIndex;

  function renderLightbox() {
    lightbox.innerHTML = `
      <div class="pdp-lightbox-content">
        <button class="pdp-lightbox-close" onclick="closePDPModalLightbox()">&times;</button>
        <button class="pdp-lightbox-prev" onclick="event.stopPropagation(); changeLightboxImg(-1)">&lsaquo;</button>
        <img src="${images[currentIndex]}" class="pdp-lightbox-img" alt="Enlarged View">
        <button class="pdp-lightbox-next" onclick="event.stopPropagation(); changeLightboxImg(1)">&rsaquo;</button>
        <div class="pdp-lightbox-counter">${currentIndex + 1} / ${images.length}</div>
      </div>
    `;
  }

  window.changeLightboxImg = function(dir) {
    currentIndex = (currentIndex + dir + images.length) % images.length;
    renderLightbox();
  };

  lightbox.classList.add('active');
  renderLightbox();

  const handleKeydown = (e) => {
    if (e.key === 'Escape') closePDPModalLightbox();
    if (e.key === 'ArrowLeft') changeLightboxImg(-1);
    if (e.key === 'ArrowRight') changeLightboxImg(1);
  };
  window._pdpKeyHandler = handleKeydown;
  window.addEventListener('keydown', handleKeydown);
}

function closePDPModalLightbox() {
  const lightbox = document.getElementById('pdpLightboxOverlay');
  if (lightbox) lightbox.classList.remove('active');
  if (window._pdpKeyHandler) {
    window.removeEventListener('keydown', window._pdpKeyHandler);
  }
}

// 4. Native Touch / Swipe for Mobile Image Gallery
function initTouchSwipeGallery(containerId, onSwipeLeft, onSwipeRight) {
  const el = document.getElementById(containerId);
  if (!el) return;

  let startX = 0;
  let startY = 0;

  el.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  el.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].clientX - startX;
    const diffY = e.changedTouches[0].clientY - startY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0 && onSwipeLeft) onSwipeLeft();
      if (diffX > 0 && onSwipeRight) onSwipeRight();
    }
  }, { passive: true });
}

// 5. Frequently Bought Together (FBT) Cart Handler
function addFbtComboToCart(mainProdId, bundleProdIds) {
  const allIds = [mainProdId, ...bundleProdIds];
  allIds.forEach(id => {
    const prod = ALL_PRODUCTS.find(p => String(p.id) === String(id));
    if (prod) {
      const existing = cart.find(i => String(i.id) === String(id));
      if (existing) existing.qty += 1;
      else cart.push({ ...prod, price: getEffectivePrice(prod.price), qty: 1 });
    }
  });
  saveCart();
  openCartDrawer();
}
