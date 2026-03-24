"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronDown, ChevronUp, Sparkles, Shield, Star } from "lucide-react";

interface Props {
  user: { id?: string; prenom: string; nom: string } | null;
  onNavigate: (page: string) => void;
  onAnalysisDone?: () => void;
  embedded?: boolean;
}

const SYSTEMES = [
  { id: "occidental", label: "Occidental (Pythagore)" },
  { id: "oriental",  label: "Oriental (Chaldéen)" },
  { id: "abjad",     label: "Abjad (Islamique)" },
];

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? "#00E5A0" : score >= 60 ? "#F4C842" : score >= 40 ? "#FB923C" : "#EF4444";
  return (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 314} 314`}
          style={{ transition: "stroke-dasharray 1s ease" }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color, fontFamily: "Sora, sans-serif" }}>{score}</span>
        <span className="text-xs" style={{ color: "#6B5F8A" }}>/ 100</span>
      </div>
    </div>
  );
}

export default function CompatibilitePage({ user, onNavigate, onAnalysisDone, embedded }: Props) {
  const [form, setForm] = useState({
    nomPersonne1: "", nomMere1: "", dateNaissance1: "",
    nomPersonne2: "", nomMere2: "", dateNaissance2: "",
    systeme: "occidental",
  });
  const [loading, setLoading] = useState(false);
  const [rapport, setRapport] = useState<any>(null);
  const [erreur, setErreur] = useState("");
  const [expanded, setExpanded] = useState<string | null>("spirituelle");
  const [progress, setProgress] = useState(0);

  function update(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function analyser() {
    if (!form.nomPersonne1 || !form.nomMere1 || !form.nomPersonne2 || !form.nomMere2) {
      setErreur("Noms complets et noms des mères requis pour les deux personnes.");
      return;
    }
    setErreur("");
    setLoading(true);
    setRapport(null);
    setProgress(0);

    const interval = setInterval(() => setProgress(p => Math.min(p + 7, 90)), 400);

    try {
      const res = await fetch("/api/compatibilite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user?.id ?? null }),
      });
      const data = await res.json();
      if (res.status === 401) { onNavigate("onboarding"); return; }
      if (res.status === 402) { onNavigate("tarifs"); return; }
      if (!res.ok) throw new Error(data.error);
      setProgress(100);
      setRapport(data);
      onAnalysisDone?.();
    } catch {
      setErreur("Erreur lors de l'analyse. Réessaie.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  const r = rapport?.rapport;

  return (
    <div className={`above-stars ${embedded ? "" : "min-h-screen pt-28"} pb-20`}>
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <Heart size={30} style={{ color: "#F87171" }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
            Compatibilité <span style={{ color: "#F87171" }}>Mystique</span>
          </h1>
          <p style={{ color: "#9B8FC2" }}>Analyse spirituelle profonde de l'harmonie entre deux personnes selon le calcul Abjad et les traditions africaines</p>
        </motion.div>

        {!rapport && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Personne 1 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm" style={{ color: "#00E5A0", fontFamily: "Sora, sans-serif" }}>
                  👤 Première personne
                </h3>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#6B5F8A" }}>Nom complet *</label>
                  <input type="text" value={form.nomPersonne1} onChange={e => update("nomPersonne1", e.target.value)}
                    placeholder="Prénom et Nom" className="dream-input" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#6B5F8A" }}>Nom complet de la mère *</label>
                  <input type="text" value={form.nomMere1} onChange={e => update("nomMere1", e.target.value)}
                    placeholder="Prénom et Nom de la mère" className="dream-input" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#6B5F8A" }}>Date de naissance <span style={{ color: "#6B5F8A" }}>(optionnel)</span></label>
                  <input type="date" value={form.dateNaissance1} onChange={e => update("dateNaissance1", e.target.value)}
                    className="dream-input" style={{ colorScheme: "dark" }} />
                </div>
              </div>

              {/* Personne 2 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm" style={{ color: "#F87171", fontFamily: "Sora, sans-serif" }}>
                  👤 Deuxième personne
                </h3>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#6B5F8A" }}>Nom complet *</label>
                  <input type="text" value={form.nomPersonne2} onChange={e => update("nomPersonne2", e.target.value)}
                    placeholder="Prénom et Nom" className="dream-input" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#6B5F8A" }}>Nom complet de la mère *</label>
                  <input type="text" value={form.nomMere2} onChange={e => update("nomMere2", e.target.value)}
                    placeholder="Prénom et Nom de la mère" className="dream-input" />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "#6B5F8A" }}>Date de naissance <span style={{ color: "#6B5F8A" }}>(optionnel)</span></label>
                  <input type="date" value={form.dateNaissance2} onChange={e => update("dateNaissance2", e.target.value)}
                    className="dream-input" style={{ colorScheme: "dark" }} />
                </div>
              </div>
            </div>

            {/* Système */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-3" style={{ color: "#9B8FC2" }}>Système de calcul</label>
              <div className="flex gap-3 flex-wrap">
                {SYSTEMES.map(s => (
                  <button key={s.id} onClick={() => update("systeme", s.id)}
                    className="px-4 py-2 rounded-xl text-sm transition-all"
                    style={{
                      background: form.systeme === s.id ? "rgba(244,200,66,0.1)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${form.systeme === s.id ? "rgba(244,200,66,0.5)" : "rgba(255,255,255,0.07)"}`,
                      color: form.systeme === s.id ? "#F4C842" : "#9B8FC2",
                    }}>{s.label}</button>
                ))}
              </div>
            </div>

            {erreur && (
              <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
                ⚠️ {erreur}
              </div>
            )}

            <button onClick={analyser} disabled={loading} className="btn-gold w-full mt-6">
              <Heart size={18} />
              {loading ? "Analyse en cours..." : "Calculer la compatibilité"}
            </button>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center mb-6">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center glow-pulse"
              style={{ background: "linear-gradient(135deg, #F87171, #EF4444)" }}>
              <Heart size={28} style={{ color: "#fff" }} />
            </div>
            <p className="font-semibold mb-4" style={{ color: "#F0EDF8", fontFamily: "Sora, sans-serif" }}>Calcul en cours...</p>
            <div className="w-full rounded-full h-2 mb-2" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #F87171, #EF4444)" }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "#6B5F8A" }}>
              {progress < 40 ? "Calcul des poids mystiques Abjad..." : progress < 70 ? "Analyse de l'harmonie vibratoire..." : "Génération du rapport..."}
            </p>
          </motion.div>
        )}

        {/* Résultats */}
        {r && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Score */}
            <div className="glass-card-strong p-6 text-center">
              <ScoreCircle score={r.scoreTotal} />
              <div className="text-sm font-semibold mb-1" style={{
                color: r.scoreTotal >= 80 ? "#00E5A0" : r.scoreTotal >= 60 ? "#F4C842" : "#FB923C"
              }}>{r.niveau}</div>
              <h2 className="text-xl font-bold mb-2 text-gradient-gold" style={{ fontFamily: "Sora, sans-serif" }}>{r.titre}</h2>
              <p className="text-sm" style={{ color: "#9B8FC2" }}>{r.resume}</p>
            </div>

            {/* Poids mystique union */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ background: "rgba(244,200,66,0.15)", color: "#F4C842", fontFamily: "Sora" }}>
                  {rapport.poidsUnion}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#F4C842" }}>Poids mystique de l'union (Abjad)</p>
                  <p className="text-xs" style={{ color: "#6B5F8A" }}>Calculé à partir des noms et noms de mères</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: "#9B8FC2" }}>{r.significationPoidsUnion}</p>
            </div>

            {/* Dimensions */}
            {[
              { key: "spirituelle", icon: <Sparkles size={18}/>, label: "Compatibilité Spirituelle", color: "#C084FC" },
              { key: "emotionnelle", icon: <Heart size={18}/>, label: "Harmonie Émotionnelle", color: "#F87171" },
              { key: "materielle", icon: <Shield size={18}/>, label: "Compatibilité Matérielle", color: "#00E5A0" },
              { key: "physique", icon: <Star size={18}/>, label: "Énergie Physique", color: "#FB923C" },
            ].map(dim => {
              const data = r.dimensions?.[dim.key];
              if (!data) return null;
              const isOpen = expanded === dim.key;
              return (
                <div key={dim.key} className="glass-card overflow-hidden">
                  <button onClick={() => setExpanded(isOpen ? null : dim.key)}
                    className="w-full p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${dim.color}22`, color: dim.color }}>
                        {dim.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm" style={{ color: "#F0EDF8" }}>{dim.label}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-20 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${data.score}%`, background: dim.color }} />
                          </div>
                          <span className="text-xs" style={{ color: dim.color }}>{data.score}%</span>
                        </div>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={18} style={{ color: "#6B5F8A" }} /> : <ChevronDown size={18} style={{ color: "#6B5F8A" }} />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <p className="text-sm leading-relaxed mt-4" style={{ color: "#9B8FC2" }}>{data.description}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Forces et défis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <p className="font-semibold text-sm mb-3" style={{ color: "#00E5A0" }}>✨ Forces de l'union</p>
                <ul className="space-y-2">
                  {r.forcesUnion?.map((f: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: "#9B8FC2" }}>
                      <span style={{ color: "#00E5A0" }}>+</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-5">
                <p className="font-semibold text-sm mb-3" style={{ color: "#FB923C" }}>⚡ Défis à surmonter</p>
                <ul className="space-y-2">
                  {r.defisUnion?.map((d: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: "#9B8FC2" }}>
                      <span style={{ color: "#FB923C" }}>!</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Conseils spirituels */}
            {r.conseilsSpirituels && (
              <div className="glass-card p-5">
                <p className="font-semibold text-sm mb-3" style={{ color: "#C084FC" }}>🌙 Conseils spirituels</p>
                <ul className="space-y-2">
                  {r.conseilsSpirituels.map((c: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: "#9B8FC2" }}>
                      <span style={{ color: "#C084FC" }}>→</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conclusion */}
            {r.conclusion && (
              <div className="glass-card p-5 text-center">
                <p className="text-sm italic" style={{ color: "#F4C842" }}>"{r.conclusion}"</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setRapport(null); setProgress(0); }} className="btn-ghost flex-1">
                Nouvelle analyse
              </button>
              <button onClick={() => onNavigate("numerologie")} className="btn-gold flex-1">
                Voir numérologie
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
