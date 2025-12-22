# Mes Snippets

A minimal, production-ready React template with authentication, plans, admin panel, and modern UI. Built with React, Vite, TypeScript, TailwindCSS, and Supabase.

## 🎯 What's Included

This template provides a solid foundation for building modern web applications:

### Core Features
- ✅ **Complete Authentication** - Email/Password + Google OAuth via Supabase
- ✅ **Free & Pro Plans** - Subscription system with Lemon Squeezy integration
- ✅ **Admin Panel** - Dashboard, user management, LLM configuration, audit logs
- ✅ **Dark Mode** - Beautiful theme system with persistent preferences
- ✅ **Protected Routes** - Secure routing with automatic redirects
- ✅ **Responsive Design** - Mobile-first UI with TailwindCSS
- ✅ **TypeScript** - Full type safety throughout

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS 4
- **Backend**: Supabase (Auth + Database)
- **Payments**: Lemon Squeezy integration
- **Icons**: Lucide React
- **Charts**: Recharts (admin dashboard)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Template
npm install
```

### 2. Configure Supabase

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get your Supabase credentials from:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to Settings → API
4. Copy your Project URL and anon/public key

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── HeaderBar.tsx    # Main navigation header
│   ├── ProtectedRoute.tsx # Route protection
│   ├── ThemeToggle.tsx  # Dark mode toggle
│   ├── passerPro/       # Plan upgrade components
│   └── plans/           # Plan cards (Free/Pro)
│
├── context/             # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   ├── ThemeContext.tsx # Dark mode theme
│   ├── HeaderActionContext.tsx
│   └── ViewContext.tsx
│
├── hooks/               # Custom React hooks
│   ├── useTheme.ts      # Theme management
│   ├── usePlanLimits.ts # Plan feature limits
│   ├── useUserPlanLimits.ts
│   └── useAdmin*.ts     # Admin panel hooks
│
├── pages/               # Application pages
│   ├── Home.tsx         # Main home page
│   ├── Admin.tsx        # Admin panel
│   ├── admin/           # Admin sub-pages
│   │   ├── Dashboard.tsx
│   │   ├── UsersManager.tsx
│   │   ├── LLM.tsx
│   │   ├── Parameters.tsx
│   │   ├── Plan.tsx
│   │   ├── PlanQuotas.tsx
│   │   └── Audit.tsx
│   └── Legal/           # Legal pages
│
├── pages/template/      # Auth & template pages
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ResetPassword.tsx
│   ├── AuthCallback.tsx
│   ├── LandingPage.tsx
│   ├── LandingPageLight.tsx
│   ├── ThankYou.tsx
│   └── User_Settings.tsx
│
├── services/            # API services
│   ├── adminService.ts  # Admin operations
│   └── planService.ts   # Plan management
│
├── supabase/            # Supabase configuration
│   ├── config.ts        # Client setup
│   └── types.ts         # Type definitions
│
├── types/               # TypeScript types
│   └── supabase.ts      # Database types
│
├── App.tsx              # Main app & routing
└── main.tsx             # Entry point
```

## 🎨 Customization Guide

### Adding a New Page

1. **Create the page component** in `src/pages/`:
   ```tsx
   // src/pages/MyNewPage.tsx
   import React from "react";
   
   const MyNewPage: React.FC = () => {
     return (
       <div className="p-8">
         <h1 className="text-3xl font-bold">My New Page</h1>
       </div>
     );
   };
   
   export default MyNewPage;
   ```

2. **Add route** in `src/App.tsx`:
   ```tsx
   import MyNewPage from "./pages/MyNewPage";
   
   // Inside <Routes>:
   <Route element={<ProtectedRoute />}>
     <Route path="/my-new-page" element={<MyNewPage />} />
   </Route>
   ```

3. **Add navigation link** (optional) in HeaderBar or your page.

### Updating the Theme

Edit `src/index.css` and `tailwind.config.js` for colors and styling.

### Configuring Plans

- Edit plan features in `src/hooks/usePlanLimits.ts`
- Update Lemon Squeezy variant IDs in `src/components/passerPro/`
- Modify plan UI in `src/components/plans/`

## 🔐 Authentication Flow

This template includes complete authentication:

- **Login** (`/login`) - Email/password or Google OAuth
- **Register** (`/register`) - Create new account
- **Reset Password** (`/reset-password`) - Password recovery
- **Auth Callback** (`/auth/callback`) - OAuth redirect handler

Users must be authenticated to access protected routes.

## 🛡️ Admin Panel

Access the admin panel at `/admin` (requires admin role in Supabase).

**Admin Features:**
- 📊 **Dashboard** - User statistics and system metrics
- 👥 **Users Manager** - View and manage all users
- ⚙️ **Parameters** - System configuration
- 🤖 **LLM Configuration** - AI/LLM settings
- 💎 **Plan Management** - Configure Free/Pro plans
- 📈 **Quotas** - Monitor usage and limits
- 📋 **Audit** - Activity logs

## 🌙 Dark Mode

The template includes a complete dark mode system:
- Persists across sessions (localStorage)
- Respects system preferences on first visit
- Toggle via header button
- All components support dark mode

## 💳 Payment Integration

Lemon Squeezy integration is pre-configured:
1. Set your Store ID and Variant IDs in payment components
2. Configure webhook in Supabase Edge Functions
3. Update plan logic as needed

## 📱 Responsive Design

All pages are mobile-responsive using TailwindCSS:
- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Test on all device sizes

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables
4. Deploy!

### Other Platforms

Build the project and deploy the `dist/` folder.

## 🧪 Development Tips

**Hot Module Replacement (HMR)**
Vite provides instant updates during development.

**Type Safety**
TypeScript catches errors before runtime.

**Linting**
Keep code clean and consistent.

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [TypeScript Documentation](https://www.typescriptlang.org)

## 🤝 Contributing

This is a template - customize it for your needs!

## 📄 License

This template is open source and available for your projects.

---

**Happy Building! 🚀**

Start by editing `src/pages/Home.tsx` to customize your home page.
