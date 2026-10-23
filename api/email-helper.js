const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'UNIQUE EXPRESSIONS <orders@uniqueexpressions.in>';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'dacnikhil21@gmail.com,uniqueexpressions.in@gmail.com')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);

/**
 * Low-level Resend email dispatcher
 */
function sendEmail({ to, subject, html, text }) {
  return new Promise((resolve) => {
    if (!RESEND_API_KEY) {
      console.log(`[Email Notice] RESEND_API_KEY not configured. Skipping email to: ${to} ("${subject}")`);
      return resolve({ success: false, skipped: true, error: 'RESEND_API_KEY not set' });
    }

    const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
    if (recipients.length === 0) {
      return resolve({ success: false, error: 'No recipient email specified' });
    }

    const payload = JSON.stringify({
      from: EMAIL_FROM,
      to: recipients,
      subject: subject,
      html: html,
      text: text || ''
    });

    const options = {
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Email Sent] To: ${recipients.join(', ')} | ID: ${parsed.id}`);
            resolve({ success: true, id: parsed.id });
          } else {
            console.warn(`[Email Warning] Resend HTTP ${res.statusCode}:`, parsed);
            resolve({ success: false, error: parsed.message || `HTTP ${res.statusCode}` });
          }
        } catch (_) {
          resolve({ success: res.statusCode >= 200 && res.statusCode < 300 });
        }
      });
    });

    req.on('error', (err) => {
      console.warn('[Email Network Error]', err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

/**
 * 📧 Send Customer Order Confirmation + Admin Notification
 */
async function sendOrderConfirmationEmail(order) {
  const customerEmail = order.customerEmail || order.email;
  const items = Array.isArray(order.items) ? order.items : [];
  const grandTotal = order.totalAmount || order.grandTotal || 0;
  const orderId = order.orderId || ('UE-' + Date.now().toString().slice(-6));

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #f1f5f9;">
        <strong>${item.title || 'Product'}</strong><br>
        <span style="color:#64748b; font-size:12px;">Qty: ${item.qty || 1} × ₹${item.price || 0}</span>
      </td>
      <td style="padding:10px 0; border-bottom:1px solid #f1f5f9; text-align:right; font-weight:700;">
        ₹${(item.qty || 1) * (item.price || 0)}
      </td>
    </tr>
  `).join('');

  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin:0; padding:20px; background-color:#f8fafc; color:#0f172a;">
      <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
        <div style="background:linear-gradient(135deg, #be185d 0%, #db2777 100%); padding:24px 28px; text-align:center; color:#ffffff;">
          <h1 style="margin:0; font-size:22px; font-weight:800; letter-spacing:0.5px;">UNIQUE EXPRESSIONS</h1>
          <p style="margin:6px 0 0 0; font-size:13px; opacity:0.9;">Order Confirmation #${orderId}</p>
        </div>
        <div style="padding:28px;">
          <h2 style="font-size:18px; font-weight:800; margin-top:0;">Thank you, ${order.customerName || 'Valued Customer'}!</h2>
          <p style="font-size:14px; color:#475569; line-height:1.5;">
            Your order has been confirmed and is being carefully packed at our boutique fulfillment studio.
          </p>

          <div style="background:#f8fafc; border-radius:12px; padding:16px; margin:20px 0;">
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              ${itemsHtml}
            </table>
            <div style="border-top:1px dashed #cbd5e1; margin-top:12px; padding-top:10px;">
              <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; color:#475569;">
                <span>Subtotal:</span><span>₹${order.subtotal || grandTotal}</span>
              </div>
              ${order.discountAmount ? `<div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; color:#16a34a; font-weight:700;"><span>Coupon Discount:</span><span>-₹${order.discountAmount}</span></div>` : ''}
              <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px; color:#475569;">
                <span>Delivery:</span><span>${order.shippingFee === 0 ? '<strong style="color:#16a34a;">FREE</strong>' : '₹' + (order.shippingFee || 0)}</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:800; color:#0f172a; border-top:1px solid #e2e8f0; padding-top:8px;">
                <span>Total Amount:</span><span style="color:#db2777;">₹${grandTotal}</span>
              </div>
            </div>
          </div>

          <div style="font-size:13px; color:#334155; line-height:1.5;">
            <strong>Delivery Address:</strong><br>
            ${order.address || 'Address provided at checkout'}<br>
            <strong>Contact:</strong> ${order.phone || ''}<br>
            <strong>Payment Mode:</strong> ${order.paymentMethod || 'Online'}
          </div>

          <div style="margin-top:28px; text-align:center;">
            <a href="https://shop.uniqueexpressions.in" style="background:#db2777; color:#ffffff; padding:12px 28px; text-decoration:none; border-radius:10px; font-weight:700; font-size:13px; display:inline-block;">
              Visit Unique Expressions Store →
            </a>
          </div>
        </div>
        <div style="background:#f1f5f9; padding:16px; text-align:center; font-size:11px; color:#64748b;">
          Need help? Reply to this email or reach us on WhatsApp: +91 7799747575<br>
          © 2026 UNIQUE EXPRESSIONS. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Send confirmation to customer if email is available
  if (customerEmail && customerEmail.includes('@') && !customerEmail.includes('uniqueexpressions.in@gmail.com')) {
    sendEmail({
      to: customerEmail,
      subject: `Order Confirmed #${orderId} — UNIQUE EXPRESSIONS`,
      html: customerHtml,
      text: `Thank you for your order #${orderId}! Total: ₹${grandTotal}. Delivery address: ${order.address}.`
    }).catch(() => {});
  }

  // 2. Send instant new order notification to Store Admin
  if (ADMIN_EMAILS.length > 0) {
    const adminHtml = `
      <div style="font-family:sans-serif; padding:16px;">
        <h2>🛒 New Order Received #${orderId}</h2>
        <p><strong>Customer:</strong> ${order.customerName} (${order.phone})</p>
        <p><strong>Amount:</strong> ₹${grandTotal} (${order.paymentMethod})</p>
        <p><strong>Address:</strong> ${order.address}</p>
        <h3>Items:</h3>
        <ul>
          ${items.map(i => `<li>${i.title} (x${i.qty || 1}) — ₹${(i.qty || 1) * (i.price || 0)}</li>`).join('')}
        </ul>
      </div>
    `;
    sendEmail({
      to: ADMIN_EMAILS,
      subject: `🔔 [NEW ORDER #${orderId}] ₹${grandTotal} from ${order.customerName || 'Customer'}`,
      html: adminHtml,
      text: `New order #${orderId} for ₹${grandTotal} by ${order.customerName} (${order.phone}).`
    }).catch(() => {});
  }
}

/**
 * 📧 Send Order Status Change Email (Shipped / Out for Delivery / Delivered / Cancelled)
 */
async function sendOrderStatusEmail(order, newStatus, trackingInfo = {}) {
  const customerEmail = order.customerEmail || order.email;
  if (!customerEmail || !customerEmail.includes('@')) return;

  const orderId = order.orderId;
  const awb = trackingInfo.awb || order.awb || '';
  const courier = trackingInfo.courier || order.courier || 'Express Courier';

  const statusHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin:0; padding:20px; background-color:#f8fafc; color:#0f172a;">
      <div style="max-width:540px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0;">
        <div style="background:linear-gradient(135deg, #be185d 0%, #db2777 100%); padding:20px; text-align:center; color:#ffffff;">
          <h2 style="margin:0; font-size:20px; font-weight:800;">Order Update #${orderId}</h2>
        </div>
        <div style="padding:24px;">
          <div style="display:inline-block; background:#dcfce7; color:#16a34a; font-weight:800; font-size:12px; padding:4px 12px; border-radius:99px; margin-bottom:12px;">
            STATUS: ${newStatus.toUpperCase()}
          </div>
          <h3 style="margin-top:0;">Hello ${order.customerName || 'Customer'},</h3>
          <p style="font-size:14px; color:#475569; line-height:1.5;">
            Your order <strong>#${orderId}</strong> status has been updated to: <strong>${newStatus}</strong>.
          </p>

          ${awb ? `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; margin:18px 0; font-size:13px;">
              <strong>Courier Partner:</strong> ${courier}<br>
              <strong>Tracking / AWB Number:</strong> <code>${awb}</code>
            </div>
          ` : ''}

          <p style="font-size:12.5px; color:#64748b;">
            If you have any questions regarding your delivery, reply directly to this email or reach us on WhatsApp at +91 7799747575.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  sendEmail({
    to: customerEmail,
    subject: `Order #${orderId} Update: ${newStatus} — UNIQUE EXPRESSIONS`,
    html: statusHtml,
    text: `Your order #${orderId} status has been updated to ${newStatus}. ${awb ? `Tracking: ${awb} via ${courier}` : ''}`
  }).catch(() => {});
}

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail
};
