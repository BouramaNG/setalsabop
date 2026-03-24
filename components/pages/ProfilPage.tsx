"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Hash, Heart, Settings, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  user: { id: string; prenom: string; nom: string; tradition: string; genre: string; age: string; email: string };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface DreamEntry {
  id: string;
  texte: string;
  createdAt: string;
  interpretation: {
    title: string;
    summary: string;
    mainSymbols: string;
    islam: string;
    christianisme: string;
    psychologie: string;
    ancestral: string;
  } | null;
}

interface NumEntry {
  id: string;
  nomComplet: string;
  dateNaissance: string;
  cheminDeVie: number;
  nombreExpression: number;
  nombreAme: number;
  anneePersonnelle: number;
  rapport: string;
  createdAt: string;
}

interface CompatEntry {
  id: string;
  nomPersonne1: string;
  nomPersonne2: string;
  scoreTotal: number;
  rapport: string;
  createdAt: string;
}

const TRADITION_LABELS: Record<string, string> = {
  islam: "🕌 Islam", christianisme: "✝️ Christianisme",
  psychologie: "🧠 Psychologie", ancestral: "🌍 Ancestral",
};

const TABS = [
  { id: "journal",       label: "Journal des rêves", icon: <BookOpen size={15}/> },
  { id: "numerologie",   label: "Numérologie",        icon: <Hash size={15}/> },
  { id: "compatibilite", label: "Compatibilité",      icon: <Heart size={15}/> },
  { id: "infos",         label: "Mes infos",          icon: <Settings size={15}/> },
];

function fmt(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 75 ? "#00E5A0" : score >= 50 ? "#F4C842" : "#F87171";
  return (
    <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
      style={{ background: `${color}18`, border: `2px solid ${color}`, color }}>
      {score}
    </div>
  );
}

