/* ==========================================================================
   UNIQUE EXPRESSIONS — SUPABASE CLIENT CONFIGURATION & DATABASE HELPERS
   Project: sfcxpvvqxldhdkvfyhgj
   ========================================================================== */

const SUPABASE_URL = 'https://sfcxpvvqxldhdkvfyhgj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmY3hwdnZxeGxkaGRrdmZ5aGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzU4MTQsImV4cCI6MjEwMTE1MTgxNH0.ZNWPL7xNiapsnOrvJ45uT6KpaFqcvzz4vv7R7WGx39c';

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ─────────────────────────────── PRODUCTS ─────────────────────────────── */

async function sbGetProducts() {
  try {
    const { data, error } = await _supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      image: p.image,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
      videoUrl: p.video_url || p.videoUrl || '',
      boughtTogether: p.bought_together || p.boughtTogether || [],
      price: p.price,
      originalPrice: p.original_price,
      discount: p.discount,
      rating: String(p.rating),
      reviewsCount: p.reviews_count,
      description: p.description,
      inStock: p.in_stock,
      stockQty: p.stock_qty != null ? p.stock_qty : 0
    }));
  } catch (err) {
    console.warn('[Supabase] getProducts failed:', err.message);
    return null;
  }
}

async function sbSeedProducts(products) {
  try {
    const rows = products.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      image: p.image,
      images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
      price: p.price,
      original_price: p.originalPrice,
      discount: p.discount,
      rating: parseFloat(p.rating),
      reviews_count: p.reviewsCount,
      description: p.description,
      in_stock: p.inStock !== false,
      stock_qty: Math.max(0, parseInt(p.stockQty, 10) || 0)
    }));
    const { error } = await _supabase.from('products').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    console.log('[Supabase] Seeded ' + rows.length + ' products');
    return true;
  } catch (err) {
    console.warn('[Supabase] seedProducts failed:', err.message);
    return false;
  }
}

async function sbAdminInsertProduct(product) {
  try {
    // 1. Try direct Supabase client
    const { data, error } = await _supabase
      .from('products')
      .insert({
        title: product.title,
        category: product.category || 'General',
        image: product.image || 'logo.png',
        images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image || 'logo.png'],
        video_url: product.videoUrl || '',
        price: parseInt(product.price, 10) || 0,
        original_price: parseInt(product.originalPrice || product.price, 10) || 0,
        discount: parseInt(product.discount, 10) || 0,
        rating: parseFloat(product.rating) || 4.8,
        reviews_count: parseInt(product.reviewsCount, 10) || 12,
        description: product.description || '',
        in_stock: product.inStock !== false,
        stock_qty: Math.max(0, parseInt(product.stockQty, 10) || 10)
      })
      .select()
      .single();

    if (!error && data) return data;
    throw error || new Error('Direct insert failed');
  } catch (err) {
    console.warn('[Supabase Direct Insert Warning]:', err.message, '— Attempting API fallback...');
    // 2. Fallback to /api/products serverless endpoint
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...product })
      });
      const json = await res.json();
      if (json.success && json.product) {
        console.log('[Supabase API Fallback] Product inserted successfully:', json.product.id);
        return json.product;
      }
    } catch (apiErr) {
      console.error('[Supabase API Fallback Error]:', apiErr.message);
    }
    return null;
  }
}

async function sbAdminUpdateProduct(product) {
  try {
    const row = {
      title: product.title,
      category: product.category,
      image: product.image || '',
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image || ''],
      video_url: product.videoUrl || '',
      price: parseInt(product.price, 10),
      original_price: parseInt(product.originalPrice || product.price, 10),
      discount: parseInt(product.discount, 10) || 0,
      rating: parseFloat(product.rating) || 4.8,
      reviews_count: parseInt(product.reviewsCount, 10) || 12,
      description: product.description || '',
      in_stock: product.inStock !== false,
      stock_qty: Math.max(0, parseInt(product.stockQty, 10) || 0)
    };

    const { data, error } = await _supabase
      .from('products')
      .update(row)
      .eq('id', product.id)
      .select()
      .single();

    if (!error && data) return data;
    throw error || new Error('Direct update failed');
  } catch (err) {
    console.warn('[Supabase Direct Update Warning]:', err.message, '— Attempting API fallback...');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', ...product })
      });
      const json = await res.json();
      if (json.success && json.product) return json.product;
    } catch (apiErr) {}
    return null;
  }
}

