# NEET Center Partner Finder

A full-stack web application for NEET students to find exam center partners across Tamil Nadu. Built with React (Vite) + Supabase + Tailwind CSS.

---

## 🚀 Features

- **Public Registration Form** — Students submit their details (auto-uppercased)
- **Search & Filter Page** — Filter by district/center with live search + URL query params
- **Admin Dashboard** — Auth-protected CRUD panel with CSV export
- **Mobile-First Design** — Fully responsive dark UI

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth) |
| State | React hooks only |
| Routing | React Router v7 |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Form.jsx          # Registration form (uppercase, validated)
│   ├── Filters.jsx       # District/center filter dropdowns
│   ├── Navbar.jsx        # Sticky responsive navbar
│   ├── StudentTable.jsx  # Search results card layout
│   └── Toast.jsx         # Toast notification + hook
├── lib/
│   ├── supabaseClient.js # Supabase client initialization
│   └── districts.js      # Tamil Nadu districts & centers data
├── pages/
│   ├── Home.jsx          # Landing page
│   ├── SubmitForm.jsx    # Register page
│   ├── Search.jsx        # Search & filter page
│   ├── AdminLogin.jsx    # Admin login (Supabase Auth)
│   └── AdminDashboard.jsx# Admin CRUD dashboard
├── App.jsx               # Router + layout
└── main.jsx              # Entry point
```

---

## ⚙️ Local Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd "neet center"
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 🗄 Supabase Database Setup

### SQL — Create Table + RLS

```sql
-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  center TEXT NOT NULL,
  district TEXT NOT NULL,
  telegram TEXT NOT NULL,
  roll TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index to prevent duplicate Telegram usernames
CREATE UNIQUE INDEX students_telegram_unique ON public.students (telegram);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT
CREATE POLICY "Allow public insert" ON public.students
  FOR INSERT TO anon WITH CHECK (true);

-- Policy: Anyone can SELECT (for public search)
CREATE POLICY "Allow public select" ON public.students
  FOR SELECT TO anon USING (true);

-- Policy: Authenticated can UPDATE
CREATE POLICY "Allow authenticated update" ON public.students
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Policy: Authenticated can DELETE
CREATE POLICY "Allow authenticated delete" ON public.students
  FOR DELETE TO authenticated USING (true);

-- Public view (only shows non-sensitive columns)
CREATE OR REPLACE VIEW public.students_public
  WITH (security_invoker = true)
AS
  SELECT id, name, center, district, telegram, created_at
  FROM public.students;

-- Grants
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.students TO anon;
GRANT INSERT ON public.students TO anon;
GRANT SELECT ON public.students_public TO anon;
GRANT ALL ON public.students TO authenticated;
```

---

## 🔐 Admin Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication → Users**
3. Click **Add User → Create New User**
4. Enter your admin email and a strong password
5. Use these credentials on the `/admin` login page

> ⚠️ No admin credentials are hardcoded in the frontend — authentication is fully handled by Supabase Auth.

---

## 🌐 Deployment (Vercel)

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B — GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Set **Root Directory** to the project folder
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy!

### Build Command
```bash
npm run build
```

### Output Directory
```
dist/
```

---

## 📄 Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Home / Landing | Public |
| `/register` | Submit Form | Public |
| `/search` | Find Partners | Public |
| `/admin` | Admin Login | Public (login) |
| `/admin/dashboard` | Admin Dashboard | Authenticated only |

---

## 🔍 Search Features

- Live search by name or Telegram username
- Filter by district (38 Tamil Nadu districts)
- Dependent center dropdown (updates based on district)
- Query params support: `?district=CHENNAI&center=...`
- Results update debounced (300ms) for performance

---

## 🛡 Security

- RLS enabled on all tables
- Public can only INSERT and SELECT
- Admin CRUD requires Supabase Auth session
- No passwords stored or hardcoded in frontend
- Duplicate prevention via unique index on telegram column
- Input sanitized and uppercased before storage
