import React from "react";
import { Link } from "react-router-dom";
import { Icons } from "@/core/helpers/icons";
import { useAuth } from "../context/AuthContext";

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-blue-500 dark:bg-blue-600 shadow-lg">
            <Icons.Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to Template Starter
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            A production-ready React template with authentication, plans, admin panel, and modern UI
          </p>
          {user && (
            <p className="mt-4 text-lg text-slate-700 dark:text-slate-400">
              Hello, <span className="font-semibold text-blue-600 dark:text-blue-400">{user.email}</span>!
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<Icons.Lock className="w-8 h-8" />}
            title="Authentication Ready"
            description="Complete Supabase authentication with email/password and Google OAuth support"
            gradient="from-blue-500 to-blue-600"
          />
          <FeatureCard
            icon={<Icons.Zap className="w-8 h-8" />}
            title="Free & Pro Plans"
            description="Built-in subscription system with Lemon Squeezy integration"
            gradient="from-purple-500 to-purple-600"
          />
          <FeatureCard
            icon={<Icons.Shield className="w-8 h-8" />}
            title="Admin Panel"
            description="Full-featured admin dashboard for user management and analytics"
            gradient="from-green-500 to-green-600"
          />
          <FeatureCard
            icon={<Icons.Palette className="w-8 h-8" />}
            title="Dark Mode"
            description="Beautiful theme system with persistent dark mode support"
            gradient="from-orange-500 to-orange-600"
          />
          <FeatureCard
            icon={<Icons.Settings className="w-8 h-8" />}
            title="Modern Stack"
            description="React, Vite, TypeScript, TailwindCSS, and Supabase"
            gradient="from-pink-500 to-pink-600"
          />
          <FeatureCard
            icon={<Icons.Rocket className="w-8 h-8" />}
            title="Ready to Build"
            description="Clean architecture, ready for your next project"
            gradient="from-indigo-500 to-indigo-600"
          />
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Quick Links
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <QuickLink to="/user-settings" label="Your Settings" />
            <QuickLink to="/landing" label="Landing Page" />
            <QuickLink to="/upgrade" label="Plans & Pricing" />
            <QuickLink to="/admin" label="Admin Panel" admin />
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 border border-blue-200 dark:border-slate-600">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            🚀 Start Building
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            This is your home page. Start customizing it to build your application!
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Add new pages in <code className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-sm">src/pages/</code></span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Create reusable components in <code className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-sm">src/components/</code></span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Update routing in <code className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-sm">src/App.tsx</code></span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Configure Supabase in <code className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-sm">.env.local</code></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}> = ({ icon, title, description, gradient }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className={`inline-flex items-center justify-center w-14 h-14 mb-4 rounded-lg bg-gradient-to-br ${gradient} shadow-md text-white`}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-slate-600 dark:text-slate-400">
      {description}
    </p>
  </div>
);

// Quick Link Component
const QuickLink: React.FC<{
  to: string;
  label: string;
  admin?: boolean;
}> = ({ to, label, admin }) => (
  <Link
    to={to}
    className={`block px-6 py-4 rounded-lg font-medium transition-all duration-200 ${
      admin
        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg"
        : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600"
    }`}
  >
    {label} →
  </Link>
);

export default Home;
