import React, { useState } from "react";
import {
  Users,
  Shield,
  Activity,
  CreditCard,
  Settings,
  Sparkles,
} from "lucide-react";

// Hooks
import { useAdminSettings } from "../../features/admin/hooks/useAdminSettings";
import { useAdminPlansFeatures } from "../../features/admin/hooks/useAdminPlansFeatures";
import { getAllUserProfiles } from "../../features/admin/services/planService";
import BackToMainButton from "../../components/admin/BackToMainButton";

// Admin Pages
import Dashboard from "./menu/Dashboard";
import UsersManager from "./menu/UsersManager";
import Plan from "./menu/Plan";
import PlanQuotas from "./menu/PlanQuotas";
import Parameters from "./menu/Parameters";
import LLM from "./menu/LLM";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "plans" | "features" | "settings" | "llm"
  >("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Hooks
  const settings = useAdminSettings();
  const plansFeatures = useAdminPlansFeatures();

  // Fetch user profiles
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const profiles = await getAllUserProfiles();
      setUserProfiles(profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfiles();
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "plans", label: "Limites Plans", icon: CreditCard },
    { id: "features", label: "Features", icon: Settings },
    { id: "settings", label: "Paramètres", icon: Shield },
    { id: "llm", label: "Configuration LLM", icon: Sparkles },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar Navigation */}
      <div className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <BackToMainButton className="mb-4 -ml-2" />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Admin Panel
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Platform Management
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400">
          <p>Version 1.0.0</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {loading ? (
            <div className="bg-white dark:bg-slate-800 p-20 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-500 mt-4">Loading data...</p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && <Dashboard />}

              {activeTab === "users" && (
                <UsersManager
                  userStats={userProfiles.map((p) => ({
                    id: p.id,
                    email: p.email || "N/A",
                    workspaces: 0,
                    categories: 0,
                    bookmarks: 0,
                    largestCategorySize: 0,
                    plan: p.subscription_plan as "free" | "pro",
                    subscription_expires_at: p.subscription_expires_at,
                  }))}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onSelectUser={() => {}}
                  onRefresh={fetchProfiles}
                />
              )}

              {activeTab === "plans" && (
                <PlanQuotas
                  limits={plansFeatures.limits}
                  onLimitChange={plansFeatures.handleLimitChange}
                  onSave={plansFeatures.save}
                />
              )}

              {activeTab === "features" && (
                <Plan
                  features={plansFeatures.features}
                  onToggleFeature={plansFeatures.toggleFeature}
                  onSave={plansFeatures.save}
                />
              )}

              {activeTab === "settings" && (
                <Parameters
                  siteUrl={settings.siteUrl}
                  onSiteUrlChange={settings.setSiteUrl}
                  appName={settings.appName}
                  onAppNameChange={settings.setAppName}
                  appSubName={settings.appSubName}
                  onAppSubNameChange={settings.setAppSubName}
                  loading={settings.loading}
                  onSave={settings.saveSettings}
                />
              )}

              {activeTab === "llm" && <LLM />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
