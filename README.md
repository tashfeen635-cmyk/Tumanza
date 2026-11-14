# Tumanza — Next.js Full Stack Storefront & Admin Portal

A full-stack e-commerce application built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, and **MongoDB (Mongoose)**.

## Architecture

| Route / Module | Purpose |
| --- | --- |
| `src/app/page.tsx` | Home Page: Hero, live quick search, popular products, Himalayan Shilajit & Tumoro spotlight, customer reviews, newsletter, and Instagram feed |
| `src/app/shop/page.tsx` | Shop Page: Product filtering by category, price, and star rating, sorting, and paginated product grid |
| `src/app/about/page.tsx` | About Page: Farm origins in Gilgit-Baltistan, mountain harvesters, core values, and transparency |
| `src/app/contact/page.tsx` | Contact Page: Interactive contact message form, operating hours, and location info |
| `src/app/tumanza-control-7x9p/page.tsx` | Admin Portal: Dashboard overview with 4 KPI cards, monthly revenue bar chart, product management (Add/Edit/Delete), order fulfillment & status updating, subscribers list, review moderation, and sales analytics |
| `src/app/api/*` | Next.js Serverless Route Handlers for all backend endpoints |
| `src/components/*` | Reusable UI components (Header, Footer, ProductModal, OrderPopup, PolicyModal, InlineSearch, ProductCard, Features, Newsletter, BackToTop) |
| `src/context/StoreContext.tsx` | React Context for global state (orders, modals, cached products) |
| `src/lib/*` | Database connection (`db.ts`), password hashing & admin auth helpers (`auth.ts`), nodemailer email templates (`email.ts`), TypeScript definitions (`types.ts`) |
| `src/models/*` | Mongoose schemas & models for Products, Orders, Reviews, Subscribers, Revenue, Counters, and admin Tokens |

## Environment Variables

Configure these in `.env.local` (for development) and in your deployment dashboard:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB Atlas connection string |
| `ADMIN_USERNAME` | yes | Admin dashboard login username |
| `ADMIN_PASSWORD` | yes | Admin dashboard login password |
| `EMAIL_HOST` | no | SMTP host (default `smtp.hostinger.com`) |
| `EMAIL_PORT` | no | SMTP port (default `465`) |
| `EMAIL_SECURE` | no | Use implicit TLS; `true` for port 465, `false` for 587/STARTTLS |
| `EMAIL_USER` | no | Sending mailbox address (e.g. `info@tumanza.com`) |
| `EMAIL_PASS` | no | Mailbox password (Hostinger) or Gmail App Password |
| `SITE_URL` | no | Public site URL for canonical links and sitemap (e.g. `http://localhost:3000`) |
| `VAPID_PUBLIC_KEY` | yes (push) | Web Push public key |
| `VAPID_PRIVATE_KEY` | yes (push) | Web Push private key — keep secret |
| `VAPID_SUBJECT` | no | Contact URI for push, e.g. `https://tumanza.com` |

## Admin Push Notifications

New orders, subscribers and reviews trigger Web Push alerts (including lock-screen alerts) on devices where the admin enabled them. Tap the bell on the admin dashboard and choose **Enable**.

- **Desktop / Android:** log in to the admin dashboard, tap the bell, tap **Enable** and allow notifications.
- **iPhone / iPad (iOS 16.4+):** open the site in Safari, tap Share → **Add to Home Screen**, open Tumanza from the home screen, log in, then tap the bell → **Enable**.
- Push requires the `VAPID_*` variables above and HTTPS.

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run the Next.js development server
npm run dev

# 3. Open in browser
# Storefront: http://localhost:3000
# Admin Dashboard: http://localhost:3000/tumanza-control-7x9p
```

## Production Build

```bash
# Type check and build optimized production bundle
npm run build

# Start production server
npm start
```

## Security & Best Practices

- **Zero-trust pricing:** Product prices in order submissions are always resolved and validated server-side against the database catalog.
- **Constant-time password comparisons:** Using `crypto.scrypt` and `crypto.timingSafeEqual`.
- **Atomic Order Sequences:** Monotonic collision-free `PN-xxxx` order IDs powered by Mongoose atomic counters.
- **Serverless Cached Connection:** Mongoose connection pooling cached globally across hot/cold Next.js route handler invocations.
- **Responsive & Accessible:** Fully mobile-friendly with keyboard navigation and modal trap support.
