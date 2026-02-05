import ReductionCard from "./ReductionCard";
import { useState, useEffect } from "react";
import api from "../../API/api";
import { useNavigate } from "react-router-dom";

const COUNTRY_CODES = [
  { code: "+212", label: "Maroc (+212)" },
  { code: "+33", label: "France (+33)" },
  { code: "+1", label: "USA (+1)" },
  { code: "+44", label: "Royaume-Uni (+44)" },
];

export default function SignUp({ isModalOpen, setIsModalOpen, defaultLoginValue }) {
  const [formData, setFormData] = useState({
    username: "",
    email: defaultLoginValue,
    password: "",
    fullName: "",
    phone: "",
    address: "",
  });

  const [countryCode, setCountryCode] = useState("+33");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // Nouvel état pour le message de succès

  useEffect(() => {
    if (defaultLoginValue) {
      setFormData((prev) => ({
        ...prev,
        email: defaultLoginValue,
      }));
    }
  }, [defaultLoginValue]);

  // Réinitialiser le succès quand le modal s'ouvre
  useEffect(() => {
    if (isModalOpen) {
      setSuccess(false);
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  // Validation côté front-end
  const validate = () => {
    const errs = {};

    if (!formData.username || formData.username.length < 3) {
      errs.username = "Le username doit contenir au moins 3 caractères";
    }
    if (formData.username.length > 50) {
      errs.username = "Le username ne doit pas dépasser 50 caractères";
    }

    if (!formData.email) {
      errs.email = "L’email est obligatoire";
    }

    if (!formData.password || formData.password.length < 6) {
      errs.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (formData.phone) {
      const phoneRegex = /^6\d{8}$/; // 6XXXXXXXX
      if (!phoneRegex.test(formData.phone)) {
        errs.phone = "Numéro invalide (ex: 6XXXXXXXX)";
      }
    }

    return errs;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await api.post("/auth/register", {
        ...formData,
        phone: formData.phone ? `${countryCode}${formData.phone}` : null,
      });

      // Afficher le message de succès
      setSuccess(true);
      
      // Rediriger vers SignIn après 1 seconde
      setTimeout(() => {
        setIsModalOpen(false);
        // Si vous avez une fonction pour ouvrir SignIn, appelez-la ici
        // Exemple: openSignInModal();
      }, 1000);

    } catch (err) {
      setErrors({
        api: err.response?.data?.message || "Erreur lors de l’inscription",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-xl p-6 relative">
        {/* Close button */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        {/* Title */}
        <h3 className="text-xl font-bold text-center">
          Create your SHOP account
        </h3>
        <p className="text-gray-600 text-sm text-center mt-2 flex items-center justify-center gap-1">
          It's simple and quick.
        </p>

        {/* Promotions */}
        <ReductionCard />

        {/* Message de succès */}
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 font-medium">
                Compte créé avec succès ! Redirection vers la connexion...
              </p>
            </div>
          </div>
        )}

        {/* Form inscription */}
        <form onSubmit={handleSignUpSubmit} className="mt-4 flex flex-col gap-3">
          {/* Full name + Username */}
          <div className="grid grid-cols-2 gap-3">
            <input
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="border border-gray-300 rounded-md px-4 py-2"
              required
              disabled={loading || success}
            />

            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="border border-gray-300 rounded-md px-4 py-2"
              required
              disabled={loading || success}
            />
            {errors.username && <p className="text-red-500 text-sm col-span-2">{errors.username}</p>}
          </div>
          
          {/* Phone avec code pays */}
          <div className="grid grid-cols-3 gap-3">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="border rounded-md px-3 py-2"
              disabled={loading || success}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            
            <div className="col-span-2">
              <input
                name="phone"
                placeholder="6XXXXXXXX"
                className="border rounded-md px-4 py-2 w-full"
                onChange={handleChange}
                disabled={loading || success}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
          </div>

          {/* Address */}
          <input
            name="address"
            type="text"
            placeholder="Address"
            className="border border-gray-300 rounded-md px-4 py-2"
            required
            onChange={handleChange}
            disabled={loading || success}
          />
          
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Adresse e-mail"
            className="border border-gray-300 rounded-md px-4 py-2"
            disabled={loading || success}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-md px-4 py-2"
            onChange={handleChange}
            required
            disabled={loading || success}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          
          {errors.api && <p className="text-red-600 text-sm">{errors.api}</p>}
          
          {/* Séparateur */}
          <hr className="my-2 border-gray-200" />

          {/* Checkbox politique */}
          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              required
              className="mt-1 accent-black"
              disabled={loading || success}
            />
            <span>
              J’accepte la{" "}
              <a href="#" className="underline hover:text-black">Politique de confidentialité</a>{" "}
              et les{" "}
              <a href="#" className="underline hover:text-black">Conditions d’utilisation.</a>
            </span>
          </label>
          
          {/* Checkbox notifications */}
          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input 
              type="checkbox" 
              className="mt-1 accent-black"
              disabled={loading || success}
            />
            <span>I would like to receive exclusive offers and notifications by email.</span>
          </label>

          <button 
            disabled={loading || success}
            type="submit"
            className="bg-black text-white py-2 rounded-md font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating the account...
              </div>
            ) : success ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Redirection...
              </div>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}