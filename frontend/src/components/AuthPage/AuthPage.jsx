// src/pages/AuthPage/AuthPage.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

function AuthPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginValue, setLoginValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Récupérer les données de redirection
  const returnUrl = location.state?.returnUrl || "/";
  const productName = location.state?.productName;
  const message = location.state?.message;

  // Callback pour SignIn après succès
  const handleLoginSuccess = (token, userData) => {
    // Appeler la fonction login du contexte
    login(token, userData);
    
    // Rediriger vers l'URL d'origine ou la page d'accueil
    navigate(returnUrl, { replace: true });
  };

  return (
    <div className="max-w-4xl  mx-auto mt-40 mb-20 p-4">
      {/* Message contextuel */}
      {message && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-blue-800 text-sm font-medium">
               {message}
              {productName && ` - "${productName}"`}
            </p>
          </div>
        </div>
      )}

      {/* Bouton retour */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <button
          onClick={() => navigate(returnUrl || "/")}
          className="text-gray-600 hover:text-black flex items-center gap-2 text-sm"
        >
          ← Retour
        </button>
      </div>

      {/* Contenu principal */}
      <div >
        <div >
          {/* Section gauche: SignIn avec contexte */}
          <div>
            <SignIn
              loginValue={loginValue}
              setLoginValue={setLoginValue}
              onUserNotFound={() => setIsModalOpen(true)}
              onLoginSuccess={handleLoginSuccess} // Nouveau prop
            />
          </div>

          {/* Section droite: Info produit si applicable */}
          {productName && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Article à ajouter</h3>
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Ici vous pourriez afficher l'image du produit */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400 text-xs">Image produit</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">{productName}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Connectez-vous pour ajouter cet article à votre panier
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal SignUp */}
      <SignUp
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        defaultLoginValue={loginValue}
        onSignupSuccess={handleLoginSuccess} // Nouveau prop
      />
    </div>
  );
}

export default AuthPage;