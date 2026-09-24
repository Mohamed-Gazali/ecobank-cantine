import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

const IconeTicket = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V8Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M9 6.5v9" stroke="currentColor" strokeWidth="1.6" strokeDasharray="1.8 2.2" strokeLinecap="round" />
  </svg>
);

const IconeEtoile = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3.5l2.47 5.13 5.53.72-4.05 3.9 1.02 5.6L12 16.1l-4.97 2.75 1.02-5.6-4.05-3.9 5.53-.72L12 3.5Z" />
  </svg>
);

function CarteStatSquelette() {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-5 animate-pulse">
      <div className="h-8 bg-ink/10 rounded w-12 mb-2" />
      <div className="h-3 bg-ink/5 rounded w-2/3" />
    </div>
  );
}

export default function AdminDashboard() {
  const [resume, setResume] = useState([]);
  const [totalCommandes, setTotalCommandes] = useState(null);
  const [avisRecents, setAvisRecents] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/resume").then((res) => setResume(res.data)),
      api.get("/dashboard/commandes").then((res) => setTotalCommandes(res.data.length)),
      api.get("/avis").then((res) => setAvisRecents(res.data.slice(0, 5))),
    ]).finally(() => setChargement(false));
  }, []);

  return (
    <div className="px-6 py-6 md:py-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Tableau de bord</h1>
      <p className="text-ink/50 text-sm mb-6">Vue d'ensemble de la journée.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {chargement ? (
          <>
            <CarteStatSquelette />
            <CarteStatSquelette />
            <CarteStatSquelette />
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-ink/10 p-5 shadow-card">
              <div className="flex items-center justify-between mb-1">
                <p className="text-3xl font-display font-semibold text-ink">{totalCommandes}</p>
                <IconeTicket className="w-5 h-5 text-brand/40" />
              </div>
              <p className="text-sm text-ink/60">Commandes aujourd'hui</p>
            </div>
            {resume.slice(0, 2).map((r) => (
              <div key={r.plat_nom} className="bg-white rounded-2xl border border-ink/10 p-5 shadow-card">
                <p className="text-3xl font-display font-semibold text-amber-deep">
                  {r.quantite_totale}
                </p>
                <p className="text-sm text-ink/60">{r.plat_nom}</p>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          to="/dashboard/commandes"
          className="bg-ink text-paper text-sm font-medium rounded-xl px-4 py-2.5 shadow-card hover:bg-ink-soft transition-colors"
        >
          Voir les commandes
        </Link>
        <Link
          to="/dashboard/menu-jour"
          className="border border-ink/15 text-ink text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-white transition-colors"
        >
          Gérer le menu du jour
        </Link>
      </div>

      <h2 className="font-display font-semibold text-ink mb-3">Derniers avis reçus</h2>
      <div className="space-y-2 max-w-lg">
        {avisRecents.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-ink/10 p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">
                {a.employe.nom} · {a.employe.agence.nom}
              </p>
              <span className="flex items-center gap-1 text-amber-deep font-medium text-sm">
                <IconeEtoile className="w-3.5 h-3.5" />
                {a.note}/5
              </span>
            </div>
            {a.commentaire && <p className="text-ink/60 text-sm mt-1">{a.commentaire}</p>}
          </div>
        ))}
        {!chargement && avisRecents.length === 0 && (
          <p className="text-ink/50 text-sm">Aucun avis reçu pour le moment.</p>
        )}
      </div>
    </div>
  );
}