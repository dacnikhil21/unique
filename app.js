/* ==========================================================================
   UNIQUE EXPRESSIONS - CLIENT-READY PIXEL-PERFECT MOBILE APP LOGIC
   ========================================================================== */

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
let pricingMode = localStorage.getItem('ue_pricing_mode') || 'retail';
let wholesaleDiscountRate = parseInt(localStorage.getItem('ue_wholesale_disc') || '20', 10);

let cart = JSON.parse(localStorage.getItem('ue_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('ue_wishlist') || '[]');
let recentlyViewed = JSON.parse(localStorage.getItem('ue_recently_viewed') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  setPricingMode(pricingMode, false);
  renderAllSections();
  updateBadges();
  if (window.feather) feather.replace();
  if (window.lucide) lucide.createIcons();
});

function getEffectivePrice(basePrice) {
  if (pricingMode === 'wholesale') {
    return Math.round(basePrice * (1 - wholesaleDiscountRate / 100));
  }
  return basePrice;
}

function setPricingMode(mode, refresh = true) {
  pricingMode = mode;
  localStorage.setItem('ue_pricing_mode', mode);

  const btnRetailMob = document.getElementById('btnModeRetailMob');
  const btnWholesaleMob = document.getElementById('btnModeWholesaleMob');

  if (mode === 'wholesale') {
    if (btnRetailMob) btnRetailMob.classList.remove('active');
    if (btnWholesaleMob) btnWholesaleMob.classList.add('active');
  } else {
    if (btnWholesaleMob) btnWholesaleMob.classList.remove('active');
    if (btnRetailMob) btnRetailMob.classList.add('active');
  }

  if (refresh) renderAllSections();
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

  container.innerHTML = filtered.slice(0, 16).map(p => createMobileTileHTML(p)).join('');
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
  container.innerHTML = products.slice(0, 8).map(p => createMiniProductHTML(p)).join('');
}

function renderBestSellers() {
  const container = document.getElementById('bestSellersRail');
  if (!container) return;
  const best = ALL_PRODUCTS.slice(0, 8);
  container.innerHTML = best.map(p => createMiniProductHTML(p)).join('');
}

function renderRecommended() {
  const container = document.getElementById('recommendedRail');
  if (!container) return;
  const recs = ALL_PRODUCTS.slice(8, 16);
  container.innerHTML = recs.map(p => createMiniProductHTML(p)).join('');
}

function renderNewArrivals() {
  const container = document.getElementById('newArrivalsRail');
  if (!container) return;
  const arrivals = ALL_PRODUCTS.slice(16, 24);
  container.innerHTML = arrivals.map(p => createMiniProductHTML(p)).join('');
}

function createMobileTileHTML(product) {
  const isWishlisted = wishlist.includes(product.id);
  const effectivePrice = getEffectivePrice(product.price);
  const saveAmount = product.originalPrice - effectivePrice;

  return `
    <div class="m-product-tile-card" onclick="trackViewAndOpenModal(${product.id})">
      <div class="m-tile-img-wrapper">
        <img src="${product.image}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop'">
        <span class="m-discount-badge-orange">${product.discount}% OFF</span>
        <span class="m-rating-badge-gold">★ ${product.rating}</span>
        <button class="m-wishlist-heart-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
          <i data-feather="heart" style="width:14px; height:14px; ${isWishlisted ? 'fill:#b55282; stroke:#b55282;' : ''}"></i>
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

function createMiniProductHTML(product) {
  const effectivePrice = getEffectivePrice(product.price);
  return `
    <div class="m-mini-product-card" onclick="trackViewAndOpenModal(${product.id})">
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

function toggleWishlist(productId) {
  const index = wishlist.indexOf(productId);
  if (index > -1) wishlist.splice(index, 1);
  else wishlist.push(productId);
  localStorage.setItem('ue_wishlist', JSON.stringify(wishlist));
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
