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
        description: `Premium ${cat.toLowerCase()} collection item offered by UNIQUE EXPRESSIONS, Visakhapatnam. Guaranteed durability for retail & wholesale orders.`
      });
    }
  });
  localStorage.setItem('ue_products', JSON.stringify(ALL_PRODUCTS));
}

let activeCategory = 'All';
let currentSelectedModalProduct = null;

let cart = JSON.parse(localStorage.getItem('ue_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('ue_wishlist') || '[]');
let recentlyViewed = JSON.parse(localStorage.getItem('ue_recently_viewed') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  renderAllSections();
  updateBadges();
  startHeroCarousel();
  if (window.feather) feather.replace();
  if (window.lucide) lucide.createIcons();
});

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
    void imgEl.offsetWidth; // force reflow for animation restart
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
    <div class="m-product-tile-card" style="animation-delay: ${delaySec}s;" onclick="trackViewAndOpenModal(${product.id})">
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
    <div class="m-mini-product-card" style="animation: fadeInUp 0.4s ease backwards; animation-delay: ${delaySec}s;" onclick="trackViewAndOpenModal(${product.id})">
      <img src="${product.image}" loading="lazy">
      <div class="m-mini-title">${product.title}</div>
      <div class="m-mini-price">₹${effectivePrice}</div>
    </div>
  `;
}

function trackViewAndOpenModal(productId) {
  if (!recentlyViewed.includes(productId)) {
    recentlyViewed.unshift(productId);
    if (recentlyViewed.length > 10) recentlyViewed.pop();
    localStorage.setItem('ue_recently_viewed', JSON.stringify(recentlyViewed));
  }
  openQuickViewModal(productId);
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
  const mobileContainer = document.getElementById('mobileProductGrid');
  if (q.length === 0) { renderAllSections(); return; }

  const results = ALL_PRODUCTS.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 16);
  if (mobileContainer) mobileContainer.innerHTML = results.map(p => createMobileTileHTML(p)).join('');
  if (window.feather) feather.replace();
  if (window.lucide) lucide.createIcons();
}

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
          <h5 style="font-size:13px; font-weight:700;">${item.title}</h5>
          <span style="font-size:13px; font-weight:800; color:var(--brand-primary);">₹${item.price}</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px; background:#f1f5f9; padding:2px 8px; border-radius:6px;">
          <button onclick="updateCartQty(${idx}, -1)">-</button>
          <span style="font-size:12px; font-weight:700;">${item.qty}</span>
          <button onclick="updateCartQty(${idx}, 1)">+</button>
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

function openQuickViewModal(productId) {
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  currentSelectedModalProduct = product;
  const effectivePrice = getEffectivePrice(product.price);

  document.getElementById('modalProductTitle').innerText = product.title;
  document.getElementById('modalProductImage').src = product.image;
  document.getElementById('modalProductCategory').innerText = product.category;
  document.getElementById('modalProductPrice').innerText = `₹${effectivePrice}`;
  document.getElementById('modalProductOriginal').innerText = `₹${product.originalPrice}`;
  document.getElementById('modalProductDesc').innerText = product.description;

  document.getElementById('modalBackdrop').classList.add('active');
}

function closeAllModals() {
  document.getElementById('modalBackdrop').classList.remove('active');
  document.getElementById('adminPinBackdrop').classList.remove('active');
}

function addModalProductToCart() {
  if (currentSelectedModalProduct) {
    quickAddToCart(currentSelectedModalProduct.id);
    closeAllModals();
  }
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
  const pin = document.getElementById('adminPinInput').value;
  if (pin === '1234') {
    closeAdminPinModal();
    alert('✅ Admin Access Granted!');
  } else {
    alert('❌ Incorrect PIN! Try 1234');
  }
}

function openWhatsAppChat(customMsg) {
  const phone = "918886662334";
  const msg = customMsg || "Hello UNIQUE EXPRESSIONS! I am interested in placing an order.";
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function switchNav(nav) {
  if (nav === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openWishlistDrawer() {
  filterCategory('All');
  window.scrollTo({ top: 500, behavior: 'smooth' });
}
