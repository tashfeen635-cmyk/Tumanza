import nodemailer from 'nodemailer';
import { escapeHtml } from './auth';

const smtpPort = Number(process.env.EMAIL_PORT) || 465;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: smtpPort,
  secure:
    process.env.EMAIL_SECURE !== undefined
      ? process.env.EMAIL_SECURE === 'true'
      : smtpPort === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOrderConfirmationEmail(toEmail: string, order: any) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipped sending order confirmation (credentials not configured)');
    return;
  }

  let itemsHtml = '';
  let total = 0;
  for (let i = 0; i < (order.items || []).length; i++) {
    const item = order.items[i];
    const lineTotal = item.qty * item.price;
    total += lineTotal;
    itemsHtml += `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;color:#1a1a1a">${escapeHtml(item.name)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:center;color:#5d5b5b">${item.qty}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;color:#5d5b5b">Rs.${item.price.toFixed(2)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:600;color:#1a1a1a">Rs.${lineTotal.toFixed(2)}</td>
    </tr>`;
  }

  const shippingCost = total >= 5933 ? 0 : 5.00;
  const finalTotal = total + shippingCost;

  const mailOptions = {
    from: `"Tumanza" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Order Confirmed & Invoice - ${order.orderId} | Tumanza`,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:30px;background:#f9f8f5;border-radius:12px;border:1px solid #eadaad">
      <div style="text-align:center;margin-bottom:25px">
        <h2 style="font-family:Georgia,serif;color:#541d2b;font-size:26px;margin:0">TUMANZA</h2>
        <p style="color:#999;font-size:11px;letter-spacing:2px;margin:4px 0 0;text-transform:uppercase">Official Order Invoice</p>
      </div>
      <div style="background:#fff;padding:24px;border-radius:8px;margin-bottom:20px;box-shadow:0 2px 4px rgba(0,0,0,0.02)">
        <div style="display:flex;justify-content:space-between;margin-bottom:15px;border-bottom:1px solid #eee;padding-bottom:15px">
          <div>
            <p style="margin:0 0 4px;font-size:13px;color:#888">Order Reference:</p>
            <p style="margin:0;font-size:16px;font-weight:bold;color:#541d2b">${order.orderId}</p>
          </div>
          <div style="text-align:right">
            <p style="margin:0 0 4px;font-size:13px;color:#888">Date:</p>
            <p style="margin:0;font-size:14px;color:#333">${order.date || new Date().toISOString().slice(0, 10)}</p>
          </div>
        </div>
        <p style="margin:0 0 6px;font-size:14px;color:#5d5b5b"><strong>Billed To:</strong> ${escapeHtml(order.customer)}</p>
        <p style="margin:0 0 6px;font-size:14px;color:#5d5b5b"><strong>Phone:</strong> ${escapeHtml(order.phone)}</p>
        <p style="margin:0 0 6px;font-size:14px;color:#5d5b5b"><strong>Delivery Address:</strong> ${escapeHtml(order.address)}, ${escapeHtml(order.city)}</p>
        <p style="margin:0;font-size:14px;color:#5d5b5b"><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#fff;border-radius:8px;overflow:hidden">
        <thead><tr style="background:#541d2b;color:#dfceae">
          <th style="padding:12px;text-align:left;font-size:12px;letter-spacing:1px">ITEM</th>
          <th style="padding:12px;text-align:center;font-size:12px;letter-spacing:1px">QTY</th>
          <th style="padding:12px;text-align:right;font-size:12px;letter-spacing:1px">PRICE</th>
          <th style="padding:12px;text-align:right;font-size:12px;letter-spacing:1px">TOTAL</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:10px 12px;font-size:14px;color:#5d5b5b;border-top:1px solid #eee">Subtotal</td>
            <td style="padding:10px 12px;font-size:14px;color:#5d5b5b;text-align:right;border-top:1px solid #eee">Rs.${total.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding:10px 12px;font-size:14px;color:#5d5b5b">Shipping &amp; Handling</td>
            <td style="padding:10px 12px;font-size:14px;color:#6B7A36;font-weight:600;text-align:right">${shippingCost === 0 ? 'FREE' : 'Rs.' + shippingCost.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding:14px 12px;font-weight:bold;font-size:16px;color:#1a1a1a;border-top:2px solid #541d2b">Total Amount</td>
            <td style="padding:14px 12px;font-weight:bold;font-size:16px;text-align:right;color:#541d2b;border-top:2px solid #541d2b">Rs.${finalTotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background:#fff;padding:20px;border-radius:8px;text-align:center;margin-bottom:20px">
        <p style="margin:0;font-size:14px;color:#5d5b5b">Your order has been received and is being prepared with care. We will notify you once dispatched.</p>
      </div>

      <p style="color:#8B9A46;font-weight:600;font-size:15px;text-align:center;margin:20px 0">&mdash; The Tumanza Team</p>
      <hr style="border:none;border-top:1px solid #eadaad;margin:25px 0">
      <p style="color:#999;font-size:11px;text-align:center">Tumanza &mdash; Nature's Finest Organic Nuts, Herbs &amp; Superfoods<br>Sent from info@tumanza.com</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.error('Order confirmation email error:', err.message);
  }
}

export async function sendOrderStatusEmail(toEmail: string, order: any, newStatus: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  let statusMsg = '';
  let statusIcon = '';
  if (newStatus === 'Shipped') {
    statusMsg = `Great news! Your order <strong>${order.orderId}</strong> has been shipped and is on its way to you.`;
    statusIcon = '&#128666;';
  } else if (newStatus === 'Delivered') {
    statusMsg = `Your order <strong>${order.orderId}</strong> has been delivered. We hope you enjoy your purchase!`;
    statusIcon = '&#9989;';
  } else {
    return;
  }

  const mailOptions = {
    from: `"Tumanza" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Order ${newStatus} - ${order.orderId} | Tumanza`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#f9f8f5;border-radius:8px">
      <h1 style="font-family:Georgia,serif;color:#1a1a1a;font-size:28px;margin-bottom:10px">Order ${newStatus} ${statusIcon}</h1>
      <p style="color:#5d5b5b;font-size:15px;line-height:1.8">${statusMsg}</p>
      <div style="background:#fff;padding:20px;border-radius:6px;margin:20px 0">
        <p style="margin:0 0 5px;font-size:14px;color:#5d5b5b"><strong>Order ID:</strong> ${order.orderId}</p>
        <p style="margin:0 0 5px;font-size:14px;color:#5d5b5b"><strong>Status:</strong> ${newStatus}</p>
        <p style="margin:0;font-size:14px;color:#5d5b5b"><strong>Delivery:</strong> ${escapeHtml(order.address || '')}, ${escapeHtml(order.city || '')}</p>
      </div>
      <p style="color:#5d5b5b;font-size:15px;line-height:1.8">Thank you for shopping with Tumanza!</p>
      <p style="color:#8B9A46;font-weight:600;font-size:16px;margin-top:20px">&mdash; The Tumanza Team</p>
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:25px 0">
      <p style="color:#999;font-size:12px;text-align:center">Tumanza &mdash; Premium Organic Nuts &amp; Superfoods</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.error('Order status email error:', err.message);
  }
}

export async function sendWelcomeEmail(toEmail: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const mailOptions = {
    from: `"Tumanza" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Welcome to Tumanza! Enjoy 10% Off Your First Order 🌰',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#f9f8f5;border-radius:8px;border:1px solid #eadaad">
      <h1 style="font-family:Georgia,serif;color:#541d2b;font-size:28px;margin-bottom:10px">Welcome to Tumanza!</h1>
      <p style="color:#5d5b5b;font-size:15px;line-height:1.8">Thank you for subscribing to our newsletter. As a welcome gift, enjoy an exclusive <strong>10% off</strong> your first order across our finest organic nuts and superfoods!</p>
      
      <div style="background:#fff;padding:24px;border-radius:8px;text-align:center;margin:25px 0;border:2px dashed #dfceae">
        <p style="color:#999;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px">Your Exclusive Promo Code</p>
        <div style="font-family:monospace;font-size:28px;font-weight:700;color:#541d2b;letter-spacing:4px">TUMANZA10</div>
        <p style="color:#666;font-size:13px;margin:8px 0 0">Use this code at checkout to save 10% on your order.</p>
      </div>

      <p style="color:#5d5b5b;font-size:15px;line-height:1.8">You'll also be the first to know about:</p>
      <ul style="color:#5d5b5b;font-size:15px;line-height:2">
        <li>New organic harvests from Gilgit-Baltistan</li>
        <li>Special seasonal deals &amp; flash sales</li>
        <li>Authentic recipes &amp; health tips</li>
      </ul>
      <div style="text-align:center;margin:30px 0">
        <a href="https://tumanza.com/shop" style="background:#541d2b;color:#dfceae;padding:14px 32px;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:1px">SHOP NOW</a>
      </div>
      <p style="color:#5d5b5b;font-size:15px;line-height:1.8">Stay healthy, stay natural!</p>
      <p style="color:#8B9A46;font-weight:600;font-size:16px;margin-top:20px">&mdash; The Tumanza Team</p>
      <hr style="border:none;border-top:1px solid #eadaad;margin:25px 0">
      <p style="color:#999;font-size:12px;text-align:center">Tumanza &mdash; Nature's Finest Organic Nuts, Herbs &amp; Superfoods<br>Sent from info@tumanza.com</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.error('Welcome promotional email error:', err.message);
  }
}
