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

if (!ALL_PRODUCTS || ALL_PRODUCTS.length === 0) {
  ALL_PRODUCTS = [];
  let productIdCounter = 1;
  CATEGORIES.forEach(cat => {
    const seeds = SEED_TEMPLATES[cat];
    for (let i = 0; i < 40; i++) {
      const seed = seeds[i % seeds.length];
      const title = i > 3 ? `${seed.title} (Variant #${i + 1})` : seed.title;
      const basePrice = seed.basePrice + (i * 10);
      const originalPrice = Math.round(basePrice * (1 + seed.discount / 100));
      
      ALL_PRODUCTS.push({
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
let userOrders = JSON.parse(localStorage.getItem('ue_orders') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  switchView('home');
  updateBadges();
  startHeroCarousel();
  if (window.feather) feather.replace();
  if (window.lucide) lucide.createIcons();
});

/* ==========================================================================
   SPA ROUTER ENGINE
   ========================================================================== */
function switchView(viewName, params = {}) {
  currentView = viewName;
  document.querySelectorAll('.app-view').forEach(el => el.classList.remove('active-view'));

  // Header and Floating Cart FAB visibility
  const globalHeader = document.querySelector('.m-app-header');
  const globalSearch = document.querySelector('.m-search-wrap-sticky');
  const cartFab = document.getElementById('mFloatingCartFab');

  if (viewName === 'pdp' || viewName === 'checkout') {
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
  } else if (viewName === 'b2b') {
    renderB2BView();
  } else if (viewName === 'admin') {
    renderAdminView();
  }

  if (window.feather) feather.replace();
  if (window.lucide) lucide.createIcons();
}

function capitalizeFirst(str) {
  if (!str) return '';
  if (str === 'pdp') return 'PDP';
  if (str === 'b2b') return 'B2B';
  return str.charAt(0).toUpperCase() + str.slice(1);
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
        <span class="m-rating-badge-gold">★ ${product.rating}</span>
        <button class="m-wishlist-heart-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id}, this)">
          <i data-feather="heart" style="width:14px; height:14px; ${isWishlisted ? 'fill:#d8448e; stroke:#d8448e;' : ''}"></i>
        </button>
      </div>
      <div class="m-tile-content-box">
        <span class="m-tile-cat-name">${product.category}</span>
        <h4 class="m-tile-title">${product.title}</h4>
        <div class="m-tile-price-row">
          <div>
            <span class="m-tile-curr-price">₹${effectivePrice}</span>
            <span class="m-tile-save-green" style="display:block;">Save ₹${saveAmount}</span>
          </div>
        </div>
        <button class="m-tile-add-btn" onclick="event.stopPropagation(); quickAddToCart(${product.id})">
          <i data-feather="shopping-bag" style="width:12px; height:12px;"></i> + Quick Add
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

  container.innerHTML = `
    <div class="pdp-view-wrapper">
      <!-- 1. Amazon Clean Single Top Header Bar -->
      <div class="pdp-top-bar">
        <button class="pdp-back-icon-btn" onclick="switchView('home')">
          <i data-feather="arrow-left" style="width:18px; height:18px;"></i>
        </button>
        
        <div class="pdp-search-mini-pill" onclick="switchView('home')">
          <i data-feather="search" style="width:14px; color:#94a3b8;"></i>
          <input type="text" class="pdp-search-mini-input" placeholder="Search in store..." readonly>
        </div>

        <div class="pdp-header-actions">
          <button class="pdp-back-icon-btn" onclick="toggleWishlist(${product.id})">
            <i data-feather="heart" style="width:16px; height:16px; ${isWishlisted ? 'fill:#d8448e; stroke:#d8448e;' : ''}"></i>
          </button>
          <button class="pdp-back-icon-btn" onclick="openCartDrawer()">
            <i data-feather="shopping-bag" style="width:16px; height:16px;"></i>
            <span class="m-badge-count-dot id-cart-badge" style="top:-2px; right:-2px;">${cartCount}</span>
          </button>
        </div>
      </div>

      <!-- 2. Full Width Image Frame with Single Badge & Pagination Dots -->
      <div class="pdp-gallery-frame">
        <img src="${product.image}" alt="${product.title}">
        <span class="pdp-single-badge">🔥 ${product.discount}% OFF</span>
      </div>

      <div class="pdp-dots-indicator">
        <div class="pdp-dot active"></div>
        <div class="pdp-dot"></div>
        <div class="pdp-dot"></div>
      </div>

      <!-- 3. Amazon PDP Card using UE Brand Palette -->
      <div class="pdp-card-box">
        <span class="pdp-brand-link">Brand: Unique Expressions Store > ${product.category}</span>
        <h1 class="pdp-title-text">${product.title}</h1>

        <div class="pdp-amazon-rating-bar">
          <span class="pdp-rating-pill">★ ${product.rating} / 5.0</span>
          <span>(${product.reviewsCount} verified reviews)</span>
          <span class="pdp-bought-tag">🔥 200+ bought this month</span>
        </div>

        <!-- Amazon Style Price Section -->
        <div class="pdp-amazon-price-row">
          <span class="pdp-discount-tag-red">-${product.discount}%</span>
          <span class="pdp-main-price-val">₹${product.price}</span>
          <span class="pdp-mrp-val">M.R.P.: ₹${product.originalPrice}</span>
        </div>
        <span class="pdp-tax-note">Inclusive of all taxes • Official GST Input Credit Invoice</span>

        <!-- Style / Variant Selector -->
        <span style="font-size:11px; font-weight:800; color:#334155; margin-bottom:6px; display:block;">Select Variant:</span>
        <div class="pdp-variant-chips-row">
          <div class="pdp-chip-item active" onclick="selectPdpVariant(this, 'Standard Pack')">Standard Pack</div>
          <div class="pdp-chip-item" onclick="selectPdpVariant(this, 'Pack of 5 (Gift Box)')">Pack of 5 (Gift Box)</div>
          <div class="pdp-chip-item" onclick="selectPdpVariant(this, 'Bulk Wholesale')">Bulk Wholesale</div>
        </div>

        <!-- Custom Mobile Stepper Quantity Selector -->
        <span style="font-size:11px; font-weight:800; color:#334155; margin-bottom:6px; display:block;">Quantity:</span>
        <div class="pdp-stepper-box">
          <button class="pdp-stepper-btn" onclick="updatePdpQty(-1)">-</button>
          <span class="pdp-stepper-val" id="pdpQtyDisplay">1</span>
          <button class="pdp-stepper-btn" onclick="updatePdpQty(1)">+</button>
        </div>

        <!-- Amazon Style Delivery & Stock Box -->
        <div class="pdp-amazon-delivery-box">
          <div class="pdp-stock-green">🟢 In Stock</div>
          <div style="font-weight:700; color:#0f172a; margin-bottom:2px;">
            📍 FREE Express Delivery by Tomorrow
          </div>
          <div style="font-size:10px; color:#64748b;">
            Delivering to Visakhapatnam - 530041 (Dispatched from Madhurawada Store)
          </div>
        </div>

        <h4 style="font-size:12px; font-weight:800; color:#0f172a; margin-bottom:4px;">Product Overview:</h4>
        <p style="font-size:11px; color:#475569; line-height:1.5;">
          ${product.description}<br><br>
          • 100% Quality checked & durable build.<br>
          • Ideal for birthday return gifts & festive occasions.<br>
          • 7-day hassle free replacement guarantee.
        </p>
      </div>
    </div>

    <!-- 4. Amazon Side-by-Side Action Buttons (UE Brand Palette, Anchored Above Bottom Nav) -->
    <div class="pdp-action-buttons-wrap">
      <button class="pdp-btn-amazon-cart" onclick="addPdpToCart(false)">
        <i data-feather="shopping-bag" style="width:16px; height:16px;"></i> Add to Cart
      </button>
      <button class="pdp-btn-amazon-buy" onclick="addPdpToCart(true)">
        ⚡ Buy Now
      </button>
    </div>
  `;
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
   DEDICATED CATEGORIES BROWSER VIEW
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
      <div class="checkout-card" style="margin-bottom:16px;">
        <h3 style="font-size:16px; font-weight:800; margin-bottom:12px;">Explore Category Directory</h3>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">
          ${CATEGORIES.map(cat => {
            const count = ALL_PRODUCTS.filter(p => p.category === cat).length;
            return `
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:12px; text-align:center; cursor:pointer;" onclick="filterCategory('${cat}'); switchView('home');">
                <div style="font-size:24px; margin-bottom:4px;">${cat === 'Toys' ? '🧸' : cat === 'Gadgets' ? '📱' : cat === 'Handicrafts' ? '🎨' : cat === 'Stationery' ? '✏️' : '🎁'}</div>
                <div style="font-size:12px; font-weight:800; color:#0f172a;">${cat}</div>
                <div style="font-size:10px; color:#64748b;">${count} Products</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
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

      <!-- Step 2: Delivery Address -->
      <div class="checkout-card">
        <div class="checkout-step-title"><span class="checkout-step-num">2</span> Delivery Address (Visakhapatnam)</div>
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" id="chkName" class="form-input" placeholder="e.g. Sowmya Rao">
        </div>
        <div class="form-group">
          <label class="form-label">Mobile / WhatsApp Number *</label>
          <input type="tel" id="chkPhone" class="form-input" placeholder="e.g. 9876543210">
        </div>
        <div class="form-group">
          <label class="form-label">Delivery Street Address *</label>
          <input type="text" id="chkAddress" class="form-input" placeholder="Flat No, Building, Street near Landmark">
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
    date: new Date().toLocaleDateString(),
    items: [...cart],
    totalAmount: grandTotal,
    status: 'Order Confirmed',
    customerName: name,
    phone: phone,
    address: address || 'Madhurawada, Visakhapatnam'
  };

  userOrders.unshift(orderRecord);
  localStorage.setItem('ue_orders', JSON.stringify(userOrders));

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
        <span style="background:rgba(216, 68, 142, 0.1); color:var(--brand-magenta-dark); font-size:11px; font-weight:800; padding:4px 12px; border-radius:99px; display:inline-block; margin-bottom:10px;">
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
      <div class="checkout-card" style="background:linear-gradient(135deg, #2a1e54, #d8448e); color:#fff;">
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
      <div></div>
    </div>

    <div class="checkout-container">
      ${wishProducts.length === 0 ? `
        <div class="checkout-card" style="text-align:center; padding:40px 16px;">
          <h3 style="font-size:16px; font-weight:800; margin-bottom:6px;">Your Wishlist is Empty</h3>
          <p style="font-size:11px; color:#64748b; margin-bottom:14px;">Tap the heart icon on any product to save it for later.</p>
          <button class="m-hero-cta-button" style="justify-content:center;" onclick="switchView('home')">Explore Store Products →</button>
        </div>
      ` : `
        <div class="m-product-grid-2col" style="padding:0;">
          ${wishProducts.map((p, idx) => createMobileTileHTML(p, idx)).join('')}
        </div>
      `}
    </div>
  `;
}

/* ==========================================================================
   USER PROFILE & ORDER TRACKING VIEW
   ========================================================================== */
function renderProfileView() {
  const container = document.getElementById('viewProfile');
  container.innerHTML = `
    <div class="m-view-header-bar">
      <button class="m-back-btn" onclick="switchView('home')">← Home</button>
      <span class="m-view-title">My Profile & Orders</span>
      <button class="m-icon-btn-circle" onclick="openAdminPinModal()"><i data-feather="shield"></i></button>
    </div>

    <div class="checkout-container">
      <div class="checkout-card" style="display:flex; align-items:center; gap:14px;">
        <div style="width:50px; height:50px; border-radius:50%; background:var(--brand-magenta); color:#fff; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800;">UE</div>
        <div>
          <h3 style="font-size:15px; font-weight:800;">Visakhapatnam Store Customer</h3>
          <p style="font-size:11px; color:#64748b;">Owner Contact: G MOUNIKA DURGA (+91 8886662334)</p>
        </div>
      </div>

      <div class="checkout-card">
        <h3 style="font-size:14px; font-weight:800; margin-bottom:12px;">Order History (${userOrders.length})</h3>
        ${userOrders.length === 0 ? `<p style="font-size:12px; color:#64748b;">No recent orders placed yet.</p>` : `
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${userOrders.map(ord => `
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:12px;">
                <div style="display:flex; justify-content:space-between; font-weight:800; font-size:12px; margin-bottom:4px;">
                  <span>${ord.orderId}</span>
                  <span style="color:var(--func-green); font-size:11px;">● ${ord.status}</span>
                </div>
                <div style="font-size:10px; color:#64748b; margin-bottom:6px;">Date: ${ord.date} • Total: ₹${ord.totalAmount}</div>
                <div style="font-size:11px; font-weight:700; color:#334155;">Delivery to: ${ord.customerName} (${ord.address})</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div class="checkout-card" style="text-align:center;">
        <h4 style="font-size:13px; font-weight:800; margin-bottom:6px;">Store Owner Access</h4>
        <button class="m-hero-cta-button" style="justify-content:center;" onclick="openAdminPinModal()">Open Admin Management System →</button>
      </div>
    </div>
  `;
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

function adminAddNewProduct() {
  const title = document.getElementById('admTitle')?.value;
  const category = document.getElementById('admCategory')?.value;
  const price = parseFloat(document.getElementById('admPrice')?.value || '0');

  if (!title || !price) {
    alert('Please enter product title and price!');
    return;
  }

  const newProd = {
    id: ALL_PRODUCTS.length + 1,
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

  ALL_PRODUCTS.unshift(newProd);
  localStorage.setItem('ue_products', JSON.stringify(ALL_PRODUCTS));

  alert(`✅ Product "${title}" published successfully!`);
  renderAdminView();
  renderAllSections();
}

function adminDeleteProduct(id) {
  if (confirm(`Are you sure you want to delete Product #${id}?`)) {
    ALL_PRODUCTS = ALL_PRODUCTS.filter(p => p.id !== id);
    localStorage.setItem('ue_products', JSON.stringify(ALL_PRODUCTS));
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
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px 10px; color:#94a3b8;"><p style="font-weight:700;">Your Cart is Empty</p></div>`;
    if (subtotalEl) subtotalEl.innerText = "₹0";
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map((item, idx) => {
    subtotal += item.price * item.qty;
    return `
      <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #e2e8f0;">
        <img src="${item.image}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
        <div style="flex:1;">
          <h5 style="font-size:13px; font-weight:700; color:#0f172a;">${item.title}</h5>
          <span style="font-size:13px; font-weight:800; color:var(--brand-magenta-dark);">₹${item.price}</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px; background:#f1f5f9; padding:2px 8px; border-radius:6px;">
          <button onclick="updateCartQty(${idx}, -1)" style="font-weight:800; cursor:pointer;">-</button>
          <span style="font-size:12px; font-weight:700; color:#0f172a;">${item.qty}</span>
          <button onclick="updateCartQty(${idx}, 1)" style="font-weight:800; cursor:pointer;">+</button>
        </div>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.innerText = `₹${subtotal}`;
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
}

function openWhatsAppChat(customMsg) {
  const phone = "918886662334";
  const msg = customMsg || "Hello UNIQUE EXPRESSIONS! I am interested in placing an order.";
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}
