# GearNest — Equipment Rental Platform

GearNest connects equipment owners and customers through approved listings, flexible rental periods, and secure Stripe sandbox checkout.

Live application: https://gearnest.sraboni.dev

API: https://api.gearnest.sraboni.dev

Client repository: https://github.com/nafisasraboni/equipment-rental-client

Server repository: https://github.com/nafisasraboni/equipment-rental-server

## Features

- Responsive homepage with six featured database listings, six equipment categories, Framer Motion sections, and marked sample reviews.
- Public catalog with backend search, category/rental period/price/availability filters, sorting, and pagination.
- Better Auth email/password and Google sign-in, MongoDB adapter, short-lived JWTs, and Customer/Owner/Admin permissions.
- Private equipment details, persisted favorites, inclusive-date availability checks, and server-calculated USD totals.
- Stripe hosted sandbox checkout, verified payment confirmation, and rental history.
- Customer rentals/favorites, editable profile with ImgBB photos, and a persistent light/dark theme.
- Owner equipment uploads/CRUD, rental records, and database-based earnings charts.
- Admin approvals, role/suspension management, rental monitoring, and platform analytics.
- Loading, empty, and error states; authenticated routes preserve sessions on reload.

## Local development

Use Node.js 24 or newer. Start the separate API on port 4000, then configure this client:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

The client runs at `http://localhost:3000`. Configure `API_URL` and `NEXT_PUBLIC_API_URL` for the API. MongoDB, Google OAuth, and Better Auth credentials belong in ignored `.env.local`, with no secrets in `NEXT_PUBLIC_*` variables.

Google OAuth origins must include the client origin, with redirect `${BETTER_AUTH_URL}/api/auth/callback/google`. Only basic identity scopes are used. New email and Google accounts receive the Customer role; admins assign elevated roles. Existing password accounts connect Google from their authenticated Profile page, preserving Better Auth's local email verification safeguards.

For a fresh database, set the six private account variables and run `node --env-file=.env.local scripts/bootstrap-accounts.mjs` while the client is running. Existing accounts are reused. Credentials are written privately under `~/.config/gearnest/`, outside Git. Supply the Admin email/password privately to the examiner.

## Validation and deployment

```bash
npm run typecheck
npm run lint
npm run build
npm run cf:build
npm run cf:deploy
```

The Cloudflare build wrapper uses a temporary path because OpenNext interpolates cache-handler paths into quoted JavaScript. It keeps dev output separate, excludes environment files, and removes temporary artifacts afterward. On Linux it uses read-only dependency hard links when the source/build share a filesystem.

`wrangler.jsonc` binds `gearnest.sraboni.dev` to the OpenNext Worker. Set private Worker secrets `MONGODB_URI`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`. `NEXT_PUBLIC_API_URL` is embedded at build time. The Express Worker owns Stripe and ImgBB credentials.

Both Workers use TLS-authenticated MongoDB and database-scoped credentials. Dates use Asia/Dhaka. Daily rentals bill inclusive days; weekly/monthly rentals round up started 7/30-day periods. Bookings are confirmed only after server-verified sandbox payment.

## Packages and assets

Runtime: Next.js App Router, React, Better Auth and MongoDB adapter, MongoDB native driver, jose, Radix UI/shadcn-style components, Framer Motion, Lucide React, Recharts, Sonner, self-hosted Manrope Variable, class-variance-authority, clsx, and tailwind-merge. Development/deployment: TypeScript, ESLint, Tailwind CSS, OpenNext Cloudflare, and Wrangler.

Demonstration equipment/hero photos use Unsplash. The site icon is a project-owned SVG. Use Stripe test cards in sandbox mode. Successful payments and completed rentals email the customer and owner. Email verification, forgotten-password flows, and refunds are outside this assignment delivery.
