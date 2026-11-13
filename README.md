# Tumanza — Next.js Full Stack Storefront & Admin Portal

A full-stack e-commerce application built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, and **MongoDB (Mongoose)**.

## Architecture

| Route / Module | Purpose |
| --- | --- |
| `src/app/page.tsx` | Home Page: Hero, live quick search, popular products, Himalayan Shilajit & Tumoro spotlight, customer reviews, newsletter, and Instagram feed |
| `src/app/shop/page.tsx` | Shop Page: Product filtering by category, price, and star rating, sorting, and paginated product grid |
| `src/app/about/page.tsx` | About Page: Farm origins in Gilgit-Baltistan, mountain harvesters, core values, and transparency |
| `src/app/contact/page.tsx` | Contact Page: Interactive contact message form, operating hours, and location info |
| `src/app/account/page.tsx` | User Account: Authentication tabs, 3-step OTP password reset flow, email verification banner, profile updates, order history, and saved wishlist |
| `src/app/tumanza-control-7x9p/page.tsx` | Admin Portal: Dashboard overview with 4 KPI cards, monthly revenue bar chart, product management (Add/Edit/Delete), order fulfillment & status updating, subscribers list, registered users, review moderation, and sales analytics |
| `src/app/api/*` | Next.js Serverless Route Handlers for all 27 backend endpoints |
| `src/components/*` | Reusable UI components (Header, Footer, ProductModal, OrderPopup, PolicyModal, InlineSearch, ProductCard, Features, Newsletter, BackToTop) |
| `src/context/StoreContext.tsx` | React Context for global state (cart/orders, authentication, wishlist, modals, cached products) |
| `src/lib/*` | Database connection (`db.ts`), password hashing & auth middleware (`auth.ts`), nodemailer email templates (`email.ts`), TypeScript definitions (`types.ts`) |
| `src/models/*` | Mongoose schemas & models for Products, Orders, Users, Reviews, Wishlist, Subscribers, Revenue, Counters, and Tokens |

## Environment Variables

Configure these in `.env.local` (for development) and in your deployment dashboard:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB Atlas connection string |
| `ADMIN_USERNAME` | yes | Admin dashboard login username |
| `ADMIN_PASSWORD` | yes | Admin dashboard login password |
| `EMAIL_USER` | no | Gmail SMTP address for order confirmations and reset codes |
| `EMAIL_PASS` | no | Gmail App password |
| `SITE_URL` | no | Base URL for email verification links (e.g. `http://localhost:3000`) |

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
- **Constant-time password & OTP comparisons:** Using `crypto.scrypt` and `crypto.timingSafeEqual`.
- **Atomic Order Sequences:** Monotonic collision-free `PN-xxxx` order IDs powered by Mongoose atomic counters.
- **Serverless Cached Connection:** Mongoose connection pooling cached globally across hot/cold Next.js route handler invocations.
- **Responsive & Accessible:** Fully mobile-friendly with keyboard navigation and modal trap support.
