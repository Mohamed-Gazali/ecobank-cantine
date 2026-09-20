import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Inscription() {
  const [agences, setAgences] = useState([]);
  const [nom, setNom] = useState("");
  const [numero, setNumero] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [agenceId, setAgenceId] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const { connecter } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/agences").then((res) => {
      setAgences(res.data);
      if (res.data.length) setAgenceId(res.data[0].id);
    });
  }, []);

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      const res = await api.post("/auth/inscription", {
        nom,
        numero,
        mot_de_passe: motDePasse,
        agence_id: agenceId,
      });
      connecter(res.data.access_token, res.data.employe);
      navigate("/");
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur lors de l'inscription");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center px-6 py-10">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">
          Créer un compte
        </h1>
        <p className="text-ink/60 mb-8">Une seule fois, ensuite vous n'aurez qu'à vous connecter.</p>

        <form onSubmit={soumettre} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nom complet</label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full rounded-xl border border-ink/15 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Numéro de téléphone</label>
            <input
              type="text"
              required
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full rounded-xl border border-ink/15 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber"
              placeholder="Ex: 90 00 00 00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Agence</label>
            <select
              required
              value={agenceId}
              onChange={(e) => setAgenceId(e.target.value)}
              className="w-full rounded-xl border border-ink/15 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber"
            >
              {agences.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Mot de passe</label>
            <input
              type="password"
              required
              minLength={4}
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
            {envoi ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6 text-center">
          Déjà un compte ?{" "}
          <Link to="/connexion" className="text-amber-deep font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