async function sbAdminDeleteProduct(id) {
  try {
    const { error } = await _supabase.from('products').delete().eq('id', id);
    if (!error) return true;
    throw error;
  } catch (err) {
    console.warn('[Supabase Direct Delete Warning]:', err.message, '— Attempting API fallback...');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: id })
      });
      const json = await res.json();
      return json.success === true;
    } catch (apiErr) {
      return false;
    }
  }
}

/* ─────────────────────────────── CATEGORIES ─────────────────────────────── */

function mapCategoryFromRow(c) {
  return {
    id: c.id,
    name: c.name,
    description: c.description || '',
    image: c.image || '',
    subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
    isFeatured: c.is_featured !== false,
    isVisible: c.is_visible !== false,
    sortOrder: c.sort_order || 1,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  };
}

function mapCategoryToRow(c) {
  return {
    id: String(c.id),
    name: c.name,
    description: c.description || '',
    image: c.image || '',
    subcategories: c.subcategories || [],
    is_featured: c.isFeatured !== false,
    is_visible: c.isVisible !== false,
    sort_order: c.sortOrder || 1,
    updated_at: new Date().toISOString()
  };
}

async function sbGetCategories() {
  try {
    const { data, error } = await _supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || [])
      .filter(c => !String(c.id).startsWith('__cms_'))
      .map(mapCategoryFromRow);
  } catch (err) {
    console.warn('[Supabase] getCategories failed:', err.message);
    return null;
  }
}

async function sbUpsertCategory(category) {
  try {
    const { error } = await _supabase
      .from('categories')
      .upsert(mapCategoryToRow(category), { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase] upsertCategory failed:', err.message);
    return false;
  }
}

async function sbSeedCategories(categories) {
  try {
    const rows = (categories || []).map(mapCategoryToRow);
    if (!rows.length) return true;
    const { error } = await _supabase.from('categories').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    console.log('[Supabase] Seeded ' + rows.length + ' categories');
    return true;
  } catch (err) {
    console.warn('[Supabase] seedCategories failed:', err.message);
    return false;
  }
}

async function sbDeleteCategory(id) {
  try {
    const { error } = await _supabase.from('categories').delete().eq('id', String(id));
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase] deleteCategory failed:', err.message);
    return false;
  }
}

/* ─────────────────────────────── ORDERS ─────────────────────────────── */

async function sbInsertOrder(order) {
  try {
    const row = {
      order_id: order.orderId,
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address,
      items: order.items,
      total_amount: order.totalAmount,
      subtotal: order.subtotal || order.totalAmount,
      discount_amount: order.discountAmount || 0,
      shipping_fee: order.shippingFee || 0,
      status: order.status || 'Order Confirmed',
      step_index: order.stepIndex || 0,
      payment_method: order.paymentMethod || 'Online',
      gstin: '37BVTPG7761F1Z1'
    };
    if (order.userId) row.user_id = order.userId;
    const { error } = await _supabase.from('orders').insert(row);
    if (error) throw error;
    console.log('[Supabase] Order ' + order.orderId + ' saved');
    return true;
  } catch (err) {
    console.warn('[Supabase] insertOrder failed:', err.message);
    return false;
  }
}

async function sbGetOrders() {
  try {
    const { data, error } = await _supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(o => ({
      orderId: o.order_id,
      date: new Date(o.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: o.status,
      stepIndex: o.step_index,
      customerName: o.customer_name,
      phone: o.phone,
      address: o.address,
      paymentMethod: o.payment_method,
      totalAmount: o.total_amount,
      subtotal: o.subtotal,
      discountAmount: o.discount_amount,
      shippingFee: o.shipping_fee,
      gstin: o.gstin,
      items: o.items
    }));
  } catch (err) {
    console.warn('[Supabase] getOrders failed:', err.message);
    return null;
  }
}

async function sbUpdateOrderStatus(orderId, status, stepIndex) {
  try {
    const { error } = await _supabase
      .from('orders')
      .update({ status: status, step_index: stepIndex })
      .eq('order_id', orderId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase] updateOrderStatus failed:', err.message);
    return false;
  }
}

/* ─────────────────────────────── REVIEWS ─────────────────────────────── */

async function sbGetReviews() {
  try {
    const { data, error } = await _supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => ({
      id: r.id,
      productId: r.product_id,
      productTitle: r.product_title,
      category: r.category,
      userName: r.user_name,
      city: r.city,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      verified: r.verified,
      helpfulCount: r.helpful_count,
      date: new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }));
  } catch (err) {
    console.warn('[Supabase] getReviews failed:', err.message);
    return null;
  }
}

