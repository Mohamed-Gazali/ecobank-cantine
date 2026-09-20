import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Connexion() {
  const [numero, setNumero] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const { connecter } = useAuth();
  const navigate = useNavigate();

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      const res = await api.post("/auth/connexion", { numero, mot_de_passe: motDePasse });
      connecter(res.data.access_token, res.data.employe);
      navigate(res.data.employe.role === "restaurant" ? "/dashboard" : "/");
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur de connexion");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center px-6 py-10">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">
          Cantine du midi
        </h1>
        <p className="text-ink/60 mb-8">Connectez-vous pour commander votre plat.</p>

        <form onSubmit={soumettre} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Numéro</label>
            <input
              type="text"
              required
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full rounded-xl border border-ink/15 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber"
              placeholder="Votre numéro de téléphone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded-xl border border-ink/15 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber"
              placeholder="••••••••"
            />
          </div>

          {erreur && <p className="text-coral text-sm">{erreur}</p>}

          <button
            type="submit"
            disabled={envoi}
            className="w-full bg-ink text-paper font-medium rounded-xl py-3 hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {envoi ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6 text-center">
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="text-amber-deep font-medium">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
