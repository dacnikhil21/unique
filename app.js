/* ==========================================================================
   UNIQUE EXPRESSIONS - WORLD-CLASS HERO BANNER & MOBILE APP LOGIC
   ========================================================================== */

const HERO_SLIDES = [
  {
    img: "hero_lifestyle.png",
    badge: "✨ BOUTIQUE LIFESTYLE COLLECTION",
    title: "Discover Extraordinary Toys & Gifts",
    sub: "Curated Educational Toys, Smart Gadgets, Artisan Handicrafts, Stationery & Bespoke Return Gift Hampers."
  },
  {
    img: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop",
    badge: "🎁 RETURN GIFT STUDIO",
    title: "Bespoke Party & Celebration Hampers",
    sub: "Customized gift boxes tailored for birthdays, weddings, baby showers, and school events."
  },
  {
    img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
    badge: "📦 WHOLESALE & BULK ORDERS",
    title: "Direct Wholesale GST Billing",
    sub: "Volume-based discounts & input credit invoices (GSTIN: 37BVTPG7761F1Z1) for store owners."
  }
];

let currentHeroIndex = 0;
let heroTimer = null;

const CATEGORIES = ["Toys", "Gadgets", "Handicrafts", "Stationery", "Return Gifts"];

const SEED_TEMPLATES = {
  Toys: [
    { title: "RC Super Stunt Car 360", img: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop", basePrice: 799, discount: 25 },
    { title: "Soft Cuddly Teddy Bear (Large)", img: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?q=80&w=600&auto=format&fit=crop", basePrice: 499, discount: 20 },
    { title: "Educational Building Blocks Set", img: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=600&auto=format&fit=crop", basePrice: 899, discount: 30 },
    { title: "Magnetic Puzzle Board Game", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=600&auto=format&fit=crop", basePrice: 349, discount: 15 }
  ],
  Gadgets: [
    { title: "Mini RGB Bluetooth Speaker", img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop", basePrice: 699, discount: 35 },
    { title: "Astronaut Galaxy Star Projector Lamp", img: "https://images.unsplash.com/photo-1517999186661-ac0f0aef3699?q=80&w=600&auto=format&fit=crop", basePrice: 1299, discount: 40 },
    { title: "Smart Digital LED Desk Clock", img: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=600&auto=format&fit=crop", basePrice: 549, discount: 20 },
    { title: "Cute Rechargeable Desk Fan", img: "https://images.unsplash.com/photo-1618944847828-82e943c3beb9?q=80&w=600&auto=format&fit=crop", basePrice: 399, discount: 15 }
  ],
  Handicrafts: [
    { title: "Handcrafted Brass Ganesha Idol", img: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=600&auto=format&fit=crop", basePrice: 1499, discount: 25 },
    { title: "Wooden Carved Jewelry Organizer Box", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop", basePrice: 850, discount: 18 },
    { title: "Kondapalli Traditional Wooden Toys", img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop", basePrice: 650, discount: 22 },
    { title: "Terracotta Designer Oil Lamp Set", img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop", basePrice: 420, discount: 30 }
  ],
  Stationery: [
    { title: "Unicorn Kawaii Multi-Color Pen Set", img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600&auto=format&fit=crop", basePrice: 249, discount: 20 },
    { title: "A5 Hardbound Password Journal", img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop", basePrice: 399, discount: 15 },
    { title: "Pastel Highlighter Marker Pack", img: "https://images.unsplash.com/photo-1568205612207-8cd4d1817478?q=80&w=600&auto=format&fit=crop", basePrice: 199, discount: 10 },
    { title: "Artistic Calligraphy Brush Set", img: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600&auto=format&fit=crop", basePrice: 450, discount: 25 }
  ],
  "Return Gifts": [
    { title: "Kids Birthday Return Gift Combo Box", img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop", basePrice: 150, discount: 30 },
    { title: "Customized Name Keychains (Set of 10)", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop", basePrice: 350, discount: 20 },
    { title: "Eco-Friendly Seed Pencil Gift Pack", img: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600&auto=format&fit=crop", basePrice: 120, discount: 15 },
    { title: "Mini Drawing & Color Pencil Kit", img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600&auto=format&fit=crop", basePrice: 180, discount: 25 }
  ]
};

let ALL_PRODUCTS = [];
let savedProducts = localStorage.getItem('ue_products');

if (savedProducts) {
  try { ALL_PRODUCTS = JSON.parse(savedProducts); } catch (e) { ALL_PRODUCTS = []; }
}

function generateSeedProducts() {
  const seeded = [];
  let productIdCounter = 1;
  CATEGORIES.forEach(cat => {
    const seeds = SEED_TEMPLATES[cat];
    for (let i = 0; i < 40; i++) {
      const seed = seeds[i % seeds.length];
      const title = i > 3 ? `${seed.title} (Variant #${i + 1})` : seed.title;
      const basePrice = seed.basePrice + (i * 10);
      const originalPrice = Math.round(basePrice * (1 + seed.discount / 100));
      seeded.push({
        id: productIdCounter++,
        title: title,
        category: cat,
        image: seed.img,
        price: basePrice,
        originalPrice: originalPrice,
        discount: seed.discount,
        rating: (4.4 + (i % 6) * 0.1).toFixed(1),
        reviewsCount: 18 + (i * 4),
        description: `Premium ${cat.toLowerCase()} collection item offered by UNIQUE EXPRESSIONS, Visakhapatnam. Guaranteed durability for retail & wholesale orders.`,
        inStock: true
      });
    }
  });
  return seeded;
}

if (!ALL_PRODUCTS || ALL_PRODUCTS.length === 0) {
  ALL_PRODUCTS = generateSeedProducts();
  localStorage.setItem('ue_products', JSON.stringify(ALL_PRODUCTS));
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

let userProfile = JSON.parse(localStorage.getItem('ue_user_profile') || JSON.stringify({
  name: "G Mounika Durga",
  email: "uniqueexpressions@gmail.com",
  phone: "+91 8886662334",
  city: "Visakhapatnam",
  totalSavings: 1450
}));

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
      localStorage.setItem('ue_products', JSON.stringify(ALL_PRODUCTS));
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

  // Header and Floating Cart FAB visibility
  const globalHeader = document.querySelector('.m-app-header');
  const globalSearch = document.querySelector('.m-search-wrap-sticky');
  const cartFab = document.getElementById('mFloatingCartFab');

  if (viewName === 'pdp' || viewName === 'checkout' || viewName === 'search' || viewName === 'plp' || viewName === 'addresses' || viewName === 'orderDetails' || viewName === 'about' || viewName === 'faq' || viewName === 'terms' || viewName === 'privacy' || viewName === 'shipping' || viewName === 'reviews' || viewName === 'returns' || viewName === 'helpCenter' || viewName === 'storeLocator' || viewName === 'wholesale') {
    if (globalHeader) globalHeader.style.display = 'none';
    if (globalSearch) globalSearch.style.display = 'none';
    if (cartFab) cartFab.style.display = 'none';
  } else {
    if (globalHeader) globalHeader.style.display = 'flex';
    if (globalSearch) globalSearch.style.display = 'block';
    if (cartFab) cartFab.style.display = 'flex';
    updateBadges();
  }

  // Update bottom nav highlights
  document.querySelectorAll('.m-nav-tab-link').forEach(el => el.classList.remove('active'));
  const navBtn = document.getElementById(`nav-${viewName}`);
  if (navBtn) navBtn.classList.add('active');
  updateNavIcons(viewName);

  const targetView = document.getElementById(`view${capitalizeFirst(viewName)}`);
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
    renderAdminView();
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

function createMobileTileHTML(product, index = 0) {
  const isWishlisted = wishlist.includes(product.id);
  const effectivePrice = getEffectivePrice(product.price);
  const saveAmount = product.originalPrice - effectivePrice;
  const delaySec = (index * 0.04).toFixed(2);

  return `
    <div class="m-product-tile-card" style="animation-delay: ${delaySec}s;" onclick="openProductPage(${product.id})">
      <div class="m-tile-img-wrapper">
        <img src="${product.image}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop'">
        <span class="m-discount-badge-orange">${product.discount}% OFF</span>
        <button class="m-wishlist-heart-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id}, this)" title="Add to Wishlist">
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
        <button class="m-tile-add-btn" onclick="event.stopPropagation(); quickAddToCart(${product.id})">
          <span class="m-add-icon-sq"><i class="ri-add-line"></i></span> Quick Add
        </button>
      </div>
    </div>
  `;
}

function createMiniProductHTML(product, index = 0) {
  const effectivePrice = getEffectivePrice(product.price);
  const delaySec = (index * 0.04).toFixed(2);
  return `
    <div class="m-mini-product-card" style="animation: fadeInUp 0.4s ease backwards; animation-delay: ${delaySec}s;" onclick="openProductPage(${product.id})">
      <img src="${product.image}" loading="lazy">
      <div class="m-mini-title">${product.title}</div>
      <div class="m-mini-price">₹${effectivePrice}</div>
    </div>
  `;
}

function openProductPage(productId) {
  const pId = Number(productId);
  if (!recentlyViewed.includes(pId)) {
    recentlyViewed.unshift(pId);
    if (recentlyViewed.length > 10) recentlyViewed.pop();
    localStorage.setItem('ue_recently_viewed', JSON.stringify(recentlyViewed));
  }
  switchView('pdp', { productId: pId });
}

/* ==========================================================================
   AMAZON-INSPIRED PRODUCT DETAIL PAGE (PDP) RENDERER (UE BRAND COLORS)
   ========================================================================== */
function renderPDPView(productId) {
  const pId = Number(productId);
  const product = ALL_PRODUCTS.find(p => p.id === pId || p.id == productId);
  if (!product) return;

  currentPdpProduct = product;
  pdpSelectedQty = 1;
  pdpSelectedVariant = 'Standard Pack';

  const container = document.getElementById('viewPDP');
  const isWishlisted = wishlist.includes(product.id);
  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);

  const relatedItems = ALL_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  container.innerHTML = `
    <div class="pdp-view-wrapper">
      <!-- 1. Top Bar -->
      <div class="pdp-top-bar">
        <button class="pdp-back-icon-btn" onclick="switchView('home')">
          <i class="ri-arrow-left-line"></i>
        </button>
        
        <div class="pdp-search-mini-pill" onclick="switchView('search')">
          <i class="ri-search-line" style="color:#94a3b8;"></i>
          <input type="text" class="pdp-search-mini-input" placeholder="Search in store..." readonly>
        </div>

        <div class="pdp-header-actions">
          <button class="pdp-back-icon-btn" onclick="toggleWishlist(${product.id})">
            <i class="${isWishlisted ? 'ri-heart-3-fill' : 'ri-heart-3-line'}" style="${isWishlisted ? 'color:#0f172a;' : ''}"></i>
          </button>
          <button class="pdp-back-icon-btn" onclick="openCartDrawer()">
            <i class="ri-shopping-bag-line"></i>
            <span class="m-badge-count-dot id-cart-badge" style="top:-2px; right:-2px;">${cartCount}</span>
          </button>
        </div>
      </div>

      <!-- 2. Gallery Frame -->
      <div class="pdp-gallery-frame">
        <img src="${product.image}" alt="${product.title}">
        <span class="pdp-single-badge">🔥 ${product.discount}% OFF</span>
      </div>

      <!-- 3. PDP Card Body -->
      <div class="pdp-card-box">
        <span class="pdp-brand-link">Brand: Unique Expressions Store > ${product.category}</span>
        <h1 class="pdp-title-text">${product.title}</h1>

        <div class="pdp-amazon-rating-bar">
          <span class="pdp-rating-pill">★ ${product.rating} / 5.0</span>
          <span>(${product.reviewsCount} verified reviews)</span>
          <span class="pdp-bought-tag">🔥 200+ bought this month</span>
        </div>

        <!-- Price Section -->
        <div class="pdp-amazon-price-row">
          <span class="pdp-discount-tag-red">-${product.discount}%</span>
          <span class="pdp-main-price-val">₹${product.price}</span>
          <span class="pdp-mrp-val">M.R.P.: ₹${product.originalPrice}</span>
        </div>
        <span class="pdp-tax-note">Inclusive of all taxes • Official GST Input Credit Invoice</span>

        <!-- Variant Selector -->
        <span style="font-size:11px; font-weight:800; color:#334155; margin-bottom:6px; display:block;">Select Variant:</span>
        <div class="pdp-variant-chips-row">
          <div class="pdp-chip-item active" onclick="selectPdpVariant(this, 'Standard Pack')">Standard Pack</div>
          <div class="pdp-chip-item" onclick="selectPdpVariant(this, 'Pack of 5 (Gift Box)')">Pack of 5 (Gift Box)</div>
          <div class="pdp-chip-item" onclick="selectPdpVariant(this, 'Bulk Wholesale')">Bulk Wholesale</div>
        </div>

        <!-- Quantity Stepper -->
        <span style="font-size:11px; font-weight:800; color:#334155; margin-bottom:6px; display:block;">Quantity:</span>
        <div class="pdp-stepper-box">
          <button class="pdp-stepper-btn" onclick="updatePdpQty(-1)">-</button>
          <span class="pdp-stepper-val" id="pdpQtyDisplay">1</span>
          <button class="pdp-stepper-btn" onclick="updatePdpQty(1)">+</button>
        </div>

        <!-- Pincode Delivery Availability Checker -->
        <div class="m-pincode-checker-box">
          <span style="font-size:11px; font-weight:800; color:#111827;">📍 Check Express Delivery ETA in Vizag:</span>
          <div class="m-pincode-input-row">
            <input type="text" id="pdpPincodeInput" class="form-input" value="530041" placeholder="Enter Pincode...">
            <button class="m-hero-cta-button" style="padding:6px 14px; font-size:11px;" onclick="checkPdpPincode()">Check</button>
          </div>
          <div id="pdpPincodeResult" style="font-size:11px; font-weight:700; color:#16a34a; margin-top:6px;">
            🟢 Express Same-Day Delivery available in Madhurawada (530041)
          </div>
        </div>

        <!-- Product Overview -->
        <h4 style="font-size:12px; font-weight:800; color:#0f172a; margin-bottom:4px;">Product Overview:</h4>
        <p style="font-size:11px; color:#475569; line-height:1.5; margin-bottom:14px;">
          ${product.description}<br><br>
          • 100% Quality checked & durable build.<br>
          • Ideal for birthday return gifts & festive occasions.<br>
          • 7-day hassle free replacement guarantee.
        </p>

        <!-- Specifications Table -->
        <h4 style="font-size:12px; font-weight:800; color:#0f172a; margin-bottom:6px;">Product Specifications:</h4>
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:10px; margin-bottom:16px; font-size:11px;">
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #e2e8f0;">
            <span style="color:#64748b;">Category:</span> <strong style="color:#111827;">${product.category}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #e2e8f0;">
            <span style="color:#64748b;">Recommended Age:</span> <strong style="color:#111827;">3+ Years & Above</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #e2e8f0;">
            <span style="color:#64748b;">Dispatch Weight:</span> <strong style="color:#111827;">450g Standard Pack</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0;">
            <span style="color:#64748b;">Store Origin:</span> <strong style="color:#111827;">Madhurawada, Visakhapatnam</strong>
          </div>
        </div>

        <!-- Customer Reviews Breakdown -->
        <h4 style="font-size:12px; font-weight:800; color:#0f172a; margin-bottom:6px;">Customer Reviews & Ratings:</h4>
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:14px; padding:12px; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
            <div style="text-align:center;">
              <div style="font-size:26px; font-weight:800; color:#111827;">${product.rating}</div>
              <div style="font-size:11px; color:#f59e0b; font-weight:800;">★★★★★</div>
              <div style="font-size:9px; color:#64748b;">${product.reviewsCount} Ratings</div>
            </div>
            <div style="flex:1; display:flex; flex-direction:column; gap:4px; font-size:10px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span>5★</span>
                <div class="rating-bar-bg"><div class="rating-bar-fill" style="width:85%;"></div></div>
                <span>85%</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span>4★</span>
                <div class="rating-bar-bg"><div class="rating-bar-fill" style="width:10%;"></div></div>
                <span>10%</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span>3★</span>
                <div class="rating-bar-bg"><div class="rating-bar-fill" style="width:5%;"></div></div>
                <span>5%</span>
              </div>
            </div>
          </div>

          <div style="border-top:1px solid #e2e8f0; padding-top:8px;">
            <div style="font-size:11px; font-weight:800; color:#111827;">Verified Customer Feedback:</div>
            <p style="font-size:11px; color:#475569; margin-top:3px;">"Outstanding quality! Purchased for my kid's birthday in Madhurawada. Packaging was top-notch." — <strong>Sowmya R. (Verified Buyer)</strong></p>
          </div>
        </div>

        <!-- Related Products Rail -->
        ${relatedItems.length > 0 ? `
          <h4 style="font-size:12px; font-weight:800; color:#0f172a; margin-bottom:6px;">You Might Also Like:</h4>
          <div class="m-horizontal-product-rail no-scrollbar" style="padding:0 0 10px 0;">
            ${relatedItems.map((p, idx) => createMiniProductHTML(p, idx)).join('')}
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pdp-action-buttons-wrap">
      <button class="pdp-btn-amazon-cart" onclick="addPdpToCart(false)">
        <i class="ri-shopping-bag-line"></i> Add to Cart
      </button>
      <button class="pdp-btn-amazon-buy" onclick="addPdpToCart(true)">
        ⚡ Buy Now
      </button>
    </div>
  `;
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
    { title: "Password Hardbound Journals", icon: "📓", count: 14 },
    { title: "Pastel Marker Highlighter Packs", icon: "🖍️", count: 16 },
    { title: "Calligraphy Brush Sets", icon: "🎨", count: 12 }
  ],
  "Return Gifts": [
    { title: "Kids Birthday Combo Boxes", icon: "🎁", count: 25 },
    { title: "Custom Name Keychains", icon: "🔑", count: 18 },
    { title: "Eco Seed Pencil Gift Packs", icon: "🌱", count: 22 },
    { title: "Mini Drawing & Color Kits", icon: "✏️", count: 15 }
  ]
};

/* ==========================================================================
   1. FINISH CATEGORIES DIRECTORY VIEW
   ========================================================================== */
function renderCategoriesView() {
  const container = document.getElementById('viewCategories');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">Browse Categories</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="checkout-card" style="margin-bottom:14px; background:linear-gradient(135deg, #0f172a, #334155); color:#ffffff; padding:18px;">
        <span style="font-size:10px; font-weight:800; color:#fef08a; letter-spacing:0.04em;">BOUTIQUE TAXONOMY DIRECTORY</span>
        <h2 style="font-size:18px; font-weight:800; margin:4px 0 6px 0;">200+ Curated Products</h2>
        <p style="font-size:11px; opacity:0.9;">Explore direct store offerings in Visakhapatnam across Toys, Gadgets, Artisan Crafts, Stationery & Return Gifts.</p>
      </div>

      ${CATEGORIES.map(cat => {
        const count = ALL_PRODUCTS.filter(p => p.category === cat).length;
        const subcats = SUBCATEGORIES_MAP[cat] || [];
        return `
          <div class="checkout-card" style="margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <div>
                <h3 style="font-size:15px; font-weight:800; color:#111827;">${cat === 'Toys' ? '🧸' : cat === 'Gadgets' ? '📱' : cat === 'Handicrafts' ? '🎨' : cat === 'Stationery' ? '✏️' : '🎁'} ${cat} Collection</h3>
                <span style="font-size:11px; color:#64748b; font-weight:600;">${count} Products Available</span>
              </div>
              <button class="m-hero-cta-button" style="font-size:12px; min-height:36px; padding:6px 16px;" onclick="switchView('plp', { category: '${cat}' })">
                Open PLP →
              </button>
            </div>

            <div class="m-subcat-grid">
              ${subcats.map(sub => `
                <div class="m-subcat-card" onclick="switchView('plp', { category: '${cat}' })">
                  <div class="m-subcat-icon">${sub.icon}</div>
                  <div class="m-subcat-title">${sub.title}</div>
                  <div class="m-subcat-count">${sub.count} items</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ==========================================================================
   2. BUILD PRODUCT LISTING PAGE (PLP) FROM SCRATCH
   ========================================================================== */
function renderPLPView(categoryName = 'All') {
  plpCategory = categoryName;
  const container = document.getElementById('viewPLP');

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

function createMobileListCardHTML(product, index = 0) {
  const isWishlisted = wishlist.includes(product.id);
  const effectivePrice = getEffectivePrice(product.price);
  const saveAmount = product.originalPrice - effectivePrice;
  return `
    <div class="m-product-list-card" onclick="openProductPage(${product.id})">
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
          <button class="m-tile-add-btn" style="margin-top:6px; padding:6px 10px;" onclick="event.stopPropagation(); quickAddToCart(${product.id})">
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

  if (matches.length === 0) {
    grid.innerHTML = `
      <div style="text-align:center; padding:30px 10px; background:#fff; border-radius:20px;">
        <div style="font-size:32px; margin-bottom:6px;">🔍</div>
        <h4 style="font-size:15px; font-weight:800;">No Items Match "${query}"</h4>
        <p style="font-size:11px; color:#64748b; margin-bottom:14px;">Try searching for "Toys", "Gadgets", or "Gifts"</p>
        <div style="font-size:12px; font-weight:800; text-align:left; margin-bottom:8px;">Recommended Items For You:</div>
        <div class="m-product-grid-2col" style="padding:0;">
          ${ALL_PRODUCTS.slice(0, 4).map((p, idx) => createMobileTileHTML(p, idx)).join('')}
        </div>
      </div>
    `;
  } else {
    grid.innerHTML = `
      <div style="font-size:12px; font-weight:800; color:#334155; margin-bottom:8px;">Found ${matches.length} matching items:</div>
      <div class="m-product-grid-2col" style="padding:0;">
        ${matches.map((p, idx) => createMobileTileHTML(p, idx)).join('')}
      </div>
    `;
  }
}

function openVoiceSearchModal() {
  alert('🎤 Voice Search Activated! Listening for product name...');
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
                  <div style="font-size:10px; color:#64748b;">Qty: ${item.qty} × ₹${item.price}</div>
                </div>
                <div style="font-weight:800; color:#0f172a;">₹${item.qty * item.price}</div>
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
    alert('🎉 Coupon UNIQUE10 Applied! You get 10% Extra Discount.');
    renderCheckoutView();
  } else {
    alert('❌ Invalid Coupon Code! Try UNIQUE10');
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
    alert('⚠️ Please enter your Full Name and Mobile / WhatsApp Number to proceed!');
    if (!name && nameInput) nameInput.focus();
    else if (!phone && phoneInput) phoneInput.focus();
    return;
  }

  if (cart.length === 0) {
    alert('Your cart is empty! Please add items before placing an order.');
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
              <span>${item.title} (x${item.qty})</span>
              <span style="font-weight:700; color:#0f172a;">₹${item.qty * item.price}</span>
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
        <button class="m-hero-cta-button" style="background:#fff; color:#0f172a;" onclick="appliedCouponCode='UNIQUE10'; alert('Coupon UNIQUE10 copied! Applied automatically at checkout.'); switchView('checkout');">
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
  const wishProducts = ALL_PRODUCTS.filter(p => wishlist.includes(p.id));

  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">My Wishlist (${wishlist.length})</span>
      ${wishlist.length > 0 ? `
        <button class="m-back-btn" style="background:#fee2e2; color:#dc2626; border-color:#fca5a5;" onclick="clearWishlist()">Clear All</button>
      ` : '<div></div>'}
    </div>

    <div class="checkout-container">
      ${wishProducts.length === 0 ? `
        <div class="checkout-card" style="text-align:center; padding:40px 16px;">
          <div style="width:60px; height:60px; border-radius:50%; background:#f1f5f9; color:#64748b; font-size:26px; display:flex; align-items:center; justify-content:center; margin:0 auto 12px auto;">❤️</div>
          <h3 style="font-size:16px; font-weight:800; color:#0f172a; margin-bottom:6px;">Your Wishlist is Empty</h3>
          <p style="font-size:11px; color:#64748b; margin-bottom:16px;">Tap the heart icon on any product to save items for quick access later.</p>
          <button class="m-hero-cta-button" style="width:100%; justify-content:center;" onclick="switchView('home')">Explore Store Catalog →</button>
        </div>

        <div style="margin-top:16px;">
          <h4 style="font-size:13px; font-weight:800; color:#0f172a; margin-bottom:10px;">🔥 Recommended Items You Might Like</h4>
          <div class="m-product-grid-2col" style="padding:0;">
            ${ALL_PRODUCTS.slice(0, 4).map((p, idx) => createMobileTileHTML(p, idx)).join('')}
          </div>
        </div>
      ` : `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span style="font-size:12px; font-weight:800; color:#334155;">Saved Items (${wishProducts.length})</span>
          <button class="m-hero-cta-button" style="padding:5px 12px; font-size:11px;" onclick="moveWishlistToCart()">Move All to Cart →</button>
        </div>

        <div class="m-product-grid-2col" style="padding:0;">
          ${wishProducts.map((p, idx) => createMobileTileHTML(p, idx)).join('')}
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
  alert('✅ All wishlist items moved to cart!');
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
function renderProfileView() {
  const container = document.getElementById('viewProfile');
  const defaultAddress = userAddresses.find(a => a.isDefault) || userAddresses[0];

  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Store</button>
      <span class="m-view-title">My Account Portal</span>
      <button class="m-icon-btn-circle" onclick="openEditProfileModal()" title="Edit Profile"><i class="ri-edit-line"></i></button>
    </div>

    <div class="checkout-container">
      <!-- Profile User Header Card -->
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
              <p style="font-size:11px; color:#64748b; margin-top:2px;">📞 ${userProfile.phone} • ${userProfile.city}</p>
              <p style="font-size:10px; color:#94a3b8;">✉️ ${userProfile.email}</p>
            </div>
          </div>
        </div>

        <!-- Quick Stats Grid -->
        <div class="profile-stats-grid">
          <div class="profile-stat-box" onclick="switchView('orderDetails')">
            <div class="profile-stat-num">${userOrders.length}</div>
            <div class="profile-stat-label">Total Orders</div>
          </div>
          <div class="profile-stat-box" onclick="switchView('wishlist')">
            <div class="profile-stat-num">${wishlist.length}</div>
            <div class="profile-stat-label">Saved Items</div>
          </div>
          <div class="profile-stat-box" onclick="switchView('addresses')">
            <div class="profile-stat-num">${userAddresses.length}</div>
            <div class="profile-stat-label">Addresses</div>
          </div>
        </div>
      </div>

      <!-- Quick Action Menu Tiles -->
      <h4 style="font-size:12px; font-weight:800; color:#334155; margin-bottom:8px;">MY ACCOUNT & SHOPPING</h4>

      <div class="profile-menu-tile" onclick="switchView('orderDetails')">
        <div class="profile-menu-left">
          <div class="profile-menu-icon"><i class="ri-shopping-bag-3-line"></i></div>
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
            <div class="profile-menu-sub">${defaultAddress ? defaultAddress.area + ' (' + defaultAddress.pincode + ')' : 'Manage delivery addresses'}</div>
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

      ${userOrders.length > 0 ? `
        <div class="profile-menu-tile" onclick="openInvoiceModal('${userOrders[0].orderId}')">
          <div class="profile-menu-left">
            <div class="profile-menu-icon"><i class="ri-file-text-line"></i></div>
            <div>
              <div class="profile-menu-title">Printable GST Invoice</div>
              <div class="profile-menu-sub">Official Tax Invoice for Order #${userOrders[0].orderId}</div>
            </div>
          </div>
          <span style="font-size:12px; color:#94a3b8;">→</span>
        </div>
      ` : ''}

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

      <div class="checkout-card" style="text-align:center; margin-top:14px;">
        <h4 style="font-size:12px; font-weight:800; color:#334155; margin-bottom:4px;">Store Management Portal</h4>
        <button class="m-hero-cta-button" style="width:100%; justify-content:center; min-height:44px;" onclick="openAdminPinModal()">🔐 Open Store Admin System →</button>
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
    alert('Please fill in all address fields!');
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
                <div style="font-size:11px; color:#64748b;">Qty: ${item.qty} × ₹${item.price}</div>
              </div>
              <strong style="font-size:12px; color:#0f172a;">₹${item.qty * item.price}</strong>
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
    if (existing) existing.qty += item.qty;
    else cart.push({ ...item, qty: item.qty });
  });
  saveCart();
  alert(`✅ Items from Order #${orderId} re-added to your cart!`);
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
    alert('Please enter your name and phone number!');
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
                <td style="padding:4px; text-align:center;">${item.qty}</td>
                <td style="padding:4px; text-align:right;">₹${item.price}</td>
                <td style="padding:4px; text-align:right;">₹${item.qty * item.price}</td>
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

/* ==========================================================================
   FULL ADMIN MANAGEMENT DASHBOARD VIEW
   ========================================================================== */
function renderAdminView() {
  const container = document.getElementById('viewAdmin');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Store View</button>
      <span class="m-view-title">Admin Management System</span>
      <div></div>
    </div>

    <div class="admin-container">
      <div class="admin-card">
        <h3 style="font-size:15px; font-weight:800; margin-bottom:12px;">Add New Inventory Product</h3>
        <div class="form-group">
          <label class="form-label">Product Title</label>
          <input type="text" id="admTitle" class="form-input" placeholder="e.g. Remote Control Helicopter">
        </div>
        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label">Category</label>
            <select id="admCategory" class="form-input">
              <option value="Toys">Toys</option>
              <option value="Gadgets">Gadgets</option>
              <option value="Handicrafts">Handicrafts</option>
              <option value="Stationery">Stationery</option>
              <option value="Return Gifts">Return Gifts</option>
            </select>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">Price (₹)</label>
            <input type="number" id="admPrice" class="form-input" placeholder="e.g. 599">
          </div>
        </div>
        <button class="m-hero-cta-button" style="width:100%; justify-content:center;" onclick="adminAddNewProduct()">
          + Publish Product to Store
        </button>
      </div>

      <div class="admin-card">
        <h3 style="font-size:15px; font-weight:800; margin-bottom:12px;">Manage Live Products (${ALL_PRODUCTS.length})</h3>
        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${ALL_PRODUCTS.slice(0, 15).map(p => `
                <tr>
                  <td>#${p.id}</td>
                  <td><strong>${p.title.slice(0, 18)}...</strong></td>
                  <td>${p.category}</td>
                  <td>₹${p.price}</td>
                  <td>
                    <button style="background:#ef4444; color:#fff; border:none; padding:3px 6px; border-radius:4px; font-size:9px; cursor:pointer;" onclick="adminDeleteProduct(${p.id})">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function adminAddNewProduct() {
  const title = document.getElementById('admTitle')?.value;
  const category = document.getElementById('admCategory')?.value;
  const price = parseFloat(document.getElementById('admPrice')?.value || '0');

  if (!title || !price) {
    alert('Please enter product title and price!');
    return;
  }

  const newProd = {
    title: title,
    category: category,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop',
    price: price,
    originalPrice: Math.round(price * 1.25),
    discount: 20,
    rating: '5.0',
    reviewsCount: 1,
    description: `New ${category} item added by store admin.`
  };

  // Try Supabase first to get a real auto-incremented ID
  const sbResult = await sbAdminInsertProduct(newProd);
  if (sbResult) {
    newProd.id = sbResult.id;
    alert(`✅ Product "${title}" published to Supabase & store!`);
  } else {
    // Fallback: use local ID
    newProd.id = ALL_PRODUCTS.length + 1;
    alert(`✅ Product "${title}" published locally (Supabase sync pending).`);
  }

  ALL_PRODUCTS.unshift(newProd);
  localStorage.setItem('ue_products', JSON.stringify(ALL_PRODUCTS));

  renderAdminView();
  renderAllSections();
}

async function adminDeleteProduct(id) {
  if (confirm(`Are you sure you want to delete Product #${id}?`)) {
    ALL_PRODUCTS = ALL_PRODUCTS.filter(p => p.id !== id);
    localStorage.setItem('ue_products', JSON.stringify(ALL_PRODUCTS));
    sbAdminDeleteProduct(id).catch(err => console.warn('[UE] Delete sync failed:', err));
    renderAdminView();
    renderAllSections();
  }
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
          <span style="font-size:12px; font-weight:800; color:#0f172a; min-width:14px; text-align:center;">${item.qty}</span>
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
  renderAllSections();
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
  const pin = document.getElementById('adminPinInput')?.value;
  if (pin === '1234') {
    closeAdminPinModal();
    switchView('admin');
  } else {
    alert('❌ Incorrect PIN! Try 1234');
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

/* 1. ABOUT US PAGE */
function renderAboutView() {
  const container = document.getElementById('viewAbout');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">About Unique Expressions</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="info-hero-card">
        <span class="profile-vip-pill" style="margin-bottom:8px;">LUXURY E-COMMERCE BOUTIQUE</span>
        <h1 class="info-hero-title">UNIQUE EXPRESSIONS</h1>
        <p class="info-hero-sub">Visakhapatnam's premier destination for curated Kids Toys, Smart Gadgets, Artisan Handicrafts, Fancy Stationery, and Customized Return Gift Hampers.</p>
      </div>

      <div class="info-content-card">
        <h3 class="info-section-heading">🌟 Our Store Story & Vision</h3>
        <p class="info-text-p">
          Founded and managed by <strong>G MOUNIKA DURGA</strong>, UNIQUE EXPRESSIONS is a boutique retail and wholesale storefront based in Midhilapuri VUDA Colony, Madhurawada, Visakhapatnam.
        </p>
        <p class="info-text-p">
          We bring together high-grade educational toys for toddlers, innovative gadgets for tech enthusiasts, traditional Indian handicrafts crafted by master artisans, aesthetic school stationery, and custom birthday party return gifts under one roof.
        </p>
      </div>

      <div class="info-content-card">
        <h3 class="info-section-heading">🏢 Physical Store Details & GSTIN</h3>
        <div style="font-size:11.5px; color:#334155; line-height:1.6; background:#f8fafc; padding:12px; border-radius:14px; border:1px solid #e2e8f0; margin-bottom:12px;">
          <strong>Store Owner:</strong> G MOUNIKA DURGA<br>
          <strong>Official GSTIN:</strong> 37BVTPG7761F1Z1<br>
          <strong>Address:</strong> 2nd floor LIG 347, 2-115/9/1, near Shivalayam, Midhilapuri VUDA Colony, Madhurawada, Visakhapatnam - 530041<br>
          <strong>Contact / WhatsApp:</strong> +91 8886662334
        </div>

        <button class="m-hero-cta-button" style="width:100%; justify-content:center; background:#25D366;" onclick="openWhatsAppChat()">
          💬 Connect Directly on WhatsApp →
        </button>
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

async function submitCustomerReview() {
  const productSelect = document.getElementById('revProductSelect');
  const rating = parseInt(document.getElementById('revRatingValue').value || '5');
  const title = document.getElementById('revTitleInput').value.trim();
  const comment = document.getElementById('revCommentInput').value.trim();
  const name = document.getElementById('revNameInput').value.trim() || 'G Mounika Durga';

  if (!title || !comment) {
    alert('Please enter a review headline and comment.');
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
    helpfulCount: 1
  };

  // Save locally first
  userReviews.unshift(newRev);
  localStorage.setItem('ue_reviews', JSON.stringify(userReviews));

  // Sync to Supabase (non-blocking)
  sbInsertReview(newRev).catch(err => console.warn('[UE] Review sync failed:', err));

  closeWriteReviewModal();
  alert('Thank you! Your verified customer review has been submitted.');
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

  alert(`Return request submitted! Your Return ID is ${returnObj.returnId}. Our team will schedule pickup within 24 hours.`);
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
    alert('Please enter a subject and message.');
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
  alert(`Support Ticket #${ticketObj.ticketId} created! Our store representative will contact you via WhatsApp/Phone.`);
  renderHelpCenterView();
}


/* 4. STORE LOCATOR & VIZAG BOUTIQUE VIEW */
function renderStoreLocatorView() {
  const container = document.getElementById('viewStoreLocator');
  if (!container) return;

  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">Visakhapatnam Store Locator</span>
      <div></div>
    </div>

    <div class="checkout-container">
      <div class="store-map-card">
        <div class="store-map-overlay">
          <span style="font-size:10px; font-weight:800; text-transform:uppercase; color:var(--func-gold); letter-spacing:1px;">FLAGSHIP BOUTIQUE STORE</span>
          <h2 style="font-size:18px; font-weight:800; margin:2px 0;">UNIQUE EXPRESSIONS</h2>
          <p style="font-size:11px; opacity:0.9; margin-bottom:8px;">Madhurawada, Visakhapatnam - 530041</p>
          <a href="https://maps.google.com/?q=Midhilapuri+VUDA+Colony+Madhurwada+Visakhapatnam" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:#ffffff; color:#0f172a; padding:6px 14px; border-radius:99px; font-size:11px; font-weight:800; text-decoration:none;">
            <i class="ri-navigation-fill" style="color:var(--brand-magenta);"></i> Get Google Maps Directions
          </a>
        </div>
      </div>

      <div class="info-content-card">
        <h3 class="info-section-heading">🏢 Store Details & Physical Address</h3>
        <p class="info-text-p">
          <strong>Owner Name:</strong> G MOUNIKA DURGA<br>
          <strong>Address:</strong> UNIQUE Expressions, 2nd floor LIG 347, 2-115/9/1, near Shivalayam, Midhilapuri VUDA Colony, Madhurwada, Visakhapatnam - 530041<br>
          <strong>Landmark:</strong> Near Shivalayam Temple, Midhilapuri VUDA Colony<br>
          <strong>Contact Number:</strong> +91 8886662334<br>
          <strong>GSTIN:</strong> <code>37BVTPG7761F1Z1</code>
        </p>

        <h3 class="info-section-heading">🕒 Operating Hours</h3>
        <p class="info-text-p">
          • <strong>Monday to Sunday:</strong> 9:30 AM – 9:30 PM (Open 7 Days a Week)<br>
          • <strong>Festival Days:</strong> Special extended hours for Diwali, Sankranti & Christmas shopping.
        </p>

        <h3 class="info-section-heading">🛍️ In-Store Facilities & Services</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;">
          <div class="facility-badge">🎁 Custom Gift Hampers</div>
          <div class="facility-badge">📦 Wholesale Counter</div>
          <div class="facility-badge">⚡ Express Store Pickup</div>
          <div class="facility-badge">💳 Cards, UPI & Cash</div>
        </div>

        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="m-hero-cta-button" style="flex:1; justify-content:center;" onclick="window.location.href='tel:+918886662334'">
            <i class="ri-phone-line"></i> Call Store Now
          </button>
          <button class="m-hero-cta-button" style="flex:1; justify-content:center; background:#25D366; box-shadow:none;" onclick="openWhatsAppChat()">
            <i class="ri-whatsapp-line"></i> WhatsApp Location
          </button>
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
    alert(`Coupon code "${code}" copied to clipboard! Paste it at checkout for instant discounts.`);
  }).catch(() => {
    alert(`Coupon code: ${code}`);
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
    alert('Please enter your Business/School Name and Contact Phone Number.');
    return;
  }
  closeSampleKitModal();
  alert('Thank you! Your Wholesale Sample Kit request has been registered. Our representative G Mounika Durga will contact you within 24 hours.');
}