async function sbInsertReview(review) {
  try {
    const { error } = await _supabase.from('reviews').insert({
      id: review.id || Date.now(),
      product_id: review.productId,
      product_title: review.productTitle,
      category: review.category || 'General',
      user_name: review.userName,
      city: review.city || 'Visakhapatnam',
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      verified: review.verified !== false,
      helpful_count: review.helpfulCount || 0
    });
    if (error) throw error;
    console.log('[Supabase] Review saved');
    return true;
  } catch (err) {
    console.warn('[Supabase] insertReview failed:', err.message);
    return false;
  }
}

async function sbSeedReviews(reviews) {
  try {
    const rows = reviews.map(r => ({
      id: r.id,
      product_id: r.productId,
      product_title: r.productTitle,
      category: r.category || 'General',
      user_name: r.userName,
      city: r.city || 'Visakhapatnam',
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      verified: r.verified !== false,
      helpful_count: r.helpfulCount || 0
    }));
    const { error } = await _supabase.from('reviews').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    console.log('[Supabase] Seeded ' + rows.length + ' reviews');
    return true;
  } catch (err) {
    console.warn('[Supabase] seedReviews failed:', err.message);
    return false;
  }
}

async function sbIncrementHelpful(reviewId) {
  try {
    const { data: current } = await _supabase
      .from('reviews').select('helpful_count').eq('id', reviewId).single();
    const newCount = ((current && current.helpful_count) || 0) + 1;
    const { error } = await _supabase
      .from('reviews').update({ helpful_count: newCount }).eq('id', reviewId);
    if (error) throw error;
    return newCount;
  } catch (err) {
    console.warn('[Supabase] incrementHelpful failed:', err.message);
    return null;
  }
}

/* ─────────────────────────────── RETURNS ─────────────────────────────── */

async function sbInsertReturn(ret) {
  try {
    const { error } = await _supabase.from('returns').insert({
      return_id: ret.returnId,
      order_id: ret.orderId,
      status: ret.status || 'Requested - Under Review',
      item_title: ret.itemTitle,
      reason: ret.reason,
      resolution: ret.resolution,
      amount: ret.amount
    });
    if (error) throw error;
    console.log('[Supabase] Return ' + ret.returnId + ' saved');
    return true;
  } catch (err) {
    console.warn('[Supabase] insertReturn failed:', err.message);
    return false;
  }
}

async function sbGetReturns() {
  try {
    const { data, error } = await _supabase
      .from('returns')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => ({
      returnId: r.return_id,
      orderId: r.order_id,
      date: new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: r.status,
      itemTitle: r.item_title,
      reason: r.reason,
      resolution: r.resolution,
      amount: r.amount
    }));
  } catch (err) {
    console.warn('[Supabase] getReturns failed:', err.message);
    return null;
  }
}

/* ─────────────────────────────── SUPPORT TICKETS ─────────────────────── */

async function sbInsertTicket(ticket) {
  try {
    const { error } = await _supabase.from('support_tickets').insert({
      ticket_id: ticket.ticketId,
      category: ticket.category,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status || 'Open - In Progress'
    });
    if (error) throw error;
    console.log('[Supabase] Ticket ' + ticket.ticketId + ' saved');
    return true;
  } catch (err) {
    console.warn('[Supabase] insertTicket failed:', err.message);
    return false;
  }
}

async function sbGetTickets() {
  try {
    const { data, error } = await _supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(t => ({
      ticketId: t.ticket_id,
      category: t.category,
      subject: t.subject,
      status: t.status,
      date: new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      message: t.message
    }));
  } catch (err) {
    console.warn('[Supabase] getTickets failed:', err.message);
    return null;
  }
}

async function sbGetOrdersForUser(userId, phone) {
  try {
    let query = _supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    else if (phone) query = query.eq('phone', phone);
    else return [];
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(o => ({
      orderId: o.order_id,
      date: new Date(o.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: o.status,
      stepIndex: o.step_index,
      customerName: o.customer_name,
      phone: o.phone,
      address: o.address,
      paymentMethod: o.payment_method,
      totalAmount: o.total_amount,
      subtotal: o.subtotal,
      discountAmount: o.discount_amount,
      shippingFee: o.shipping_fee,
      gstin: o.gstin,
      items: o.items,
      userId: o.user_id
    }));
  } catch (err) {
    console.warn('[Supabase] getOrdersForUser failed:', err.message);
    return [];
  }
}

/* ─────────────────────────────── CUSTOMER AUTH (Supabase Auth) ─────────── */

const UE_CUSTOMER_EMAIL_DOMAIN = '@customers.uniqueexpressions.in';

function sbNormalizePhone(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.length === 10) d = '91' + d;
  return d;
}

