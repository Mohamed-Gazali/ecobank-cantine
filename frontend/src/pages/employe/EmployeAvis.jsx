import { useEffect, useState } from "react";
import api from "../../api";

const CATEGORIES = [
  { valeur: "qualite", libelle: "Qualité du plat" },
  { valeur: "delai_livraison", libelle: "Délai de livraison" },
  { valeur: "autre", libelle: "Autre" },
];

export default function EmployeAvis() {
  const [categorie, setCategorie] = useState("qualite");
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [mesAvis, setMesAvis] = useState([]);

  const chargerAvis = () => {
    api.get("/avis/mes-avis").then((res) => setMesAvis(res.data));
  };

  useEffect(() => {
    chargerAvis();
  }, []);

  const soumettre = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      await api.post("/avis", { categorie, note, commentaire: commentaire || null });
      setCommentaire("");
      setNote(5);
      setConfirmation(true);
      chargerAvis();
      setTimeout(() => setConfirmation(false), 3000);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="px-6 py-6 md:py-8 max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">
        Donner votre avis
      </h1>
      <p className="text-ink/50 text-sm mb-6">
        Vos retours sont transmis directement au restaurant.
      </p>

      <form onSubmit={soumettre} className="bg-white rounded-2xl border border-ink/10 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Concerne</label>
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.valeur} value={c.valeur}>
                {c.libelle}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Note</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setNote(n)}
                className={`w-10 h-10 rounded-full border font-medium ${
                  note >= n
                    ? "bg-amber border-amber text-ink"
                    : "border-ink/15 text-ink/40"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Commentaire (facultatif)
          </label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white"
            placeholder="Dites-nous en plus..."
          />
        </div>

        {confirmation && (
          <p className="text-sage text-sm">Merci, votre avis a été envoyé !</p>
        )}

        <button
          type="submit"
          disabled={envoi}
          className="w-full bg-ink text-paper font-medium rounded-xl py-3 disabled:opacity-60"
        >
          {envoi ? "Envoi..." : "Envoyer mon avis"}
        </button>
      </form>

      <h2 className="font-display font-semibold text-ink mt-8 mb-3">Mes avis précédents</h2>
      <div className="space-y-2">
        {mesAvis.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-ink/10 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-ink">
                {CATEGORIES.find((c) => c.valeur === a.categorie)?.libelle}
              </span>
              <span className="text-amber-deep font-medium">{a.note}/5</span>
            </div>
            {a.commentaire && <p className="text-ink/60 text-sm">{a.commentaire}</p>}
          </div>
        ))}
        {mesAvis.length === 0 && (
          <p className="text-ink/50 text-sm text-center py-6">Aucun avis envoyé pour le moment.</p>
        )}
      </div>
    </div>
  );
}
