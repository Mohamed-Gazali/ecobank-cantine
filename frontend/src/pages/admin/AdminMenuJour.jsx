import { useEffect, useState } from "react";
import api from "../../api";

const JOURS_SEMAINE = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

function formatDateLocale(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" });
}

function dateDuJour() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminMenuJour() {
  const [dateSelectionnee, setDateSelectionnee] = useState(dateDuJour());
  const [catalogue, setCatalogue] = useState([]);
  const [menuDuJour, setMenuDuJour] = useState([]);
  const [platAAjouter, setPlatAAjouter] = useState("");
  const [nouveauPlat, setNouveauPlat] = useState({ nom: "", description: "", prix: "" });
  const [erreur, setErreur] = useState("");

  const chargerMenu = () => {
    api.get("/menu-jour", { params: { date: dateSelectionnee } }).then((res) => setMenuDuJour(res.data));
  };

  const chargerCatalogue = () => {
    api.get("/plats", { params: { disponibles_uniquement: false } }).then((res) => setCatalogue(res.data));
  };

  useEffect(() => {
    chargerCatalogue();
  }, []);

  useEffect(() => {
    chargerMenu();
  }, [dateSelectionnee]);

  const ajouterAuMenu = async () => {
    if (!platAAjouter) return;
    setErreur("");
    try {
      await api.post("/menu-jour", { date: dateSelectionnee, plat_id: platAAjouter });
      setPlatAAjouter("");
      chargerMenu();
    } catch (err) {
      setErreur(err.response?.data?.detail || "Impossible d'ajouter ce plat");
    }
  };

  const retirerDuMenu = async (id) => {
    await api.delete(`/menu-jour/${id}`);
    chargerMenu();
  };

  const creerPlat = async (e) => {
    e.preventDefault();
    if (!nouveauPlat.nom || !nouveauPlat.prix) return;
    await api.post("/plats", {
      nom: nouveauPlat.nom,
      description: nouveauPlat.description || null,
      prix: parseInt(nouveauPlat.prix, 10),
    });
    setNouveauPlat({ nom: "", description: "", prix: "" });
    chargerCatalogue();
  };

  const idsAuMenu = new Set(menuDuJour.map((m) => m.plat.id));
  const platsDisponiblesAjout = catalogue.filter((p) => !idsAuMenu.has(p.id));

  return (
    <div className="px-6 py-6 md:py-8 max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Plat du jour</h1>
      <p className="text-ink/50 text-sm mb-6">
        Le restaurant travaille du lundi au vendredi. Choisissez le jour, puis les plats à
        proposer aux employés ce jour-là.
      </p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {[0, 1, 2, 3, 4].map((decalage) => {
          const d = new Date();
          const jourActuel = d.getDay(); // 0 = dimanche
          const lundiSemaine = new Date(d);
          lundiSemaine.setDate(d.getDate() - ((jourActuel + 6) % 7) + decalage);
          const iso = lundiSemaine.toISOString().slice(0, 10);
          return (
            <button
              key={iso}
              onClick={() => setDateSelectionnee(iso)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border ${
                dateSelectionnee === iso
                  ? "bg-ink text-paper border-ink"
                  : "border-ink/15 text-ink/60"
              }`}
            >
              {JOURS_SEMAINE[decalage]}
            </button>
          );
        })}
        <input
          type="date"
          value={dateSelectionnee}
          onChange={(e) => setDateSelectionnee(e.target.value)}
          className="px-3 py-1.5 rounded-full text-sm border border-ink/15 text-ink/60"
        />
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 p-5 mb-6">
        <h2 className="font-display font-semibold text-ink mb-1">
          Menu du {formatDateLocale(dateSelectionnee)}
        </h2>
        <div className="space-y-2 mt-3">
          {menuDuJour.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between bg-paper rounded-xl px-4 py-2.5"
            >
              <div>
                <p className="font-medium text-ink text-sm">{m.plat.nom}</p>
                <p className="text-xs text-ink/50">{m.plat.prix} FCFA</p>
              </div>
              <button
                onClick={() => retirerDuMenu(m.id)}
                className="text-coral text-xs font-medium"
              >
                Retirer
              </button>
            </div>
          ))}
          {menuDuJour.length === 0 && (
            <p className="text-ink/50 text-sm">Aucun plat au menu pour ce jour.</p>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <select
            value={platAAjouter}
            onChange={(e) => setPlatAAjouter(e.target.value)}
            className="flex-1 rounded-xl border border-ink/15 px-3 py-2 bg-white text-sm"
          >
            <option value="">Choisir un plat du catalogue...</option>
            {platsDisponiblesAjout.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom} — {p.prix} FCFA
              </option>
            ))}
          </select>
          <button
            onClick={ajouterAuMenu}
            disabled={!platAAjouter}
            className="bg-ink text-paper text-sm font-medium rounded-xl px-4 disabled:opacity-40"
          >
            Ajouter
          </button>
        </div>
        {erreur && <p className="text-coral text-sm mt-2">{erreur}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 p-5">
        <h2 className="font-display font-semibold text-ink mb-3">
          Ajouter un nouveau plat au catalogue
        </h2>
        <form onSubmit={creerPlat} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nom du plat"
            value={nouveauPlat.nom}
            onChange={(e) => setNouveauPlat({ ...nouveauPlat, nom: e.target.value })}
            className="rounded-xl border border-ink/15 px-3 py-2 text-sm sm:col-span-2"
            required
          />
          <input
            type="text"
            placeholder="Description (facultatif)"
            value={nouveauPlat.description}
            onChange={(e) => setNouveauPlat({ ...nouveauPlat, description: e.target.value })}
            className="rounded-xl border border-ink/15 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            type="number"
            placeholder="Prix (FCFA)"
            value={nouveauPlat.prix}
            onChange={(e) => setNouveauPlat({ ...nouveauPlat, prix: e.target.value })}
            className="rounded-xl border border-ink/15 px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            className="bg-amber text-ink text-sm font-medium rounded-xl px-4 py-2"
          >
            Ajouter au catalogue
          </button>
        </form>
      </div>
    </div>
  );
}
