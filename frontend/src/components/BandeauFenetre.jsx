import { useEffect, useState } from "react";
import api from "../api";

const IconeHorloge = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

  if (!statut) {
    return <div className="h-14 rounded-2xl bg-ink/5 animate-pulse" />;
  }

  if (statut.ouverte) {
    return (
      <div className="bg-sage/12 border border-sage/25 text-ink rounded-2xl px-4 py-3 flex items-center gap-3">
        <IconeHorloge className="w-5 h-5 text-sage shrink-0" />
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="text-sm font-medium">
            Commandes ouvertes jusqu'à {statut.heure_fermeture}
          </span>
          <span className="text-xs text-ink/45 shrink-0 ml-2">Il est {statut.heure_serveur}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-coral/8 border border-coral/25 text-coral rounded-2xl px-4 py-3 flex items-start gap-3">
      <IconeHorloge className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium">Les commandes sont fermées pour aujourd'hui.</p>
        <p className="text-xs text-coral/70 mt-0.5">
          Réouverture demain à {statut.heure_ouverture} — fermeture à {statut.heure_fermeture}.
        </p>
      </div>
    </div>
  );
}