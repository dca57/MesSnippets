import React from "react";
import { Icons } from "@/core/helpers/icons";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpSection = ({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex gap-4 p-4 bg-slate-100 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700">
    <div className="shrink-0">
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
        <Icon size={20} />
      </div>
    </div>
    <div>
      <h4 className="font-bold text-slate-900 dark:text-white mb-1">{title}</h4>
      <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-300 dark:border-slate-700 flex justify-between items-center bg-slate-100 dark:bg-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Icons.HelpCircle size={24} className="text-blue-600" />
            Mes Snippets - Help
          </h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <Icons.X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <HelpSection icon={Icons.Rocket} title="What is Mes Snippets?">
            <p>
              Mes Snippets is a web application to manage my snippets:
            </p>
            <ul className="list-disc list-inside mt-1 ml-1 space-y-1">
              <li>Complete authentication system (email/password + Google OAuth)</li>
              <li>Free & Pro plan management</li>
              <li>Admin panel for user management</li>
              <li>Dark mode theme system</li>
              <li>Responsive design with TailwindCSS</li>
            </ul>
          </HelpSection>

          <HelpSection icon={Icons.Lock} title="Authentication">
            <p>
              The template includes a complete authentication flow powered by Supabase:
            </p>
            <ul className="list-disc list-inside mt-1 ml-1 space-y-1">
              <li><strong>Login</strong> - Sign in with email/password or Google</li>
              <li><strong>Register</strong> - Create a new account</li>
              <li><strong>Password Reset</strong> - Recover your account</li>
              <li><strong>Protected Routes</strong> - Automatic redirects for unauthenticated users</li>
            </ul>
          </HelpSection>

          <HelpSection icon={Icons.Shield} title="Admin Panel">
            <p>
              Access the admin panel from the user menu (requires admin role):
            </p>
            <ul className="list-disc list-inside mt-1 ml-1 space-y-1">
              <li><strong>Dashboard</strong> - View user statistics and metrics</li>
              <li><strong>Users</strong> - Manage all registered users</li>
              <li><strong>LLM Config</strong> - Configure AI/LLM settings</li>
              <li><strong>Plans</strong> - Manage Free and Pro plan features</li>
              <li><strong>Audit</strong> - View activity logs</li>
            </ul>
          </HelpSection>

          <HelpSection icon={Icons.Palette} title="Theme System">
            <p>
              Toggle between light and dark mode using the button in the header. Your preference is saved automatically.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">
              The theme syncs with your system preferences on first visit.
            </p>
          </HelpSection>

          <HelpSection icon={Icons.Settings} title="Getting Started">
            <p>
              To customize this template for your project:
            </p>
            <ul className="list-disc list-inside mt-1 ml-1 space-y-1">
              <li>Add new pages in <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">src/pages/</code></li>
              <li>Create reusable components in <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">src/components/</code></li>
              <li>Update routing in <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">src/App.tsx</code></li>
              <li>Configure Supabase in <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">.env.local</code></li>
            </ul>
            <p className="mt-2">
              Check the <strong>README.md</strong> file for detailed documentation.
            </p>
          </HelpSection>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md font-medium transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
