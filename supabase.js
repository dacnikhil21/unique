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
      price: p.price,
      originalPrice: p.original_price,
      discount: p.discount,
      rating: String(p.rating),
      reviewsCount: p.reviews_count,
      description: p.description,
      inStock: p.in_stock
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
      price: p.price,
      original_price: p.originalPrice,
      discount: p.discount,
      rating: parseFloat(p.rating),
      reviews_count: p.reviewsCount,
      description: p.description,
      in_stock: p.inStock !== false
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
    const { data, error } = await _supabase
      .from('products')
      .insert({
        title: product.title,
        category: product.category,
        image: product.image || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop',
        price: product.price,
        original_price: product.originalPrice,
        discount: product.discount || 0,
        rating: parseFloat(product.rating) || 4.5,
        reviews_count: product.reviewsCount || 0,
        description: product.description || '',
        in_stock: true
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] adminInsertProduct failed:', err.message);
    return null;
  }
}

async function sbAdminUpdateProduct(product) {
  try {
    const row = {
      title: product.title,
      category: product.category,
      image: product.image || '',
      price: product.price,
      original_price: product.originalPrice,
      discount: product.discount || 0,
      rating: parseFloat(product.rating) || 4.5,
      reviews_count: product.reviewsCount || 0,
      description: product.description || '',
      in_stock: product.inStock !== false
    };
    const { data, error } = await _supabase
      .from('products')
      .update(row)
      .eq('id', product.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] adminUpdateProduct failed:', err.message);
    return null;
  }
}

async function sbAdminDeleteProduct(id) {
  try {
    const { error } = await _supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase] adminDeleteProduct failed:', err.message);
    return false;
  }
}

/* ─────────────────────────────── ORDERS ─────────────────────────────── */

async function sbInsertOrder(order) {
  try {
    const { error } = await _supabase.from('orders').insert({
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
    });
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

/* ─────────────────────────────── CUSTOMER PROFILES ─────────────────────── */

async function sbInsertProfile(profile) {
  try {
    const { error } = await _supabase.from('profiles').upsert({
      email: profile.email || `${Date.now()}@customer.com`,
      name: profile.name,
      phone: profile.phone || '',
      city: profile.city || 'Visakhapatnam',
      address: profile.address || '',
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' });
    if (error) {
      await _supabase.from('customers').upsert({
        email: profile.email || `${Date.now()}@customer.com`,
        name: profile.name,
        phone: profile.phone || '',
        city: profile.city || 'Visakhapatnam'
      }, { onConflict: 'email' });
    }
    console.log('[Supabase] Profile for ' + profile.name + ' saved to Supabase');
    return true;
  } catch (err) {
    console.warn('[Supabase] insertProfile note:', err.message);
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
