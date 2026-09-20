import { useEffect, useState } from "react";
import api from "../../api";

const CATEGORIES = {
  qualite: "Qualité du plat",
  delai_livraison: "Délai de livraison",
  autre: "Autre",
};

export default function AdminAvis() {
  const [avis, setAvis] = useState([]);
  const [resume, setResume] = useState([]);

  useEffect(() => {
    api.get("/avis").then((res) => setAvis(res.data));
    api.get("/avis/resume").then((res) => setResume(res.data));
  }, []);

  return (
    <div className="px-6 py-6 md:py-8 max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Avis des employés</h1>
      <p className="text-ink/50 text-sm mb-6">
        Retours envoyés par les employés sur la qualité et le service.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {resume.map((r) => (
          <div key={r.categorie} className="bg-white rounded-2xl border border-ink/10 p-4">
            <p className="text-2xl font-display font-semibold text-amber-deep">
              {r.note_moyenne}/5
            </p>
            <p className="text-xs text-ink/60">{CATEGORIES[r.categorie]}</p>
            <p className="text-[11px] text-ink/40">{r.nombre_avis} avis</p>
          </div>
        ))}
        {resume.length === 0 && (
          <p className="text-ink/50 text-sm col-span-3">Pas encore d'avis reçus.</p>
        )}
      </div>

      <div className="space-y-2">
        {avis.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-ink/10 p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-ink">
                {a.employe.nom} · {a.employe.agence.nom}
              </p>
              <span className="text-amber-deep font-medium text-sm">{a.note}/5</span>
            </div>
            <p className="text-xs text-ink/50 mb-1">{CATEGORIES[a.categorie]}</p>
            {a.commentaire && <p className="text-ink/70 text-sm">{a.commentaire}</p>}
          </div>
        ))}
        {avis.length === 0 && (
          <p className="text-ink/50 text-sm text-center py-6">Aucun avis pour le moment.</p>
        )}
      </div>
    </div>
  );
}
