# Delivery Ethiopia — Admin Panel 🚚

Web-based admin dashboard for the Delivery Ethiopia express delivery platform.

Built for Super Admins, Regional Admins, and Branch Managers to manage regions, branches, staff, couriers, customers, orders, and payments across Ethiopia.

---

## 📦 Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | TailwindCSS 3 |
| State | Zustand |
| Server State | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Router | React Router v6 |
| HTTP | Axios |
| Icons | Lucide React |
| Real-time | Socket.io Client |
| Toasts | Sonner |
| Dates | date-fns |

---

## 👥 Roles

| Role | Access |
|------|--------|
| **SUPER_ADMIN** | Everything — regions, branches, all staff, all orders, payment providers |
| **REGIONAL_ADMIN** | Everything within their region only |
| **BRANCH_MANAGER** | Everything within their branch only |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Backend API running (see `delivery_ethiopia_backend`)

### Setup

```bash
# 1. Clone
git clone https://github.com/yared098/delivery_ethiopia_admin.git
cd delivery_ethiopia_admin

# 2. Install
pnpm install

# 3. Environment
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend URL

# 4. Run
pnpm run dev
```

Admin panel runs at **`http://localhost:5173`**

---

## 🔑 Environment Variables

```env
VITE_API_URL=http://localhost:3000/api/v1
```

For production:
```env
VITE_API_URL=https://api.deliver.et/api/v1
```

---

## 🔐 Login

Login is **phone + OTP** (same as the backend auth).

1. Enter staff phone number (e.g. `0911111111`)
2. Receive OTP via SMS
3. Enter OTP
4. Access dashboard

Only **staff accounts** (Super Admin, Regional Admin, Branch Manager) can log in. Customers and couriers use separate apps.

---

## 🗂️ Features

### 🏠 Dashboard
- System overview — total regions, branches, staff, couriers
- Recent activity
- Quick stats

### 🗺️ Regions
- Create, edit, delete regions
- View staff, branch, and courier counts per region
- See who created each region

### 🏢 Branches
- Create, edit, delete branches
- Assign to a region
- Set address, city, woreda, GPS coordinates
- Filter by region

### 👥 Staff
- Create Regional Admins (Super Admin only)
- Create Branch Managers
- Suspend / reactivate staff
- Reset passwords
- Region-scoped: Regional Admins see only their region

### 🚴 Couriers
- Register couriers with full details
- Upload national ID, license, vehicle photo, selfie
- Approve / reject pending couriers
- Suspend / reactivate
- View live status, rating, total deliveries
- **Detail page** with everything
- **Live tracking** in real-time

### 👤 Customers
- Register customers (senders & receivers)
- Auto-link when order created with matching phone
- Suspend / reactivate
- View sent + received orders

### 📦 Orders
- **Multi-step creation wizard** — sender → receiver → items → review
- Multiple items per order (free-text item names)
- Auto-calculate price based on distance + weight + type
- Send receiver link (when address is unknown)
- Cancel order
- **Detail page** with route, items, pricing, timeline
- **Live tracking** with courier GPS

### 💳 Payment Providers
- Add Telebirr, Chapa, CBE Birr, etc.
- Upload logos
- Set fee percentage + fixed fee
- Enable / disable providers
- Sort order

### 📡 Live Tracking (WebSocket)
- Real-time courier GPS updates
- Distance remaining
- ETA calculation
- Proximity alerts (2km, 500m, 100m, 20m)
- Live status changes

---

## 📁 Project Structure

```
src/
├── main.tsx                      # Entry point
├── App.tsx                       # Router + providers
├── router.tsx                    # Route definitions
├── index.css                     # Global styles + Tailwind
├── lib/
│   ├── api.ts                    # Axios client with auth refresh
│   ├── auth.ts                   # Zustand auth store
│   └── utils.ts                  # cn() helper
├── types/
│   └── index.ts                  # All TypeScript types
├── hooks/
│   ├── useAuth.ts                # Auth mutations
│   ├── useRegions.ts
│   ├── useBranches.ts
│   ├── useStaff.ts
│   ├── useCouriers.ts
│   ├── useCustomers.ts
│   ├── useOrders.ts
│   ├── usePaymentProviders.ts
│   └── useOrderTracking.ts       # WebSocket tracking
├── layout/
│   ├── DashboardLayout.tsx       # Sidebar + main content
│   └── PageHeader.tsx
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Regions.tsx
│   ├── Branches.tsx
│   ├── Staff.tsx
│   ├── Couriers.tsx
│   ├── CourierDetail.tsx
│   ├── Customers.tsx
│   ├── Orders.tsx
│   ├── OrderCreate.tsx           # Multi-step wizard
│   ├── OrderDetail.tsx
│   ├── PaymentProviders.tsx
│   └── NotFound.tsx
└── components/
    ├── ProtectedRoute.tsx
    ├── ui/                       # Reusable primitives
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Modal.tsx
    │   ├── ConfirmDialog.tsx
    │   ├── EmptyState.tsx
    │   ├── TableSkeleton.tsx
    │   └── FileUpload.tsx
    ├── regions/
    │   └── RegionFormModal.tsx
    ├── branches/
    │   └── BranchFormModal.tsx
    ├── staff/
    │   ├── CreateStaffModal.tsx
    │   └── ResetStaffPasswordModal.tsx
    ├── couriers/
    │   ├── CreateCourierModal.tsx
    │   └── RejectCourierModal.tsx
    ├── customers/
    │   └── CustomerFormModal.tsx
    ├── orders/
    │   └── LiveTrackingWidget.tsx
    └── providers/
        └── ProviderFormModal.tsx
```

