import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { HeaderActionProvider } from "./context/HeaderActionContext";
import { ViewProvider } from "./context/ViewContext";
import HeaderBar from "./components/admin/HeaderBar";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import TailwindSafelist from "./components/admin/TailwindSafelist";

// Pages
// Pages Template (Login, Register, ResetPassword)
import Login from "./pages/admin/auth/Login";
import Register from "./pages/admin/auth/Register";
import ResetPassword from "./pages/admin/auth/ResetPassword";
import AuthCallback from "./pages/admin/auth/AuthCallback";
// Pages Applications
import Home from "./pages/Home";
import LandingPage from "./pages/admin/landing/LandingPage";
import LandingPageLight from "./pages/admin/landing/LandingPageLight";
import Admin from "./pages/admin/Admin";
import MentionsLegales from "./pages/admin/legal/MentionsLegales";
import PrivacyPolicy from "./pages/admin/legal/PrivacyPolicy";
import User_Settings from "./pages/admin/User_Settings";
import ThankYou from "./pages/admin/landing/ThankYou";
// Sidebar Pages
import Main from "./pages/Main";
import MesSnippets from "./pages/MesSnippets";
import SQLConstructor from "./pages/SQLConstructor";
import MesTimeSheets from "./pages/MesTimeSheets";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HeaderActionProvider>
          <ViewProvider>
            <Router>
              <div className="h-screen flex flex-col text-slate-900 dark:text-slate-50 bg-slate-200 dark:bg-slate-800 transition-colors duration-300 overflow-hidden">
                <TailwindSafelist />
                <div className="flex-none">
                  <HeaderBar />
                </div>

                <main className="flex-1 overflow-hidden relative">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    <Route path="/landing" element={<LandingPage />} />
                    <Route
                      path="/mentions-legales"
                      element={<MentionsLegales />}
                    />
                    <Route
                      path="/politique-confidentialite"
                      element={<PrivacyPolicy />}
                    />

                    {/* Route Admin */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/admin" element={<Admin />} />
                    </Route>

                    {/* Private Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/upgrade" element={<LandingPageLight />} />
                      <Route path="/thank-you" element={<ThankYou />} />
                    </Route>

                    {/* Private Routes for User Settings */}
                    <Route element={<ProtectedRoute />}>
                      <Route
                        path="/user-settings"
                        element={<User_Settings />}
                      />
                    </Route>

                    {/* Main Layout Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route element={<Main />}>
                        <Route index element={<Dashboard />} />
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/MesSnippets" element={<MesSnippets />} />
                        <Route
                          path="/SQLConstructor"
                          element={<SQLConstructor />}
                        />
                        <Route
                          path="/MesTimeSheets"
                          element={<MesTimeSheets />}
                        />
                      </Route>
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </ViewProvider>
        </HeaderActionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
