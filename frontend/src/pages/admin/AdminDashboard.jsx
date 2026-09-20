import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

export default function AdminDashboard() {
  const [resume, setResume] = useState([]);
  const [totalCommandes, setTotalCommandes] = useState(0);
  const [avisRecents, setAvisRecents] = useState([]);

  useEffect(() => {
    api.get("/dashboard/resume").then((res) => setResume(res.data));
    api.get("/dashboard/commandes").then((res) => setTotalCommandes(res.data.length));
    api.get("/avis").then((res) => setAvisRecents(res.data.slice(0, 5)));
  }, []);

  return (
    <div className="px-6 py-6 md:py-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Tableau de bord</h1>
      <p className="text-ink/50 text-sm mb-6">Vue d'ensemble de la journée.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-2xl border border-ink/10 p-5">
          <p className="text-3xl font-display font-semibold text-ink">{totalCommandes}</p>
          <p className="text-sm text-ink/60">Commandes aujourd'hui</p>
        </div>
        {resume.slice(0, 2).map((r) => (
          <div key={r.plat_nom} className="bg-white rounded-2xl border border-ink/10 p-5">
            <p className="text-3xl font-display font-semibold text-amber-deep">
              {r.quantite_totale}
            </p>
            <p className="text-sm text-ink/60">{r.plat_nom}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          to="/dashboard/commandes"
          className="bg-ink text-paper text-sm font-medium rounded-xl px-4 py-2.5"
        >
          Voir les commandes
        </Link>
        <Link
          to="/dashboard/menu-jour"
          className="border border-ink/15 text-ink text-sm font-medium rounded-xl px-4 py-2.5"
        >
          Gérer le menu du jour
        </Link>
      </div>

      <h2 className="font-display font-semibold text-ink mb-3">Derniers avis reçus</h2>
      <div className="space-y-2 max-w-lg">
        {avisRecents.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-ink/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">
                {a.employe.nom} · {a.employe.agence.nom}
              </p>
              <span className="text-amber-deep font-medium">{a.note}/5</span>
            </div>
            {a.commentaire && <p className="text-ink/60 text-sm mt-1">{a.commentaire}</p>}
          </div>
        ))}
        {avisRecents.length === 0 && (
          <p className="text-ink/50 text-sm">Aucun avis reçu pour le moment.</p>
        )}
      </div>
    </div>
  );
}
