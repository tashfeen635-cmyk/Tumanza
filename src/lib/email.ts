import nodemailer from 'nodemailer';
import { escapeHtml } from './auth';

const transporter = nodemailer.createTransport({
  service: 'gmail',
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
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px">${escapeHtml(item.name)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:center">${item.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right">Rs.${lineTotal.toFixed(2)}</td>
    </tr>`;
  }

  const mailOptions = {
    from: `"Tumanza" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Order Confirmed - ${order.orderId} | Tumanza`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#f9f8f5;border-radius:8px">
      <h1 style="font-family:Georgia,serif;color:#1a1a1a;font-size:28px;margin-bottom:10px">Order Confirmed!</h1>
      <p style="color:#5d5b5b;font-size:15px;line-height:1.8">Thank you, <strong>${escapeHtml(order.customer)}</strong>! Your order has been placed successfully.</p>
      <div style="background:#fff;padding:20px;border-radius:6px;margin:20px 0">
        <p style="margin:0 0 5px;font-size:14px;color:#5d5b5b"><strong>Order ID:</strong> ${order.orderId}</p>
        <p style="margin:0 0 5px;font-size:14px;color:#5d5b5b"><strong>Payment:</strong> Cash on Delivery</p>
        <p style="margin:0 0 5px;font-size:14px;color:#5d5b5b"><strong>Phone:</strong> ${escapeHtml(order.phone)}</p>
        <p style="margin:0;font-size:14px;color:#5d5b5b"><strong>Delivery:</strong> ${escapeHtml(order.address)}, ${escapeHtml(order.city)}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead><tr style="background:#1a1a1a;color:#fff">
          <th style="padding:10px 12px;text-align:left;font-size:13px">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:13px">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:13px">Price</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:8px 12px;font-size:14px;color:#5d5b5b;border-top:1px solid #eee">Subtotal</td>
            <td style="padding:8px 12px;font-size:14px;color:#5d5b5b;text-align:right;border-top:1px solid #eee">Rs.${total.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px 12px;font-size:14px;color:#5d5b5b">Shipping</td>
            <td style="padding:8px 12px;font-size:14px;color:#6B7A36;font-weight:600;text-align:right">${total >= 5933 ? 'FREE' : 'Rs.5.00'}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:12px;font-weight:bold;font-size:15px;border-top:2px solid #1a1a1a">Total</td>
            <td style="padding:12px;font-weight:bold;font-size:15px;text-align:right;border-top:2px solid #1a1a1a">Rs.${(total + (total >= 5933 ? 0 : 5)).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <p style="color:#5d5b5b;font-size:15px;line-height:1.8">We will notify you when your order is shipped. Stay healthy, stay natural!</p>
      <p style="color:#8B9A46;font-weight:600;font-size:16px;margin-top:20px">&mdash; The Tumanza Team</p>
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:25px 0">
      <p style="color:#999;font-size:12px;text-align:center">Tumanza &mdash; Premium Organic Nuts &amp; Superfoods</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.error('Order confirmation email error:', err.message);
  }
}

export async function sendPasswordResetEmail(toEmail: string, code: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipped sending reset code (credentials not configured):', code);
    return;
  }

  const mailOptions = {
    from: `"Tumanza" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Password Reset Code - Tumanza',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#f9f8f5;border-radius:8px">
      <h1 style="font-family:Georgia,serif;color:#1a1a1a;font-size:28px;margin-bottom:10px">Reset Your Password</h1>
      <p style="color:#5d5b5b;font-size:15px;line-height:1.8">We received a request to reset your password. Use the code below to proceed:</p>
      <div style="text-align:center;margin:30px 0;padding:24px;background:#fff;border-radius:8px;border:2px dashed #ddd">
        <p style="color:#999;font-size:13px;margin:0 0 8px;letter-spacing:1px">YOUR RESET CODE</p>
        <div style="font-family:monospace;font-size:40px;font-weight:700;letter-spacing:10px;color:#1a1a1a">${code}</div>
      </div>
      <p style="color:#5d5b5b;font-size:13px;line-height:1.8">This code will expire in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
      <p style="color:#8B9A46;font-weight:600;font-size:16px;margin-top:20px">&mdash; The Tumanza Team</p>
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:25px 0">
      <p style="color:#999;font-size:12px;text-align:center">Tumanza &mdash; Premium Organic Nuts &amp; Superfoods</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.error('Password reset email error:', err.message);
  }
}

export async function sendVerificationEmail(toEmail: string, verifyToken: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipped sending verification email (credentials not configured)');
    return;
  }

  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const verifyLink = `${siteUrl}/account?verify=${verifyToken}`;
  const mailOptions = {
    from: `"Tumanza" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify Your Email - Tumanza',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#f9f8f5;border-radius:8px">
      <h1 style="font-family:Georgia,serif;color:#1a1a1a;font-size:28px;margin-bottom:10px">Verify Your Email</h1>
      <p style="color:#5d5b5b;font-size:15px;line-height:1.8">Welcome to Tumanza! Please verify your email address to activate your account:</p>
      <div style="text-align:center;margin:30px 0">
        <a href="${verifyLink}" style="background:#8B9A46;color:#fff;padding:14px 32px;text-decoration:none;border-radius:4px;font-size:14px;font-weight:600;letter-spacing:1px">VERIFY EMAIL</a>
      </div>
      <p style="color:#5d5b5b;font-size:13px;line-height:1.8">This link will expire in 24 hours.</p>
      <p style="color:#8B9A46;font-weight:600;font-size:16px;margin-top:20px">&mdash; The Tumanza Team</p>
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:25px 0">
      <p style="color:#999;font-size:12px;text-align:center">Tumanza &mdash; Premium Organic Nuts &amp; Superfoods</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.error('Verification email error:', err.message);
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
    subject: 'Welcome to Tumanza! 🌰',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#f9f8f5;border-radius:8px">
      <h1 style="font-family:Georgia,serif;color:#1a1a1a;font-size:28px;margin-bottom:10px">Welcome to Tumanza!</h1>
      <p style="color:#5d5b5b;font-size:15px;line-height:1.8">Thank you for subscribing to our newsletter. You'll be the first to know about:</p>
      <ul style="color:#5d5b5b;font-size:15px;line-height:2">
        <li>New product launches</li>
        <li>Exclusive discounts &amp; offers</li>
        <li>Seasonal recipes &amp; health tips</li>
        <li>Early access to sales</li>
      </ul>
      <p style="color:#5d5b5b;font-size:15px;line-height:1.8">Stay healthy, stay natural!</p>
      <p style="color:#8B9A46;font-weight:600;font-size:16px;margin-top:20px">— The Tumanza Team</p>
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:25px 0">
      <p style="color:#999;font-size:12px;text-align:center">Tumanza — Premium Organic Nuts &amp; Superfoods</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.error('Email send error:', err.message);
  }
}
