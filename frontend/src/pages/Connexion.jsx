import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

// Seam en pointillés façon perforation de ticket, entre le panneau bleu et le formulaire.
// Les cercles "papier" sont perforés dans le bleu de marque — le motif ticket de la
// cantine sert ici de pont visuel vers l'identité bancaire plutôt qu'une simple bande de couleur.
const seamHorizontal = {
  backgroundImage:
    "radial-gradient(circle at 6px 6px, #F7F3E8 6px, transparent 6.5px)",
  backgroundSize: "24px 13px",
  backgroundRepeat: "repeat-x",
  backgroundPosition: "bottom",
};

const seamVertical = {
  backgroundImage:
    "radial-gradient(circle at 6px 6px, #F7F3E8 6px, transparent 6.5px)",
  backgroundSize: "13px 24px",
  backgroundRepeat: "repeat-y",
  backgroundPosition: "right",
};

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
    <div className="min-h-screen bg-paper md:flex">
      {/* Panneau bleu — présence Ecobank affirmée dès l'arrivée */}
      <div className="relative bg-gradient-to-br from-brand-dark to-brand text-white px-8 pt-10 pb-14 md:pb-10 md:w-[42%] md:flex md:flex-col md:justify-center md:px-12 rounded-b-[2rem] md:rounded-b-none">
        <div
          className="md:hidden absolute inset-x-0 bottom-0 h-3"
          style={seamHorizontal}
        />
        <div className="hidden md:block absolute inset-y-0 right-0 w-3" style={seamVertical} />

        <span className="inline-block text-xs font-medium tracking-wide bg-white/12 text-white/90 rounded-full px-3 py-1 mb-6 w-fit">
          Service cantine · Partenaire Ecobank
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight max-w-xs">
          Le déjeuner de votre pause, prêt en 30 secondes.
        </h1>
        <p className="text-white/70 mt-4 max-w-xs text-sm leading-relaxed">
          Commandez entre 8h et 11h, votre plat vous attend à 13h.
          Aucune donnée bancaire n'est demandée — seulement votre nom,
          votre agence et votre choix du jour.
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-16">
        <div className="max-w-sm mx-auto w-full">
          <h2 className="font-display text-2xl font-semibold text-ink mb-1">
            Se connecter
          </h2>
          <p className="text-ink/60 mb-8 text-sm">
            Accédez à votre espace pour passer commande.
          </p>

          <form onSubmit={soumettre} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Numéro</label>
              <input
                type="text"
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full rounded-xl border border-ink/15 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-shadow"
                placeholder="Votre numéro de téléphone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Mot de passe</label>
              <input
                type="password"
                required
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full rounded-xl border border-ink/15 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-shadow"
                placeholder="••••••••"
              />
            </div>

            {erreur && (
              <p className="text-coral text-sm bg-coral/8 rounded-lg px-3 py-2">{erreur}</p>
            )}

            <button
              type="submit"
              disabled={envoi}
              className="w-full bg-brand text-white font-medium rounded-xl py-3.5 shadow-soft hover:bg-brand-dark active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {envoi ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="text-sm text-ink/60 mt-6 text-center">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="text-brand font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}