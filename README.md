# Weelp

A modern booking application built with **Next.js 15**, leveraging powerful libraries and tools for a seamless, interactive, and performant user experience.

---

## 🚀 Tech Stack

### **Frontend**

- **React 19** – Core UI library
- **Next.js 15** – App router, server actions, SSR/SSG, and API handling
- **Tailwind CSS 3** – Utility-first CSS for rapid UI development
- **Shadcn Component Library** – Use ShadCN Components in Dashboard on the top of **Radix UI**
- **Lucide Icons** – Beautiful, consistent icon set
- **Swiper** – Mobile-friendly sliders and carousels
- **Recharts** – Responsive charting library
- **React Day Picker** – Use Separate React Day picker as well as Combined with Shadcn Also.

### **State Management**

- **Zustand** – Minimal, scalable state management
- **Axios** – For Handling API's for interceptors and instances

### **Forms,Validation & Utilities**

- **React Hook Form** – Performant, flexible form handling
- **Zod** – Type-safe schema validation
- **@hookform/resolvers** – Integration of Zod with React Hook Form
- **Lodash & lodash.debounce** – Utility functions and debouncing

### **Date & Time**

- **date-fns** – Modern JavaScript date utility library
- **react-day-picker** – Flexible calendar UI for picking dates

### **Authentication**

- **NextAuth.js (v5) Authjs** – Authentication and session handling
- **OTP-based Email Verification** – 6-digit OTP sent during registration with 10-minute expiration and rate limiting

### **File Handling**

- **react-dropzone** – File upload drag-and-drop support

### **Styling Enhancements**

- **tailwindcss-animate** – Animation utilities for Tailwind CSS
- **tailwind-merge** – Smart merging of Tailwind classes
- **clsx** – Conditional className utility

---

## 🧪 Development & Tooling

### **ESLint & Prettier**

- Code linting with Next.js ESLint config for best practices

### **PostCSS & Autoprefixer**

- CSS transformation and vendor prefixing

## 📁 Project Directory Structure

---

## Route Groups Overview

We have **TWO** main route groups in this project, used to separate the **public** site from the **authenticated dashboard**:

---

### 1. `(frontend)` – 🌐 Public Website Routes

#### Located under `app/(frontend)`

- Contains routes that are open to all users (no login required)
- Examples:
  - `/blogs`, `/package`, `/holiday`, `/city`, `/search`, etc.
- Ideal for marketing pages, product listings, destination guides, etc.
- Uses global `app/layout.js`

---

### 2. `(dashboard)` – 🔒 Authenticated Dashboard Routes

#### Located under `app/(dashboard)/dashboard`

- Restricted to logged-in users

Organized by access layer:

- `admin/` – Hooks for admin operations
- `customer/` – Hooks for customer dashboard
- `public/` – General data fetchers
- Uses its own scoped `layout.js`, `error.js`, and `not-found.js` inside the dashboard folder

---

### ✅ Benefits of Grouped Routes

- Clear separation of concerns
- Scalable for both frontend and admin features
- Simplifies layout and middleware management per route group

```bash
src                         # Entry Point to the Application
├──app
│ ├── (dashboard)           # Dashboard grouped routes (authenticated area)
│ │ └── dashboard
│ │ ├── admin                # Admin-specific dashboard pages
│ │ ├── customer             # Customer-facing dashboard pages
│ │ ├── error.js             # Error handling for dashboard
│ │ ├── layout.js            # Dashboard-specific layout
│ │ └── not-found.js         # 404 page for dashboard routes
│ ├── (frontend)             # Frontend grouped routes (public pages)
│ │ ├── activity
│ │ ├── blogs
│ │ ├── booking
│ │ ├── checkout
│ │ ├── city
│ │ ├── explore
│ │ ├── holiday
│ │ ├── itinerary
│ │ ├── package
│ │ ├── region
│ │ └── search
│ ├── transfers
│ ├── user                  # Login/signup/password reset pages
│ │ ├── login
│ │ ├── signup
│ │ ├── reset-password
│ │ └── forgot-password
│ ├── layout.js             # Global layout (frontend)
│ ├── loading.js
│ ├── not-found.js
│ ├── page.js
│ api                       # Proxy Api's
│ ├── auth
│ ├── dashboard
│ ├── hello
│ ├── search
│ └── user
│
│ components
│ ├── ui/
│ │ ├── use-toast.js        # Custom toast hook
│ │ └── use-mobile.jsx      # Hook for mobile detection
│ Data/                     # Static data or mock JSONs
│ globals.css
│ manifest.js               # PWA manifest
│
│ lib/
│ ├── actions/              # Server actions (mutations: POST, PUT, DELETE)
│ ├── services/             # Data fetching (GET only)
│ ├── store/                # Zustand global state management
│ ├── auth.js               # Authentication configurations
│ ├── axiosInstance.js      # Axios global configurations
│ └── utils.js              # Utility/helper functions
│
│ middleware.js             # Middleware logic (handled routes and sessions)
│ .env                      # Environment variables
│ .env.local                # Local environment variables
│ .eslintrc.json            # ESLint configuration
│ .gitignore                # Git ignore rules
│ Dockerfile                # Docker setup
│ components.json           # Handle ShadCN Based Component configuration
│ tsconfig.json             # Typescript Based Configuration
│ next-env.d.ts
│ next.config.mjs           # Next JS Based Configuration and Setup
│ package-lock.json
│ package.json              # Detailed About Packeged Used


```

## 🌐 Backend API

- This project is powered by a **Laravel-based REST API** developed by another team member.
- It handles all backend operations like:
  - User authentication
  - Booking logic
  - Data management (cities, regions, packages, etc.)

---

## 🌐 API Data Fetching Technique

### Use Proxy API's For Client side Data Fetching

#### **Basically I made a Businees Layer Trying to Implement SOC and SOLID Pattern**

**Facade Pattern + FSD + DDD + SOLID Principles**

This project implements a scalable, modular architecture for managing API data and business logic using a combination of:

- ✅ **Layer Based Pattern**
- ⚙️ **Single Responsibility & Open/Closed Principles** from SOLID

---

## 📁 Folder Structure Overview

### `lib/` — Core Logic & Integrations

### LET TAKE A EXAMPLE OF (ACTIVITIES) MODEL

| Folder/File                  | Purpose                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| `lib/services/activities.js` | Handle all **GET** requests related to `activities` model    |
| `lib/actions/activities.js`  | Handle **mutations** using Next.js **Server Actions**        |
| `lib/store/`                 | Zustand-based **global state management**                    |
| `lib/stripe/`                | Stripe **payment logic & helpers**                           |
| `lib/axios/`                 | Global **Axios instance** with public/private interceptors   |
| `lib/fetchers/`              | SWR-compatible **data fetchers**                             |
| `lib/utils/`                 | General **utility functions** (formatters, validators, etc.) |

---

### `src/hooks/api/` — Role-Based API Hooks

Benefits:

- Centralized API gateway
- Easier token handling & validation
- Better separation of access levels

---

## 🧱 Architectural Principles

### ✅ **Facade Pattern**

Used in `lib/` to create simplified interfaces for:

- Services
- Mutations
- External integrations (e.g., Stripe, Axios)

### ✅ **SOLID Principles**

- **Single Responsibility**: Each layer based single responsibility has one clear purpose.

---

## 💡 Benefits

- 📈 Highly scalable for growing codebases
- 🔐 Secure with role-based API structure
- 🧠 Easier to test and maintain
- 🚀 Fast developer experience with clean boundaries

---

    // "dev": "next dev",

  <!-- "next": "^15.1.7", -->