function sbResolveAuthEmail(identifier) {
  const id = String(identifier || '').trim().toLowerCase();
  if (!id) return '';
  if (id.includes('@')) return id;
  return sbNormalizePhone(id) + UE_CUSTOMER_EMAIL_DOMAIN;
}

async function sbSignUp({ email, password, name, phone, city }) {
  try {
    const authEmail = email.includes('@') ? email.toLowerCase() : sbResolveAuthEmail(phone);
    const { data, error } = await _supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: { name, phone: sbNormalizePhone(phone), email: email.toLowerCase(), city: city || 'Visakhapatnam' }
      }
    });
    if (error) throw error;
    if (data.user) {
      await sbUpsertProfile(data.user.id, { name, phone: sbNormalizePhone(phone), email: email.toLowerCase(), city: city || 'Visakhapatnam' });
    }
    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    return { user: null, session: null, error: err.message || 'Sign up failed' };
  }
}

async function sbSignIn(identifier, password) {
  try {
    let authEmail = sbResolveAuthEmail(identifier);
    try {
      const { data: rpcEmail } = await _supabase.rpc('lookup_auth_email', { login_id: identifier.trim() });
      if (rpcEmail) authEmail = String(rpcEmail).toLowerCase();
    } catch (_) { /* RPC optional until migration run */ }
    const { data, error } = await _supabase.auth.signInWithPassword({ email: authEmail, password });
    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    return { user: null, session: null, error: err.message || 'Login failed' };
  }
}

async function sbSignOut() {
  try {
    const { error } = await _supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase] signOut failed:', err.message);
    return false;
  }
}

async function sbGetAuthSession() {
  try {
    const { data, error } = await _supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (err) {
    return null;
  }
}

function sbOnAuthStateChange(callback) {
  return _supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      if (typeof openResetPasswordModal === 'function') {
        setTimeout(openResetPasswordModal, 200);
      }
    }
    if (typeof callback === 'function') {
      callback(event, session);
    }
  });
}

async function sbInitAuthFlow() {
  try {
    // 1. Handle PKCE auth code exchange if present in URL (?code=...)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      const { data, error } = await _supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session) {
        if (typeof applyAuthSession === 'function') {
          await applyAuthSession(data.session);
        }
        if (window.location.search.includes('type=recovery') || window.location.hash.includes('type=recovery')) {
          if (typeof openResetPasswordModal === 'function') setTimeout(openResetPasswordModal, 300);
        }
      }
    }

    // 2. Handle Implicit Fragment Recovery & Tokens (#access_token=...&type=recovery)
    const hash = window.location.hash || '';
    if (hash.includes('access_token=') && hash.includes('type=recovery')) {
      const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken) {
        const { data, error } = await _supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        if (!error && data?.session) {
          if (typeof applyAuthSession === 'function') await applyAuthSession(data.session);
          if (typeof openResetPasswordModal === 'function') setTimeout(openResetPasswordModal, 300);
        }
      }
    }
  } catch (e) {
    console.warn('[Supabase] Auth flow initialization note:', e);
  }
}

async function sbResetPassword(identifier) {
  try {
    const authEmail = sbResolveAuthEmail(identifier);
    const origin = (window.location.origin || 'http://localhost:5000').replace(/\/+$/, '');
    const { error } = await _supabase.auth.resetPasswordForEmail(authEmail, {
      redirectTo: `${origin}/#type=recovery`
    });
    if (error) throw error;
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err.message || 'Could not send reset email' };
  }
}

async function sbUpdatePassword(newPassword) {
  try {
    // Check if session exists or try refreshing
    const { data: sessionData } = await _supabase.auth.getSession();
    if (!sessionData?.session) {
      const { data: userData } = await _supabase.auth.getUser();
      if (!userData?.user) {
        return {
          ok: false,
          error: 'Your password reset session has expired or is invalid. Please request a fresh reset link from the login page.'
        };
      }
    }
    const { error } = await _supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err.message || 'Could not update password' };
  }
}


async function sbGetProfile(userId) {
  try {
    const { data, error } = await _supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] getProfile failed:', err.message);
    return null;
  }
}

async function sbAdminGetAllProfiles() {
  try {
    const { data, error } = await _supabase.from('profiles').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Supabase] getAllProfiles failed:', err.message);
    return [];
  }
}

