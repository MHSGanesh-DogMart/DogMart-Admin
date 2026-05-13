# PetSaathi Admin Panel

React + Vite admin dashboard for the PetSaathi platform — manage users, listings, products, services, bookings, and more.

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Firebase Auth (email/password)
- Axios with Firebase ID token interceptor
- React Query, React Hook Form, Zod, Recharts

## Setup

```bash
npm install
```

Create a `.env` file (copy from `.env.development`):

```env
VITE_API_URL=http://localhost:3001/api
VITE_BACKEND_URL=http://localhost:3001
VITE_FIREBASE_VAPID_KEY=<your_vapid_key>
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run build:dev` | Dev build (development env) |
| `npm run lint` | ESLint check |
| `npm run test` | Run unit tests |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_BACKEND_URL` | Backend root URL |
| `VITE_FIREBASE_VAPID_KEY` | Firebase Cloud Messaging VAPID key |

## Deployment

Production URL: `https://petsaathi.mooo.com`

Run `npm run build` and deploy the `dist/` folder to your hosting provider.
