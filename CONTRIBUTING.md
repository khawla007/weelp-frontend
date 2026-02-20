## 📦 Project Architecture & Contribution Guide

This project follows a **concern-based, scalable architecture**, inspired by domain-driven and clean architecture principles.

### 🔍 Where Should I Add My Code?

| What You're Doing                       | Where to Write Code           | Notes                             |
| --------------------------------------- | ----------------------------- | --------------------------------- |
| Building a new UI element               | `src/app/components/feature/` | Create reusable components        |
| Adding a new page                       | `src/app/route/`              | Follow Next.js routing            |
| Writing GET API calls                   | `src/services/feature.js`     | Keep pure, testable functions     |
| Writing POST/PUT/DELETE logic           | `src/actions/feature.js`      | Encapsulate mutations             |
| Creating shared hooks or Zustand stores | `src/lib/`                    | For global or reusable logic      |
| Writing reusable helpers                | `src/utils/`                  | Must be pure and side-effect free |

### 💼 Folder Convention

- `services/` — handles external GETs (public data)
- `actions/` — handles mutations or server actions
- `lib/store/` — Zustand or shared logic
- `components/` — atomic or feature-based UI blocks
- `app/` — Next.js routes and layouts
- `utils/` — pure functions only
- `src/app/api/` — created proxy route for client side fetching using :USECASE (swr)

### 🧱 Design Principles

- **Separation of concerns**: UI, logic, and data should be isolated
- **Predictable naming**: `createPost`, `getUserById`, `updateCategory`
- **Reusability first**: Prefer composition over duplication

### 🧪 Testing & Verification

- Run `npm run lint` and `npm run test` before PR
- Keep logic testable and predictable
