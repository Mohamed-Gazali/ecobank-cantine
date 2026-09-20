import { useEffect, useState } from "react";
import api from "../../api";

export default function AdminParametres() {
  const [heureOuverture, setHeureOuverture] = useState(8);
  const [heureFermeture, setHeureFermeture] = useState(11);
  const [confirmation, setConfirmation] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.get("/parametres").then((res) => {
      setHeureOuverture(res.data.heure_ouverture);
      setHeureFermeture(res.data.heure_fermeture);
    });
  }, []);

  const enregistrer = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      await api.put("/parametres", {
        heure_ouverture: parseInt(heureOuverture, 10),
        heure_fermeture: parseInt(heureFermeture, 10),
      });
      setConfirmation(true);
      setTimeout(() => setConfirmation(false), 3000);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="px-6 py-6 md:py-8 max-w-md">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Paramètres</h1>
      <p className="text-ink/50 text-sm mb-6">
        Réglez la fenêtre horaire d'ouverture des commandes, sans toucher au code.
      </p>

      <form onSubmit={enregistrer} className="bg-white rounded-2xl border border-ink/10 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Heure d'ouverture</label>
          <select
            value={heureOuverture}
            onChange={(e) => setHeureOuverture(e.target.value)}
            className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{h}h00</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Heure de fermeture</label>
          <select
            value={heureFermeture}
            onChange={(e) => setHeureFermeture(e.target.value)}
            className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{h}h00</option>
            ))}
          </select>
        </div>

        {confirmation && <p className="text-sage text-sm">Paramètres enregistrés.</p>}

        <button
          type="submit"
          disabled={envoi}
          className="w-full bg-ink text-paper font-medium rounded-xl py-3 disabled:opacity-60"
        >
          {envoi ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