---

## 🎨 UI Components

All UI follows a consistent design system:

- **Cards** — `bg-white rounded-lg shadow-sm border`
- **Buttons** — `btn`, `btn-primary`, `btn-secondary`, `btn-danger`
- **Inputs** — `input`, `label`
- **Modals** — Centered, scrollable, with sticky footer
- **Toasts** — Top-right, rich colors (Sonner)
- **Tables** — Responsive, sortable filters, row hover

---

## 🔌 API Endpoints (Consumed)

| Group | Endpoints |
|-------|-----------|
| **Auth** | `/auth/staff/otp/request`, `/auth/staff/otp/verify`, `/auth/staff/password/login`, `/auth/refresh`, `/auth/logout` |
| **Regions** | `GET/POST/PATCH/DELETE /admin/regions` |
| **Branches** | `GET/POST/PATCH/DELETE /admin/branches` |
| **Staff** | `GET/POST /admin/staff/*`, `POST /admin/staff/:id/suspend`, `reset-password` |
| **Couriers** | `GET/POST/PATCH /admin/couriers`, `POST /:id/approve`, `/reject`, `/suspend`, `/reactivate`, `/:id/location` |
| **Customers** | `GET/POST/PATCH/DELETE /admin/customers` |
| **Orders** | `GET/POST/PATCH /admin/orders`, `POST /:id/send-receiver-link`, `/cancel` |
| **Payment Providers** | `GET/POST/PATCH/DELETE /admin/payment-providers`, `POST /:id/toggle` |
| **Uploads** | `POST /uploads/courier`, `POST /uploads/provider` |
| **WebSocket** | `ws://.../tracking` namespace |

---

## 🔒 Security

- JWT access + refresh tokens
- Auto-refresh on 401
- Region-scoped queries (Regional Admins only see their data)
- Role-based access control (RBAC) on every endpoint
- OTP-based login (no passwords stored client-side)
- HTTPS-ready

---

## 📡 Real-Time Tracking

Uses **Socket.io** for live courier tracking:

```typescript
const { connected, lastLocation, lastAlert } = useOrderTracking(orderId);
```

Events handled:
- `location:update` — courier GPS every 15s
- `status:change` — order status transitions
- `proximity:alert` — near / close / arriving / at door
- `order:event` — timeline additions

---

## 🚀 Build for Production

```bash
pnpm run build
```

Output: `dist/`

**Serve with:**

```bash
# Using Nginx, serve dist/ as static files
# Point /api to your backend
```

**Or via Docker:**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## 🗺️ Roadmap

- [x] Auth (phone + OTP)
- [x] Regions CRUD
- [x] Branches CRUD
- [x] Staff management (Regional Admin, Branch Manager)
- [x] Couriers (register, approve, suspend, live view)
- [x] Customers (register, manage)
- [x] Orders (create, list, detail, cancel)
- [x] Payment Providers (add Telebirr, Chapa)
- [x] Real-time tracking (WebSocket)
- [ ] Interactive map (Leaflet)
- [ ] Public customer tracking page
- [ ] Push notifications
- [ ] Reports & analytics
- [ ] Payout management
- [ ] Multi-language (Amharic)

---

## 🤝 Related Repos

| Repo | Purpose |
|------|---------|
| [delivery_ethiopia_backend](https://github.com/yared098/delivery_ethiopai_backend) | NestJS API + PostgreSQL + WebSocket |
| [delivery_ethiopia_customer](https://github.com/yared098/delivery_ethiopia_customer) | Customer web app (coming) |
| [delivery_ethiopia_mobile](https://github.com/yared098/delivery_ethiopia_mobile) | Flutter mobile app (coming) |

---

## 📄 License

MIT © 2026 Delivery Ethiopia# delivery_ethiopia_admin
