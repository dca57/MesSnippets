import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/config";

// IMPORTANT: Remplacez cette valeur par votre Variant ID Lemon Squeezy
const LEMON_VARIANT_ID = "1124056"; // TODO: À remplacer par le vrai ID

const PasserProButtonLarge = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // 1. Vérifier si user connecté
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/login");
        return;
      }

      // 2. Appeler la Edge Function avec le variantId
      const { data, error } = await supabase.functions.invoke(
        "lemon-create-checkout",
        {
          body: {
            userId: user.id,
            variantId: LEMON_VARIANT_ID,
            // returnUrl: window.location.origin + '/MesSnippets', // Optionnel
            // embed: false // Optionnel
          },
        }
      );

      if (error) {
        console.error("Erreur checkout:", error);
        alert("Erreur lors de la création du checkout. Veuillez réessayer.");
        return;
      }

      // 3. Redirection vers Lemon Squeezy (note: checkoutUrl, pas url)
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error("Pas de checkoutUrl dans la réponse:", data);
        alert("Erreur: URL de paiement non reçue.");
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full px-4 py-3 font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg"
    >
      {loading ? "Chargement..." : "Passer Pro"}
    </button>
  );
};

export default PasserProButtonLarge;
