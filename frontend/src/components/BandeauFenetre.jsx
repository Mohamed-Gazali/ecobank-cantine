import { useEffect, useState } from "react";
import api from "../api";

export default function BandeauFenetre({ onStatut }) {
  const [statut, setStatut] = useState(null);

  useEffect(() => {
    const charger = () => {
      api.get("/commandes/fenetre").then((res) => {
        setStatut(res.data);
        onStatut?.(res.data.ouverte);
      });
    };
    charger();
    const intervalle = setInterval(charger, 30000); // resynchronise toutes les 30s
    return () => clearInterval(intervalle);
  }, []);

  if (!statut) return null;

  if (statut.ouverte) {
    return (
      <div className="bg-sage/15 border border-sage/30 text-ink rounded-2xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium">
          Commandes ouvertes jusqu'à {statut.heure_fermeture}
        </span>
        <span className="text-xs text-ink/50 font-body">Il est {statut.heure_serveur}</span>
      </div>
    );
  }

  return (
    <div className="bg-coral/10 border border-coral/30 text-coral rounded-2xl px-4 py-3">
      <p className="text-sm font-medium">
        Les commandes sont fermées pour aujourd'hui.
      </p>
      <p className="text-xs text-coral/70 mt-0.5">
        Réouverture demain à {statut.heure_ouverture} — fermeture à {statut.heure_fermeture}.
      </p>
    </div>
  );
}
