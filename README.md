# Macrosatic

Macrosatic is a Next.js and Supabase authentication app with a sharper product surface than the default starter. It includes branded marketing UI, protected routes, session-aware auth, theme switching, and a simple authenticated dashboard.

## What It Does

- Presents a branded landing page for Macrosatic
- Supports sign up, login, and logout with Supabase Auth
- Protects authenticated routes on the server
- Shows a user dashboard with:
  - `Overview`
  - `Profile`
  - `Settings`
- Includes light, dark, and system theme switching

## Stack

- [Next.js](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [Lucide](https://lucide.dev/)

## App Structure

```text
app/
  page.tsx                # public landing page
  protected/page.tsx      # authenticated dashboard
  auth/...                # auth routes and flows
components/
  hero.tsx                # homepage hero section
  auth-button.tsx         # auth-aware nav button
  logout-button.tsx       # sign-out action
  theme-switcher.tsx      # theme toggle
lib/
  supabase/               # server/client Supabase helpers
```

## Features

- Server-side session checks for protected pages
- Supabase-backed authentication
- Dashboard cards populated from authenticated user data
- Theme switcher available across the UI
- Tailwind-based styling with reusable UI primitives

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root with your Supabase project values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

You can find both values in your Supabase project dashboard under API settings.

### 3. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Auth Flow

### Public route

- `/`
- Landing page with product messaging and entry points to sign up or log in

### Protected route

- `/protected`
- Requires an authenticated Supabase session
- Redirects unauthenticated users to `/auth/login`

### Dashboard sections

- `Overview`: simple welcome state and account summary
- `Profile`: username, email, and last login
- `Settings`: theme switcher and logout

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- `last logged in` is pulled from Supabase user metadata via `last_sign_in_at`
- Username falls back to the email prefix if explicit profile metadata is missing
- If project-wide linting reports errors from `.next/`, update ESLint ignores so generated files are excluded

## Roadmap

- Persisted user profile metadata
- Real dashboard metrics instead of placeholder account status
- Expanded settings beyond theme and logout
- Better light/dark parity across all marketing components

## License

Private project unless you choose to add a license.