async function sbUpsertProfile(userId, profile) {
  try {
    const row = {
      id: userId,
      name: profile.name || '',
      phone: profile.phone || '',
      email: profile.email || '',
      city: profile.city || 'Visakhapatnam',
      address: profile.address || '',
      pincode: profile.pincode || '',
      addresses: profile.addresses || [],
      updated_at: new Date().toISOString()
    };
    if (Array.isArray(profile.cart)) row.cart = profile.cart;
    if (Array.isArray(profile.wishlist)) row.wishlist = profile.wishlist;
    const { error } = await _supabase.from('profiles').upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase] upsertProfile failed:', err.message);
    return false;
  }
}

/* ─────────────────────────────── LEGACY PROFILE HELPER ─────────────────── */

async function sbInsertProfile(profile) {
  const session = await sbGetAuthSession();
  if (session?.user) return sbUpsertProfile(session.user.id, profile);
  return false;
}

/* ─────────────────────────────── CMS & SITE CONFIG CLOUD SYNC ─────────────────────────────── */

async function sbGetFeaturedCollections() {
  try {
    const { data, error } = await _supabase
      .from('categories')
      .select('subcategories')
      .eq('id', '__cms_featured_collections__')
      .single();
    if (error || !data || !Array.isArray(data.subcategories) || data.subcategories.length === 0) return null;
    return data.subcategories;
  } catch (err) {
    console.warn('[Supabase] getFeaturedCollections failed:', err.message);
    return null;
  }
}

async function sbSaveFeaturedCollections(collections) {
  try {
    if (!Array.isArray(collections)) return false;
    const row = {
      id: '__cms_featured_collections__',
      name: 'Featured Collections Config',
      description: 'Global cross-device featured editorial collections',
      subcategories: collections,
      is_featured: false,
      is_visible: false,
      sort_order: 999,
      updated_at: new Date().toISOString()
    };
    const { error } = await _supabase.from('categories').upsert(row, { onConflict: 'id' });
    if (error) throw error;
    console.log('[Supabase] Featured Collections synced to cloud across all devices');
    return true;
  } catch (err) {
    console.warn('[Supabase] saveFeaturedCollections failed:', err.message);
    return false;
  }
}

async function sbGetHeroSlides() {
  try {
    const { data, error } = await _supabase
      .from('categories')
      .select('subcategories')
      .eq('id', '__cms_hero_slides__')
      .single();
    if (error || !data || !Array.isArray(data.subcategories) || data.subcategories.length === 0) return null;
    return data.subcategories;
  } catch (err) {
    console.warn('[Supabase] getHeroSlides failed:', err.message);
    return null;
  }
}

async function sbSaveHeroSlides(slides) {
  try {
    if (!Array.isArray(slides)) return false;
    const row = {
      id: '__cms_hero_slides__',
      name: 'Hero Slides Config',
      description: 'Global cross-device hero carousel slides',
      subcategories: slides,
      is_featured: false,
      is_visible: false,
      sort_order: 998,
      updated_at: new Date().toISOString()
    };
    const { error } = await _supabase.from('categories').upsert(row, { onConflict: 'id' });
    if (error) throw error;
    console.log('[Supabase] Hero Slides synced to cloud across all devices');
    return true;
  } catch (err) {
    console.warn('[Supabase] saveHeroSlides failed:', err.message);
    return false;
  }
}

async function sbGetStoreSettings() {
  try {
    const { data, error } = await _supabase
      .from('categories')
      .select('subcategories')
      .eq('id', '__cms_store_settings__')
      .single();
    if (error || !data || !data.subcategories || typeof data.subcategories !== 'object') return null;
    return data.subcategories;
  } catch (err) {
    console.warn('[Supabase] getStoreSettings failed:', err.message);
    return null;
  }
}

async function sbSaveStoreSettings(settings) {
  try {
    if (!settings || typeof settings !== 'object') return false;
    const row = {
      id: '__cms_store_settings__',
      name: 'Store Settings Config',
      description: 'Global cross-device store details and business settings',
      subcategories: settings,
      is_featured: false,
      is_visible: false,
      sort_order: 997,
      updated_at: new Date().toISOString()
    };
    const { error } = await _supabase.from('categories').upsert(row, { onConflict: 'id' });
    if (error) throw error;
    console.log('[Supabase] Store Settings synced to cloud across all devices');
    return true;
  } catch (err) {
    console.warn('[Supabase] saveStoreSettings failed:', err.message);
    return false;
  }
}

/* ─────────────────────────────── PING TEST ─────────────────────────────── */

async function sbPing() {
  try {
    const { error } = await _supabase.from('products').select('id').limit(1);
    if (error) throw error;
    console.log('[Supabase] Connected to sfcxpvvqxldhdkvfyhgj.supabase.co');
    return true;
  } catch (err) {
    console.warn('[Supabase] Connection issue:', err.message);
    return false;
  }
}

