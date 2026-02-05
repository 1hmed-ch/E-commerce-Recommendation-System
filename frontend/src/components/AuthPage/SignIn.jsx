// src/pages/AuthPage/SignIn.jsx
import { FaGoogle, FaFacebook } from "react-icons/fa6";
import { LockKeyhole, MapPin } from 'lucide-react';
import { useState } from "react";
import ReductionCard from "./ReductionCard";
import api from "../../API/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function SignIn({ 
  loginValue, 
  setLoginValue, 
  onUserNotFound,
  onLoginSuccess // <-- AJOUTER CETTE PROP
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer l'URL de retour depuis la location
  const returnUrl = location.state?.returnUrl || "/";

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        username: loginValue,
        password: password,
      });

      // Stocker le token dans le localStorage
      localStorage.setItem("token", res.data.data.token);

      // Appeler le callback de succès avec le token et les données utilisateur
      if (onLoginSuccess) {
        onLoginSuccess(res.data.data.token, {
          username: loginValue,
          // Ajoutez d'autres données utilisateur depuis la réponse si disponibles
          ...res.data.data.user
        });
      } else {
        // Fallback: redirection simple si pas de callback
        navigate(returnUrl, { replace: true });
      }

    } catch (err) {
      console.error("Login error:", err);
      
      if (err.response?.status === 404 || err.response?.status === 401) {
        // Utilisateur non trouvé → ouvrir l'inscription
        if (onUserNotFound) {
          onUserNotFound();
        } else {
          setError("Utilisateur non trouvé. Veuillez vous inscrire.");
        }
      } else if (err.response?.status === 400) {
        setError("Données invalides. Vérifiez vos informations.");
      } else if (err.message === "Network Error") {
        setError("Erreur réseau. Vérifiez votre connexion.");
      } else {
        setError("Erreur lors de la connexion. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg">
        {/* Titre plus compact */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Connexion / Inscription</h2>
          <p className="text-green-600 text-xs mt-1 flex items-center justify-center gap-1">
            <LockKeyhole size={12} />
            Vos données sont protégées
          </p>
        </div>

        {/* Promotions */}
        <div className="mb-4">
          <ReductionCard />
        </div>

        {/* Formulaire plus compact */}
        <form onSubmit={handleSignInSubmit} className="space-y-3">
          {/* Email input */}
          <div>
            <input
              name="username"
              type="text"
              required
              value={loginValue}
              placeholder="Nom d'utilisateur ou email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 
                       hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black 
                       transition duration-150"
              onChange={(e) => setLoginValue(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Password input */}
          <div>
            <input
              name="password"
              type="password"
              required
              placeholder="Mot de passe"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 
                       hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black 
                       transition duration-150"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-red-600 text-xs text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 
                     transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connexion...
              </div>
            ) : (
              "CONTINUER"
            )}
          </button>
        </form>

        {/* Separator plus compact */}
        <div className="flex items-center my-4">
          <hr className="flex-1 border-gray-300" />
          <span className="mx-3 text-gray-500 text-xs">Ou</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Social Buttons plus compacts */}
        <div className="space-y-2">
          <button 
            type="button"
            disabled={loading}
            className="w-full flex items-center justify-center border border-gray-300 bg-white rounded-lg 
                     py-2.5 hover:bg-gray-50 transition duration-150 gap-2 disabled:opacity-50 text-sm"
          >
            <FaGoogle className="text-base text-gray-700" />
            <span className="font-medium text-gray-700">Continuer avec Google</span>
          </button>
          <button 
            type="button"
            disabled={loading}
            className="w-full flex items-center justify-center border border-gray-300 bg-white rounded-lg 
                     py-2.5 hover:bg-gray-50 transition duration-150 gap-2 disabled:opacity-50 text-sm"
          >
            <FaFacebook className="text-base text-blue-600" />
            <span className="font-medium text-gray-700">Continuer avec Facebook</span>
          </button>
        </div>
          
        {/* Footer plus compact */}
        <div className="mt-6 text-center space-y-3">
          <div className="text-gray-500">
            <p className="inline-flex items-center justify-center gap-1 text-xs">
              <MapPin size={12} />
              <span className="underline cursor-pointer hover:text-gray-700">France</span>
            </p>
          </div>

          <div className="text-gray-500 leading-relaxed">
            <p className="text-xs">
              En continuant, vous acceptez notre{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                Politique de confidentialité & cookies
              </a>
              {' '}et nos{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                Conditions Générales
              </a>.
            </p>
          </div>

          <div>
            <a href="#" className="text-gray-600 hover:text-black underline text-xs">
              Besoin d'aide pour vous connecter ?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}