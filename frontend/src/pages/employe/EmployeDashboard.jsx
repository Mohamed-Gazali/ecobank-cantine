import { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import BandeauFenetre from "../../components/BandeauFenetre";

const LIBELLES_STATUT = {
  en_attente: "En attente de confirmation",
  confirmee: "Confirmée par le restaurant",
  livree: "Livrée",
  annulee: "Annulée",
};

const STYLES_STATUT = {
  en_attente: "bg-amber/15 text-amber-deep",
  confirmee: "bg-brand/10 text-brand",
  livree: "bg-sage/15 text-sage",
  annulee: "bg-coral/10 text-coral",
};

export default function EmployeDashboard() {
  const { employe } = useAuth();
  const [plats, setPlats] = useState([]);
  const [quantites, setQuantites] = useState({}); // { plat_id: quantite }
  const [commandeDuJour, setCommandeDuJour] = useState(null);
  const [fenetreOuverte, setFenetreOuverte] = useState(true);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const chargerCommandes = () => {
    api.get("/commandes/mes-commandes").then((res) => {
      const auj = res.data.find((c) => {
        const date = new Date(c.cree_le);
        const maintenant = new Date();
        return date.toDateString() === maintenant.toDateString() && c.statut !== "annulee";
      });
      setCommandeDuJour(auj || null);
    });
  };

  useEffect(() => {
    api.get("/menu-jour/aujourdhui").then((res) => setPlats(res.data));
    chargerCommandes();
    // Resynchronise le statut de la commande régulièrement (le restaurant
    // peut la confirmer / livrer pendant que l'employé a l'app ouverte)
    const intervalle = setInterval(chargerCommandes, 20000);
    return () => clearInterval(intervalle);
  }, []);

  const basculerPlat = (platId) => {
    setQuantites((prev) => {
      const copie = { ...prev };
      if (copie[platId]) {
        delete copie[platId];
      } else {
        copie[platId] = 1;
      }
      return copie;
    });
  };

  const changerQuantite = (platId, delta) => {
    setQuantites((prev) => {
      const actuelle = prev[platId] || 1;
      const nouvelle = Math.max(1, Math.min(10, actuelle + delta));
      return { ...prev, [platId]: nouvelle };
    });
  };

  const platsChoisis = Object.keys(quantites);
  const total = platsChoisis.reduce((somme, id) => {
    const plat = plats.find((p) => p.id === id);
    return somme + (plat ? plat.prix * quantites[id] : 0);
  }, 0);

  const commander = async () => {
    if (platsChoisis.length === 0) return;
    setErreur("");
    setEnvoi(true);
    try {
      await api.post("/commandes", {
        lignes: platsChoisis.map((plat_id) => ({ plat_id, quantite: quantites[plat_id] })),
      });
      setQuantites({});
      chargerCommandes();
    } catch (err) {
      setErreur(err.response?.data?.detail || "Impossible de passer la commande");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="pb-28">
      <header className="px-6 pt-6 md:pt-8 pb-4">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Bonjour {employe?.nom?.split(" ")[0]}
        </h1>
        <p className="text-ink/50 text-sm">{employe?.agence?.nom}</p>
      </header>

      <div className="px-6 mb-6">
        <BandeauFenetre onStatut={setFenetreOuverte} />
      </div>

      {commandeDuJour ? (
        <div className="px-6">
          <div className="ticket-edge bg-white rounded-ticket border border-ink/10 p-6 shadow-sm max-w-md">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wide text-ink/40 font-medium">
                Votre commande
              </p>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${STYLES_STATUT[commandeDuJour.statut]}`}
              >
                {LIBELLES_STATUT[commandeDuJour.statut]}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {commandeDuJour.lignes.map((ligne) => (
                <div key={ligne.id} className="flex justify-between text-sm">
                  <span className="text-ink">
                    {ligne.quantite} × {ligne.plat.nom}
                  </span>
                  <span className="text-ink/50">{ligne.plat.prix * ligne.quantite} F</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-ink/15 pt-4 flex justify-between text-sm text-ink/50">
              <span>{employe?.agence?.nom}</span>
              <span>Livraison à partir de 13h</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 space-y-3 max-w-md">
          {plats.map((plat) => {
            const choisi = Boolean(quantites[plat.id]);
            return (
              <div
                key={plat.id}
                className={`rounded-2xl border p-4 transition-colors ${
                  choisi ? "border-amber bg-amber/10" : "border-ink/10 bg-white"
                } ${!fenetreOuverte ? "opacity-50" : ""}`}
              >
                <button
                  onClick={() => fenetreOuverte && basculerPlat(plat.id)}
                  disabled={!fenetreOuverte}
                  className="w-full text-left flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-display font-semibold text-ink">{plat.nom}</h3>
                    {plat.description && (
                      <p className="text-ink/50 text-sm mt-0.5">{plat.description}</p>
                    )}
                  </div>
                  <span className="font-medium text-ink whitespace-nowrap ml-3">
                    {plat.prix} F
                  </span>
                </button>

                {choisi && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-ink/10">
                    <span className="text-sm text-ink/60">Quantité</span>
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => changerQuantite(plat.id, -1)}
                        className="w-8 h-8 rounded-full bg-white border border-ink/15 text-ink font-medium"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-medium text-ink">
                        {quantites[plat.id]}
                      </span>
                      <button
                        onClick={() => changerQuantite(plat.id, 1)}
                        className="w-8 h-8 rounded-full bg-white border border-ink/15 text-ink font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {plats.length === 0 && (
            <p className="text-ink/50 text-sm text-center py-10">
              Aucun plat au menu pour le moment. Revenez plus tard.
            </p>
          )}
        </div>
      )}

      {erreur && <p className="text-coral text-sm text-center mt-4 px-6">{erreur}</p>}

      {!commandeDuJour && fenetreOuverte && plats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-paper border-t border-ink/10 px-6 py-4">
          <button
            onClick={commander}
            disabled={platsChoisis.length === 0 || envoi}
            className="w-full max-w-md bg-ink text-paper font-medium rounded-xl py-3.5 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {envoi
              ? "Envoi..."
              : platsChoisis.length > 0
              ? `Confirmer ma commande · ${total} F`
              : "Choisissez au moins un plat"}
          </button>
        </div>
      )}
    </div>
  );
}