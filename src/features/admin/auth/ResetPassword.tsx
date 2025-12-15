import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabase/config";
import { Icons } from "@/core/helpers/icons";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );
      
      if (resetError) throw resetError;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        <Link to="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4">
          <Icons.ArrowLeft size={20} className="mr-2" />
          Retour à la connexion
        </Link>
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Icons.Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Envoyer le lien
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
            <Icons.ArrowLeft size={16} /> Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;