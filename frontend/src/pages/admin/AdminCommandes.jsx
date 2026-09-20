import { useEffect, useMemo, useState } from "react";
import api from "../../api";

const LIBELLES_STATUT = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  livree: "Livrée",
  annulee: "Annulée",
};

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [resume, setResume] = useState([]);
  const [agences, setAgences] = useState([]);
  const [agenceFiltre, setAgenceFiltre] = useState("");

  const charger = () => {
    const params = agenceFiltre ? { agence_id: agenceFiltre } : {};
    api
      .get("/dashboard/commandes", { params })
      .then((res) => setCommandes(res.data));
    api.get("/dashboard/resume").then((res) => setResume(res.data));
  };

  useEffect(() => {
    api.get("/agences").then((res) => setAgences(res.data));
  }, []);

  useEffect(() => {
    charger();
    const intervalle = setInterval(charger, 20000);
    return () => clearInterval(intervalle);
  }, [agenceFiltre]);

  const commandesParAgence = useMemo(() => {
    const groupes = {};
    for (const c of commandes) {
      const nomAgence = c.employe.agence.nom;
      if (!groupes[nomAgence]) groupes[nomAgence] = [];
      groupes[nomAgence].push(c);
    }
    return groupes;
  }, [commandes]);

  const changerStatut = async (id, statut) => {
    await api.patch(`/dashboard/commandes/${id}/statut`, { statut });
    charger();
  };

  return (
    <div>
      <header className="px-6 pt-6 md:pt-8 pb-4">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Commandes du jour
        </h1>
        <p className="text-ink/50 text-sm">{commandes.length} commande(s)</p>
      </header>

      <section className="px-6 mb-6">
        <h2 className="font-display font-semibold text-ink mb-3">
          Résumé cuisine
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {resume.map((r) => (
            <div
              key={r.plat_nom}
              className="bg-white rounded-2xl border border-ink/10 p-4"
            >
              <p className="text-2xl font-display font-semibold text-amber-deep">
                {r.quantite_totale}
              </p>
              <p className="text-sm text-ink/60">{r.plat_nom}</p>
            </div>
          ))}
          {resume.length === 0 && (
            <p className="text-ink/50 text-sm col-span-2">
              Aucune commande pour le moment.
            </p>
          )}
        </div>
      </section>

      <section className="px-6 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setAgenceFiltre("")}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border ${
              agenceFiltre === ""
                ? "bg-ink text-paper border-ink"
                : "border-ink/15 text-ink/60"
            }`}
          >
            Toutes les agences
          </button>
          {agences.map((a) => (
            <button
              key={a.id}
              onClick={() => setAgenceFiltre(a.id)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border ${
                agenceFiltre === a.id
                  ? "bg-ink text-paper border-ink"
                  : "border-ink/15 text-ink/60"
              }`}
            >
              {a.nom}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 pb-10 space-y-6">
        {Object.entries(commandesParAgence).map(([nomAgence, liste]) => (
          <div key={nomAgence}>
            <h3 className="text-sm font-medium text-ink/50 uppercase tracking-wide mb-2">
              {nomAgence} · {liste.length}
            </h3>
            <div className="space-y-2">
              {liste.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-ink/10 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-ink">{c.employe.nom}</p>
                      <p className="text-sm text-ink/60">{c.employe.numero}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                        c.statut === "livree"
                          ? "bg-sage/15 text-sage"
                          : c.statut === "annulee"
                            ? "bg-coral/10 text-coral"
                            : c.statut === "confirmee"
                              ? "bg-brand/10 text-brand"
                              : "bg-amber/15 text-amber-deep"
                      }`}
                    >
                      {LIBELLES_STATUT[c.statut]}
                    </span>
                  </div>

                  <div className="text-sm text-ink/70 mb-3">
                    {c.lignes
                      .map((l) => `${l.quantite}× ${l.plat.nom}`)
                      .join(", ")}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => changerStatut(c.id, "confirmee")}
                      disabled={c.statut === "confirmee"}
                      className="text-xs font-medium bg-brand/10 text-brand px-3 py-1.5 rounded-full disabled:opacity-40"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => changerStatut(c.id, "livree")}
                      disabled={c.statut === "livree"}
                      className="text-xs font-medium bg-sage/15 text-sage px-3 py-1.5 rounded-full disabled:opacity-40"
                    >
                      Marquer livrée
                    </button>
                    <button
                      onClick={() => changerStatut(c.id, "annulee")}
                      disabled={c.statut === "annulee"}
                      className="text-xs font-medium bg-coral/10 text-coral px-3 py-1.5 rounded-full disabled:opacity-40"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {commandes.length === 0 && (
          <p className="text-ink/50 text-sm text-center py-10">
            Aucune commande enregistrée aujourd'hui.
          </p>
        )}
      </section>
    </div>
  );
}
