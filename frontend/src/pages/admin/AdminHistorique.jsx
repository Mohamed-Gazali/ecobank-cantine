import { useEffect, useState } from "react";
import api from "../../api";

function ilYA(jours) {
  const d = new Date();
  d.setDate(d.getDate() - jours);
  return d.toISOString().slice(0, 10);
}

export default function AdminHistorique() {
  const [dateDebut, setDateDebut] = useState(ilYA(7));
  const [dateFin, setDateFin] = useState(ilYA(0));
  const [stats, setStats] = useState(null);
  const [commandes, setCommandes] = useState([]);

  const charger = () => {
    const params = { date_debut: dateDebut, date_fin: dateFin };
    api.get("/historique/stats", { params }).then((res) => setStats(res.data));
    api.get("/historique/commandes", { params }).then((res) => setCommandes(res.data));
  };

  useEffect(() => {
    charger();
  }, [dateDebut, dateFin]);

  const maxParJour = stats?.commandes_par_jour.length
    ? Math.max(...stats.commandes_par_jour.map((j) => j.total_commandes))
    : 1;

  return (
    <div className="px-6 py-6 md:py-8 max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Historique</h1>
      <p className="text-ink/50 text-sm mb-6">
        Parcourez les commandes passées et les tendances sur une période.
      </p>

      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="block text-xs text-ink/50 mb-1">Du</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="rounded-xl border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1">Au</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="rounded-xl border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-ink/10 p-5">
              <p className="text-3xl font-display font-semibold text-ink">
                {stats.total_commandes}
              </p>
              <p className="text-sm text-ink/60">Commandes sur la période</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-ink/10 p-5 mb-6">
            <h2 className="font-display font-semibold text-ink mb-3">Commandes par jour</h2>
            <div className="flex items-end gap-2 h-32">
              {stats.commandes_par_jour.map((j) => (
                <div key={j.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-amber rounded-t-md"
                    style={{ height: `${(j.total_commandes / maxParJour) * 100}%`, minHeight: 4 }}
                  />
                  <span className="text-[10px] text-ink/40">
                    {new Date(j.date + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>
              ))}
              {stats.commandes_par_jour.length === 0 && (
                <p className="text-ink/50 text-sm">Aucune donnée sur cette période.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-ink/10 p-5 mb-6">
            <h2 className="font-display font-semibold text-ink mb-3">Plats les plus commandés</h2>
            <div className="space-y-2">
              {stats.plats_populaires.map((p) => (
                <div key={p.plat_nom} className="flex justify-between text-sm">
                  <span className="text-ink">{p.plat_nom}</span>
                  <span className="text-ink/50">{p.quantite_totale}</span>
                </div>
              ))}
              {stats.plats_populaires.length === 0 && (
                <p className="text-ink/50 text-sm">Aucune donnée sur cette période.</p>
              )}
            </div>
          </div>
        </>
      )}

      <h2 className="font-display font-semibold text-ink mb-3">Détail des commandes</h2>
      <div className="space-y-2">
        {commandes.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-ink/10 p-4 flex items-center justify-between text-sm"
          >
            <div>
              <p className="font-medium text-ink">{c.employe.nom}</p>
              <p className="text-ink/50">
                {c.lignes.map((l) => `${l.quantite}× ${l.plat.nom}`).join(", ")} · {c.employe.agence.nom}
              </p>
            </div>
            <span className="text-ink/40">
              {new Date(c.cree_le).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
            </span>
          </div>
        ))}
        {commandes.length === 0 && (
          <p className="text-ink/50 text-sm text-center py-6">Aucune commande sur cette période.</p>
        )}
      </div>
    </div>
  );
}
