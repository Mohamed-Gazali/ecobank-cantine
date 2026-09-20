import { useEffect, useState } from "react";
import api from "../../api";

const LIBELLES_STATUT = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  livree: "Livrée",
  annulee: "Annulée",
};

export default function EmployeHistorique() {
  const [commandes, setCommandes] = useState([]);

  useEffect(() => {
    api.get("/commandes/mes-commandes").then((res) => setCommandes(res.data));
  }, []);

  const platFavori = (() => {
    if (commandes.length === 0) return null;
    const compte = {};
    commandes.forEach((c) => {
      c.lignes.forEach((l) => {
        compte[l.plat.nom] = (compte[l.plat.nom] || 0) + l.quantite;
      });
    });
    const entrees = Object.entries(compte);
    if (entrees.length === 0) return null;
    return entrees.sort((a, b) => b[1] - a[1])[0][0];
  })();

  return (
    <div className="px-6 py-6 md:py-8 max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">
        Mes commandes
      </h1>
      <p className="text-ink/50 text-sm mb-4">Vos 30 dernières commandes.</p>

      {commandes.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-ink/10 p-4">
            <p className="text-2xl font-display font-semibold text-brand">{commandes.length}</p>
            <p className="text-xs text-ink/60">Commandes enregistrées</p>
          </div>
          <div className="bg-white rounded-2xl border border-ink/10 p-4">
            <p className="text-sm font-display font-semibold text-ink truncate">{platFavori}</p>
            <p className="text-xs text-ink/60">Votre plat le plus commandé</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {commandes.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-ink/10 p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-ink">
                {c.lignes.map((l) => `${l.quantite}× ${l.plat.nom}`).join(", ")}
              </p>
              <p className="text-sm text-ink/50">
                {new Date(c.cree_le).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ml-3 ${
                c.statut === "livree"
                  ? "bg-sage/15 text-sage"
                  : c.statut === "annulee"
                  ? "bg-coral/10 text-coral"
                  : "bg-amber/15 text-amber-deep"
              }`}
            >
              {LIBELLES_STATUT[c.statut]}
            </span>
          </div>
        ))}

        {commandes.length === 0 && (
          <p className="text-ink/50 text-sm text-center py-10">
            Aucune commande pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}