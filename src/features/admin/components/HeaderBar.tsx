import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icons } from "@/core/helpers/icons";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import Logo from "../../../assets/Logo.png";
import { useUserPlanLimits } from "../hooks/useUserPlanLimits";
import HelpModal from "../HelpModal";
import TokenUsageIndicator from "./TokenUsageIndicator";
import AdminPlanToggle from "./AdminPlanToggle";

const HeaderBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { plan, subscriptionExpiresAt } = useUserPlanLimits();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const getDaysRemaining = () => {
    if (!subscriptionExpiresAt) return null;
    const now = new Date();
    const expires = new Date(subscriptionExpiresAt);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <nav className="bg-slate-200 dark:bg-slate-800 border-b-2   border-slate-400 dark:border-slate-600 sticky top-0 z-50">
      <div className="">
        <div className="flex justify-between h-12 items-center">
          <div className="flex items-center gap-1 ml-2">           
            <Link
              to="/"
              title="Dashbord"
              className="flex p-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-yellow-700 dark:text-yellow-400 font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Icons.LayoutGrid className="w-4 h-4" />
            </Link>

            <Link
              to="/MesSnippets"
              title="Mes Snippets"
              className="ml-2 p-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-yellow-700 dark:text-yellow-400 font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Icons.Code2 className="w-4 h-4" />
            </Link>

            <Link
              to="/MesTaches"
              title="Mes Tâches"
              className="ml-2 p-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-blue-700 dark:text-blue-400 font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Icons.List className="w-4 h-4" />
            </Link>

            <Link
              to="/MesFichiers"
              title="Mes Fichiers"
              className="ml-2 p-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-orange-700 dark:text-orange-400 font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Icons.FileText className="w-4 h-4" />
            </Link>
            
            <Link
              to="/SQLConstructor"
              title="SQL Constructor"
              className="ml-2 p-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-red-700 dark:text-red-400 font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Icons.Hammer className="w-4 h-4" />
            </Link>

            <Link
              to="/MesTimeSheets"
              title="Mes TimeSheets"
              className="ml-2 p-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-green-700 dark:text-green-400 font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Icons.Clock className="w-4 h-4" />
            </Link>

          </div>

          <div className="flex items-center gap-2">
            {user && (
              <div className="relative flex items-center gap-2 mr-2">
                {/* User email with dropdown menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="hidden sm:inline text-sm text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none cursor-pointer"
                  >
                    {user.email}
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                      {/* Plan Status Section */}
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        {plan === "free" ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                              Plan Free
                            </span>
                            <Link
                              to="/upgrade"
                              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full font-medium"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              Passer PRO
                            </Link>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                Plan PRO
                              </span>
                              <Link
                                to="/upgrade"
                                className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full font-medium"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                Renouveler PRO
                              </Link>
                            </div>
                            {subscriptionExpiresAt && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Expire le{" "}
                                {new Date(
                                  subscriptionExpiresAt
                                ).toLocaleDateString("fr-FR")}
                                {daysRemaining !== null &&
                                  daysRemaining <= 30 && (
                                    <>
                                      {" "}
                                      <span className="text-yellow-500 dark:text-yellow-400">
                                        ({daysRemaining} jours restants)
                                      </span>
                                    </>
                                  )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Token Usage Section */}
                      <TokenUsageIndicator className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50" />

                      {/* Menu Items */}
                      <div className="py-1">
                        {/* Your Settings */}
                        <button
                          onClick={() => {
                            navigate("/user-settings");
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                        >
                          <Icons.Settings size={16} />
                          <span>Vos paramètres</span>
                        </button>

                        {/* Help */}
                        <button
                          onClick={() => {
                            setShowHelpModal(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                        >
                          <Icons.HelpCircle size={16} />
                          <span>Aide</span>
                        </button>

                        {/* Admin-only options */}
                        {user?.id ===
                          "714084df-5a70-43fc-acfd-e2ce97fd0510" && (
                          <>
                            <div className="my-1 border-t border-slate-200 dark:border-slate-700"></div>
                            <div className="w-full px-4 py-2">
                              <AdminPlanToggle />
                            </div>
                            {/* Landing Page */}
                            <button
                              onClick={() => {
                                navigate("/landing");
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-3"
                            >
                              <Icons.Presentation size={16} />
                              <span>Landing Page</span>
                            </button>

                            {/* Thank You Page */}
                            <button
                              onClick={() => {
                                navigate("/thank-you");
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-3"
                            >
                              <Icons.Presentation size={16} />
                              <span>Remerciements</span>
                            </button>

                            {/* Admin */}
                            <button
                              onClick={() => {
                                navigate("/admin");
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-3"
                            >
                              <Icons.Shield size={16} />
                              <span>Admin</span>
                            </button>
                          </>
                        )}

                        <div className="my-1 border-t border-slate-200 dark:border-slate-700"></div>

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                        >
                          <Icons.LogOut size={16} />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <ThemeToggle />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />
      )}
    </nav>
  );
};

export default HeaderBar;