/* Carte rêve dépliable */
function DreamCard({ dream, onNavigate }: { dream: DreamEntry; onNavigate: (p: string) => void }) {
  const [open, setOpen] = useState(false);
  const interp = dream.interpretation;
  let symbols: string[] = [];
  try { symbols = JSON.parse(interp?.mainSymbols || "[]"); } catch {}

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
      style={{ border: open ? "1px solid rgba(244,200,66,0.2)" : "1px solid rgba(255,255,255,0.07)" }}>
      <button className="w-full p-4 text-left flex items-center justify-between gap-3"
        onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "rgba(244,200,66,0.08)", border: "1px solid rgba(244,200,66,0.15)" }}>
            🌙
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: "#F0EDF8" }}>
              {interp?.title || "Rêve sans interprétation"}
            </p>
            <p className="text-xs" style={{ color: "#6B5F8A" }}>{fmt(dream.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {symbols.slice(0, 2).map((s, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-lg hidden sm:block"
              style={{ background: "rgba(244,200,66,0.07)", color: "#C4A832", border: "1px solid rgba(244,200,66,0.12)" }}>
              {s}
            </span>
          ))}
          {open ? <ChevronUp size={16} style={{ color: "#6B5F8A" }} /> : <ChevronDown size={16} style={{ color: "#6B5F8A" }} />}
        </div>
      </button>

      <AnimatePresence>
        {open && interp && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}>
            <div className="px-4 pb-4 space-y-3">
              <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

              <p className="text-sm italic" style={{ color: "#9B8FC2", lineHeight: 1.7 }}>
                "{dream.texte.slice(0, 200)}{dream.texte.length > 200 ? "..." : ""}"
              </p>

              <p className="text-sm" style={{ color: "#9B8FC2", lineHeight: 1.7 }}>{interp.summary}</p>

              {/* Symboles */}
              {symbols.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {symbols.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-lg"
                      style={{ background: "rgba(244,200,66,0.07)", color: "#C4A832", border: "1px solid rgba(244,200,66,0.12)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Traditions */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "islam",        icon: "☪️", label: "Islam",          val: interp.islam },
                  { key: "christianisme",icon: "✝️", label: "Christianisme",  val: interp.christianisme },
                  { key: "psychologie",  icon: "🧠", label: "Psychologie",    val: interp.psychologie },
                  { key: "ancestral",    icon: "🌿", label: "Ancestral",      val: interp.ancestral },
                ].map(t => {
                  let text = t.val;
                  try { text = JSON.parse(t.val)?.text || t.val; } catch {}
                  return (
                    <div key={t.key} className="p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: "#9B8FC2" }}>{t.icon} {t.label}</p>
                      <p className="text-xs" style={{ color: "#6B5F8A", lineHeight: 1.5 }}>
                        {text?.slice(0, 120)}{text?.length > 120 ? "..." : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* Carte numérologie dépliable */
function NumCard({ entry }: { entry: NumEntry }) {
  const [open, setOpen] = useState(false);
  let rapport: Record<string, unknown> = {};
  try { rapport = JSON.parse(entry.rapport); } catch {}

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
      style={{ border: open ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
      <button className="w-full p-4 text-left flex items-center justify-between gap-3"
        onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
            🔢
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#F0EDF8" }}>{entry.nomComplet}</p>
            <p className="text-xs" style={{ color: "#6B5F8A" }}>{entry.dateNaissance} · {fmt(entry.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex gap-2">
            {[
              { label: "Chemin", val: entry.cheminDeVie },
              { label: "Expression", val: entry.nombreExpression },
              { label: "Âme", val: entry.nombreAme },
            ].map(n => (
              <div key={n.label} className="text-center px-2">
                <p className="font-bold text-base" style={{ color: "#A78BFA", fontFamily: "Sora" }}>{n.val}</p>
                <p className="text-xs" style={{ color: "#6B5F8A" }}>{n.label}</p>
              </div>
            ))}
          </div>
          {open ? <ChevronUp size={16} style={{ color: "#6B5F8A" }} /> : <ChevronDown size={16} style={{ color: "#6B5F8A" }} />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}>
            <div className="px-4 pb-4 space-y-3">
              <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

              {/* Nombres clés */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Chemin de Vie", val: entry.cheminDeVie, color: "#F4C842" },
                  { label: "Expression", val: entry.nombreExpression, color: "#A78BFA" },
                  { label: "Âme", val: entry.nombreAme, color: "#60A5FA" },
                  { label: "Année perso.", val: entry.anneePersonnelle, color: "#00E5A0" },
                ].map(n => (
                  <div key={n.label} className="p-3 rounded-xl text-center"
                    style={{ background: `${n.color}10`, border: `1px solid ${n.color}30` }}>
                    <p className="font-bold text-2xl" style={{ color: n.color, fontFamily: "Sora" }}>{n.val}</p>
                    <p className="text-xs mt-1" style={{ color: "#6B5F8A" }}>{n.label}</p>
                  </div>
                ))}
              </div>

              {/* Résumé du rapport */}
              {(rapport as Record<string, { resume?: string; titre?: string }>)?.profilPsychologique && (
                <div className="p-3 rounded-xl"
                  style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#A78BFA" }}>🧠 Profil psychologique</p>
                  <p className="text-sm" style={{ color: "#9B8FC2", lineHeight: 1.6 }}>
                    {((rapport as Record<string, { resume?: string }>)?.profilPsychologique?.resume || "").slice(0, 200)}...
                  </p>
                </div>
              )}
              {(rapport as Record<string, { texte?: string }>)?.conclusionInspiratrice && (
                <div className="p-3 rounded-xl"
                  style={{ background: "rgba(244,200,66,0.05)", border: "1px solid rgba(244,200,66,0.15)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#F4C842" }}>✨ Message clé</p>
                  <p className="text-sm" style={{ color: "#9B8FC2", lineHeight: 1.6 }}>
                    {((rapport as Record<string, { texte?: string }>)?.conclusionInspiratrice?.texte || "").slice(0, 200)}...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* Carte compatibilité dépliable */
function CompatCard({ entry }: { entry: CompatEntry }) {
  const [open, setOpen] = useState(false);
  let r: Record<string, any> = {};
  try { r = JSON.parse(entry.rapport); } catch {}
  const color = entry.scoreTotal >= 75 ? "#00E5A0" : entry.scoreTotal >= 50 ? "#F4C842" : "#F87171";

  const dims = r.dimensions ? Object.entries(r.dimensions as Record<string, { score: number; description: string }>) : [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
      style={{ border: open ? `1px solid ${color}44` : "1px solid rgba(255,255,255,0.07)" }}>

      <button className="w-full p-4 text-left flex items-center justify-between gap-3" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <ScoreCircle score={entry.scoreTotal} />
          <div>
            <p className="font-semibold text-sm" style={{ color: "#F0EDF8" }}>
              {entry.nomPersonne1} & {entry.nomPersonne2}
            </p>
            {r.titre && <p className="text-xs italic" style={{ color }}>{r.titre}</p>}
            <p className="text-xs mt-0.5" style={{ color: "#6B5F8A" }}>{fmt(entry.createdAt)}</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} style={{ color: "#6B5F8A" }} /> : <ChevronDown size={16} style={{ color: "#6B5F8A" }} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}>
            <div className="px-4 pb-4 space-y-4">
              <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

              {/* Niveau + résumé */}
              {r.niveau && (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{ background: `${color}20`, color, border: `1px solid ${color}44` }}>
                    {r.niveau}
                  </span>
                </div>
              )}
              {r.resume && (
                <p className="text-sm leading-relaxed" style={{ color: "#C4B8E0" }}>{r.resume}</p>
              )}

              {/* Dimensions */}
              {dims.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6B5F8A" }}>Dimensions</p>
                  {dims.map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium capitalize" style={{ color: "#9B8FC2" }}>{key}</span>
                        <span className="text-sm font-bold" style={{ color }}>{val.score}%</span>
                      </div>
                      <div className="h-1.5 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${val.score}%`, background: color }} />
                      </div>
                      {val.description && (
                        <p className="text-xs leading-relaxed" style={{ color: "#9B8FC2" }}>{val.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Forces */}
              {Array.isArray(r.forcesUnion) && r.forcesUnion.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B5F8A" }}>✨ Forces de l'union</p>
                  <ul className="space-y-1">
                    {r.forcesUnion.map((f: string, i: number) => (
                      <li key={i} className="text-xs flex items-start gap-2" style={{ color: "#9B8FC2" }}>
                        <span style={{ color: "#00E5A0", flexShrink: 0 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Défis */}
              {Array.isArray(r.defisUnion) && r.defisUnion.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B5F8A" }}>⚠️ Défis à surmonter</p>
                  <ul className="space-y-1">
                    {r.defisUnion.map((d: string, i: number) => (
                      <li key={i} className="text-xs flex items-start gap-2" style={{ color: "#9B8FC2" }}>
                        <span style={{ color: "#F4C842", flexShrink: 0 }}>•</span>{d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conseils spirituels */}
              {Array.isArray(r.conseilsSpirituels) && r.conseilsSpirituels.length > 0 && (
                <div className="p-3 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}22` }}>
                  <p className="text-xs font-semibold mb-2" style={{ color }}>🕌 Conseils spirituels</p>
                  <ul className="space-y-1">
                    {r.conseilsSpirituels.map((c: string, i: number) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: "#9B8FC2" }}>— {c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Avertissement */}
              {r.avertissement && (
                <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#F87171" }}>⚡ Point de vigilance</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#9B8FC2" }}>{r.avertissement}</p>
                </div>
              )}

              {/* Conclusion */}
              {r.conclusion && (
                <p className="text-xs italic leading-relaxed text-center" style={{ color: "#6B5F8A" }}>"{r.conclusion}"</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProfilPage({ user, onNavigate, onLogout }: Props) {
  const [tab, setTab] = useState("journal");
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [numerologies, setNumerologies] = useState<NumEntry[]>([]);
  const [compatibilites, setCompatibilites] = useState<CompatEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/historique?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        setDreams(data.dreams || []);
        setNumerologies(data.numerologies || []);
        setCompatibilites(data.compatibilites || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="above-stars min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-24">

        {/* Header profil */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#F4C842,#E8A020)", color: "#0D0B2B", fontFamily: "Sora" }}>
            {user.prenom?.[0]}{user.nom?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>
              {user.prenom} {user.nom}
            </h1>
            <p className="text-sm" style={{ color: "#9B8FC2" }}>{user.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="badge-gold text-xs">{TRADITION_LABELS[user.tradition] || user.tradition}</span>
              {user.genre && <span className="badge-verified text-xs">{user.genre}</span>}
              {user.age && <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "#6B5F8A" }}>{user.age} ans</span>}
            </div>
          </div>

          {/* Stats rapides */}
          {!loading && (
            <div className="hidden sm:flex gap-4 flex-shrink-0">
              {[
                { icon: "🌙", val: dreams.length, label: "Rêves" },
                { icon: "🔢", val: numerologies.length, label: "Numérologies" },
                { icon: "💞", val: compatibilites.length, label: "Compatibilités" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="font-bold text-xl" style={{ color: "#F4C842", fontFamily: "Sora" }}>{s.val}</p>
                  <p className="text-xs" style={{ color: "#6B5F8A" }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          <button onClick={onLogout} className="btn-ghost text-sm flex-shrink-0" style={{ padding: "8px 14px" }}>
            Déconnexion
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-shrink-0 transition-all"
              style={{
                background: tab === t.id ? "rgba(244,200,66,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${tab === t.id ? "rgba(244,200,66,0.4)" : "rgba(255,255,255,0.07)"}`,
                color: tab === t.id ? "#F4C842" : "#9B8FC2",
              }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── JOURNAL ── */}
          {tab === "journal" && (
            <motion.div key="journal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>
                  🌙 Mes rêves ({dreams.length})
                </h2>
                <button onClick={() => onNavigate("dream")} className="btn-gold" style={{ padding: "8px 16px", fontSize: "13px" }}>
                  + Nouveau rêve
                </button>
              </div>
              {loading ? (
                <div className="text-center py-16" style={{ color: "#6B5F8A" }}>Chargement...</div>
              ) : dreams.length === 0 ? (
                <div className="text-center py-16 glass-card">
                  <div className="text-5xl mb-3">🌙</div>
                  <p className="mb-4" style={{ color: "#9B8FC2" }}>Aucun rêve enregistré pour l'instant.</p>
                  <button onClick={() => onNavigate("dream")} className="btn-gold">✨ Interpréter mon premier rêve</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dreams.map(d => <DreamCard key={d.id} dream={d} onNavigate={onNavigate} />)}
                </div>
              )}
            </motion.div>
          )}

          {/* ── NUMÉROLOGIE ── */}
          {tab === "numerologie" && (
            <motion.div key="numerologie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>
                  🔢 Mes analyses ({numerologies.length})
                </h2>
                <button onClick={() => onNavigate("numerologie")} className="btn-gold" style={{ padding: "8px 16px", fontSize: "13px" }}>
                  + Nouvelle analyse
                </button>
              </div>
              {loading ? (
                <div className="text-center py-16" style={{ color: "#6B5F8A" }}>Chargement...</div>
              ) : numerologies.length === 0 ? (
                <div className="text-center py-16 glass-card">
                  <div className="text-5xl mb-3">🔢</div>
                  <p className="mb-4" style={{ color: "#9B8FC2" }}>Aucune analyse numérologique.</p>
                  <button onClick={() => onNavigate("numerologie")} className="btn-gold">Lancer une analyse</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {numerologies.map(n => <NumCard key={n.id} entry={n} />)}
                </div>
              )}
            </motion.div>
          )}

          {/* ── COMPATIBILITÉ ── */}
          {tab === "compatibilite" && (
            <motion.div key="compatibilite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>
                  💞 Mes compatibilités ({compatibilites.length})
                </h2>
                <button onClick={() => onNavigate("compatibilite")} className="btn-gold" style={{ padding: "8px 16px", fontSize: "13px" }}>
                  + Nouveau test
                </button>
              </div>
              {loading ? (
                <div className="text-center py-16" style={{ color: "#6B5F8A" }}>Chargement...</div>
              ) : compatibilites.length === 0 ? (
                <div className="text-center py-16 glass-card">
                  <div className="text-5xl mb-3">💞</div>
                  <p className="mb-4" style={{ color: "#9B8FC2" }}>Aucun test de compatibilité.</p>
                  <button onClick={() => onNavigate("compatibilite")} className="btn-gold">Tester une compatibilité</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {compatibilites.map(c => <CompatCard key={c.id} entry={c} />)}
                </div>
              )}
            </motion.div>
          )}

          {/* ── INFOS ── */}
          {tab === "infos" && (
            <motion.div key="infos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-6 space-y-4">
              <h2 className="font-semibold" style={{ color: "#F0EDF8", fontFamily: "Sora" }}>Mes informations</h2>
              {[
                { label: "Prénom",    value: user.prenom },
                { label: "Nom",       value: user.nom },
                { label: "Email",     value: user.email },
                { label: "Tradition", value: TRADITION_LABELS[user.tradition] || user.tradition },
                { label: "Genre",     value: user.genre },
                { label: "Âge",       value: user.age ? `${user.age} ans` : "—" },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-sm" style={{ color: "#6B5F8A" }}>{item.label}</span>
                  <span className="text-sm" style={{ color: "#F0EDF8" }}>{item.value || "—"}</span>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
