"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Star, Calendar, ChevronDown, ChevronUp, Sparkles, BookOpen, Shield, Heart, Briefcase, Users, Brain, CheckCircle, AlertTriangle } from "lucide-react";

interface Props {
  user: { id?: string; prenom: string; nom: string; tradition: string } | null;
  onNavigate: (page: string) => void;
  onAnalysisDone?: () => void;
  embedded?: boolean;
}

const SYSTEMES = [
  { id: "occidental", label: "Occidental (Pythagore)", desc: "Méthode classique européenne" },
  { id: "oriental",  label: "Oriental (Chaldéen)",    desc: "Méthode babylonienne ancienne" },
  { id: "abjad",     label: "Abjad (Islamique)",      desc: "Science islamique des lettres" },
];

const COULEUR: Record<number, string> = {
  1:"#F4C842",2:"#00B4D8",3:"#FF6B6B",4:"#00E5A0",
  5:"#C084FC",6:"#FB923C",7:"#818CF8",8:"#F472B6",
  9:"#34D399",11:"#F4C842",22:"#FFD700",33:"#FF69B4"
};

function Section({ title, icon, color, children, defaultOpen = false }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, color }}>
            {icon}
          </div>
          <span className="font-semibold text-sm" style={{ color: "#F0EDF8" }}>{title}</span>
        </div>
        {open ? <ChevronUp size={18} style={{ color: "#6B5F8A" }}/> : <ChevronDown size={18} style={{ color: "#6B5F8A" }}/>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Bloc({ label, text, color = "#9B8FC2" }: { label?: string; text: string; color?: string }) {
  return (
    <div className="mt-4">
      {label && <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color }}>{label}</p>}
      <p className="text-sm leading-relaxed" style={{ color: "#9B8FC2" }}>{text}</p>
    </div>
  );
}

export default function NumerologiePage({ user, onNavigate, onAnalysisDone, embedded }: Props) {
  const [nomComplet, setNomComplet] = useState(user ? `${user.prenom} ${user.nom}` : "");
  const [dateNaissance, setDateNaissance] = useState("");
  const [systeme, setSysteme] = useState("occidental");
  const [loading, setLoading] = useState(false);
  const [rapport, setRapport] = useState<any>(null);
  const [erreur, setErreur] = useState("");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    "Calcul des nombres vibratoires...",
    "Consultation des sources islamiques...",
    "Analyse des traditions africaines...",
    "Génération du rapport complet...",
  ];

  async function analyser() {
    if (!nomComplet.trim() || !dateNaissance) {
      setErreur("Merci de remplir le nom complet et la date de naissance.");
      return;
    }
    setErreur(""); setLoading(true); setRapport(null); setProgress(0); setStep(0);

    const interval = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 5, 92);
        setStep(Math.floor(next / 25));
        return next;
      });
    }, 500);

    try {
      const res = await fetch("/api/numerologie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomComplet, dateNaissance, systeme, userId: user?.id ?? null }),
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

        {!embedded && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(244,200,66,0.15)", border: "1px solid rgba(244,200,66,0.3)" }}>
              <Hash size={30} style={{ color: "#F4C842" }} />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
              <span className="text-gradient-gold">Numérologie</span> Mystique
            </h1>
            <p style={{ color: "#9B8FC2" }}>Rapport complet selon les traditions islamique, occidentale et africaine</p>
          </motion.div>
        )}

        {/* Formulaire */}
        {!rapport && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#9B8FC2" }}>Nom complet *</label>
                <input type="text" value={nomComplet} onChange={e => setNomComplet(e.target.value)}
                  placeholder="Prénom et Nom" className="dream-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#9B8FC2" }}>Date de naissance *</label>
                <input type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)}
                  className="dream-input" style={{ colorScheme: "dark" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "#9B8FC2" }}>Système numérologique</label>
                <div className="grid grid-cols-1 gap-3">
                  {SYSTEMES.map(s => (
                    <button key={s.id} onClick={() => setSysteme(s.id)}
                      className="text-left p-4 rounded-2xl transition-all"
                      style={{
                        background: systeme === s.id ? "rgba(244,200,66,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${systeme === s.id ? "rgba(244,200,66,0.5)" : "rgba(255,255,255,0.07)"}`,
                      }}>
                      <div className="font-semibold text-sm" style={{ color: systeme === s.id ? "#F4C842" : "#F0EDF8" }}>{s.label}</div>
                      <div className="text-xs mt-1" style={{ color: "#6B5F8A" }}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {erreur && (
                <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
                  ⚠️ {erreur}
                </div>
              )}
              <button onClick={analyser} disabled={loading} className="btn-gold w-full">
                <Hash size={18} />
                Générer mon rapport complet
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center mb-6">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center glow-pulse"
              style={{ background: "linear-gradient(135deg, #F4C842, #E8A020)" }}>
              <Hash size={28} style={{ color: "#0D0B2B" }} />
            </div>
            <p className="font-semibold mb-4" style={{ color: "#F0EDF8", fontFamily: "Sora" }}>Analyse en cours...</p>
            <div className="w-full rounded-full h-2 mb-3" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #F4C842, #E8A020)" }} />
            </div>
            <p className="text-sm" style={{ color: "#9B8FC2" }}>{steps[Math.min(step, 3)]}</p>
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {steps.map((s, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full" style={{
                  background: i <= step ? "rgba(244,200,66,0.15)" : "rgba(255,255,255,0.04)",
                  color: i <= step ? "#F4C842" : "#6B5F8A",
                  border: `1px solid ${i <= step ? "rgba(244,200,66,0.3)" : "rgba(255,255,255,0.06)"}`,
                }}>
                  {i <= step ? "✓" : "○"} {["Calcul","Sources islamiques","Traditions africaines","Rapport"][i]}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ RÉSULTATS ═══ */}
        {r && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Intro */}
            <div className="glass-card-strong p-6">
              <div className="flex justify-center gap-3 mb-5 flex-wrap">
                {[
                  { label: "Chemin de Vie", val: rapport.cheminDeVie },
                  { label: "Expression",    val: rapport.nombreExpression },
                  { label: "Âme",           val: rapport.nombreAme },
                  { label: "Personnalité",  val: rapport.nombrePersonnalite },
                  { label: `Année ${new Date().getFullYear()}`, val: rapport.anneePersonnelle },
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold mb-1"
                      style={{
                        background: `${COULEUR[item.val] || "#F4C842"}22`,
                        border: `2px solid ${COULEUR[item.val] || "#F4C842"}55`,
                        color: COULEUR[item.val] || "#F4C842",
                        fontFamily: "Sora",
                      }}>{item.val}</div>
                    <span className="text-xs text-center" style={{ color: "#6B5F8A" }}>{item.label}</span>
                  </div>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-center mb-3 text-gradient-gold" style={{ fontFamily: "Sora" }}>
                {r.titre}
              </h2>
              <p className="text-sm leading-relaxed text-center" style={{ color: "#9B8FC2" }}>{r.introduction}</p>
            </div>

            {/* Chemin de Vie */}
            <Section title={`Chemin de Vie — ${rapport.cheminDeVie} · ${r.cheminDeVie?.nom || ""}`} icon={<Star size={18}/>} color="#F4C842" defaultOpen>
              <div className="flex gap-3 flex-wrap mt-3 mb-2">
                {r.cheminDeVie?.couleur && <span className="badge-gold text-xs">🎨 {r.cheminDeVie.couleur}</span>}
                {r.cheminDeVie?.pierre && <span className="badge-verified text-xs">💎 {r.cheminDeVie.pierre}</span>}
              </div>
              <Bloc label="Mission de vie" text={r.cheminDeVie?.mission} />
              <Bloc label="Dons naturels" text={r.cheminDeVie?.donsNaturels} />
              <Bloc label="Karma & leçons" text={r.cheminDeVie?.karma} />
              {r.cheminDeVie?.conseil && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(244,200,66,0.06)", border: "1px solid rgba(244,200,66,0.15)" }}>
                  <p className="text-sm" style={{ color: "#F4C842" }}>💡 {r.cheminDeVie.conseil}</p>
                </div>
              )}
            </Section>

            {/* Profil psychologique */}
            <Section title="Profil Psychologique" icon={<Brain size={18}/>} color="#C084FC">
              <Bloc label="Portrait général" text={r.profilPsychologique?.descriptionGenerale} />
              <Bloc label="Motivations profondes" text={r.profilPsychologique?.motivationsProfonde} />
              <Bloc label="Peurs inconscientes" text={r.profilPsychologique?.peursInconscientes} />
              <Bloc label="Schémas répétitifs" text={r.profilPsychologique?.schemasRepetitifs} />
              <Bloc label="Gestion du stress" text={r.profilPsychologique?.gestionStress} />
            </Section>

            {/* Qualités */}
            <Section title="Vos Qualités" icon={<CheckCircle size={18}/>} color="#00E5A0">
              <div className="space-y-5 mt-3">
                {r.qualites?.map((q: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.1)" }}>
                    <p className="font-semibold text-sm mb-2" style={{ color: "#00E5A0" }}>✓ {q.titre}</p>
                    <p className="text-sm leading-relaxed mb-2" style={{ color: "#9B8FC2" }}>{q.description}</p>
                    {q.commentDevelopper && <p className="text-xs" style={{ color: "#6B5F8A" }}>🌿 {q.commentDevelopper}</p>}
                    {q.verset && <p className="text-xs mt-1 italic" style={{ color: "#F4C842" }}>{q.verset}</p>}
                  </div>
                ))}
              </div>
            </Section>

            {/* Défauts */}
            <Section title="Points à Améliorer" icon={<AlertTriangle size={18}/>} color="#FB923C">
              <div className="space-y-5 mt-3">
                {r.defauts?.map((d: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: "rgba(251,146,60,0.04)", border: "1px solid rgba(251,146,60,0.1)" }}>
                    <p className="font-semibold text-sm mb-2" style={{ color: "#FB923C" }}>⚠ {d.titre}</p>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: "#9B8FC2" }}>{d.description}</p>
                    {d.solutionIslamique && (
                      <div className="mb-2 p-2 rounded-lg" style={{ background: "rgba(244,200,66,0.06)" }}>
                        <p className="text-xs" style={{ color: "#F4C842" }}>🕌 {d.solutionIslamique}</p>
                      </div>
                    )}
                    {d.solutionPratique && <p className="text-xs" style={{ color: "#6B5F8A" }}>📝 {d.solutionPratique}</p>}
                  </div>
                ))}
              </div>
            </Section>

            {/* Vie professionnelle */}
            <Section title="Vie Professionnelle" icon={<Briefcase size={18}/>} color="#818CF8">
              <Bloc label="Style de travail" text={r.vieProfessionnelle?.styleTravail} />
              <Bloc label="Métiers idéaux" text={r.vieProfessionnelle?.metiersIdeaux} />
              {r.vieProfessionnelle?.piegesCarriere && <Bloc label="⚠ Pièges à éviter" text={r.vieProfessionnelle.piegesCarriere} />}
            </Section>

            {/* Vie amoureuse */}
            <Section title="Vie Amoureuse" icon={<Heart size={18}/>} color="#F472B6">
              <Bloc label="Style amoureux" text={r.vieAmoureuse?.styleAmoureux} />
              <Bloc label="Compatibilités" text={r.vieAmoureuse?.compatibilites} />
              {r.vieAmoureuse?.conseilCouple && (
                <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(244,80,182,0.06)", border: "1px solid rgba(244,80,182,0.15)" }}>
                  <p className="text-sm" style={{ color: "#F472B6" }}>💞 {r.vieAmoureuse.conseilCouple}</p>
                </div>
              )}
            </Section>

            {/* Vie familiale & sociale */}
            <Section title="Vie Familiale & Sociale" icon={<Users size={18}/>} color="#00B4D8">
              <Bloc label="Style parental" text={r.vieFamiliale?.styleParental} />
              <Bloc label="Rôle en famille" text={r.vieFamiliale?.roleEnFamille} />
              <Bloc label="Style d'amitié" text={r.vieSociale?.styleAmitie} />
              <Bloc label="Place dans un groupe" text={r.vieSociale?.placeGroupe} />
            </Section>

            {/* Année personnelle */}
            <Section title={`Année Personnelle ${new Date().getFullYear()} — Chiffre ${rapport.anneePersonnelle}`} icon={<Calendar size={18}/>} color="#FB923C">
              <p className="text-sm font-semibold mt-3" style={{ color: "#FB923C" }}>{r.anneePersonnelle?.theme}</p>
              <Bloc text={r.anneePersonnelle?.description} />
              {r.anneePersonnelle?.opportunites && (
                <div className="mt-3">
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#00E5A0" }}>Opportunités</p>
                  {r.anneePersonnelle.opportunites.map((o: string, i: number) => (
                    <p key={i} className="text-sm flex gap-2 mb-1" style={{ color: "#9B8FC2" }}><span style={{ color: "#00E5A0" }}>+</span>{o}</p>
                  ))}
                </div>
              )}
              {r.anneePersonnelle?.pieges && (
                <div className="mt-3">
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#FB923C" }}>Pièges</p>
                  {r.anneePersonnelle.pieges.map((p: string, i: number) => (
                    <p key={i} className="text-sm flex gap-2 mb-1" style={{ color: "#9B8FC2" }}><span style={{ color: "#FB923C" }}>!</span>{p}</p>
                  ))}
                </div>
              )}
              {r.anneePersonnelle?.moisForts && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {r.anneePersonnelle.moisForts.map((m: string) => (
                    <span key={m} className="badge-gold text-xs">{m}</span>
                  ))}
                </div>
              )}
            </Section>

            {/* Développement personnel */}
            <Section title="Développement Personnel" icon={<Sparkles size={18}/>} color="#34D399">
              {r.developpementPersonnel?.pratiquesSpirituelles && (
                <div className="mt-3">
                  <p className="text-xs font-semibold mb-2" style={{ color: "#34D399" }}>Pratiques spirituelles</p>
                  {r.developpementPersonnel.pratiquesSpirituelles.map((p: string, i: number) => (
                    <p key={i} className="text-sm mb-1 flex gap-2" style={{ color: "#9B8FC2" }}><span style={{ color: "#34D399" }}>→</span>{p}</p>
                  ))}
                </div>
              )}
              {r.developpementPersonnel?.habitudesQuotidiennes && (
                <div className="mt-3">
                  <p className="text-xs font-semibold mb-2" style={{ color: "#34D399" }}>Habitudes quotidiennes</p>
                  {r.developpementPersonnel.habitudesQuotidiennes.map((h: string, i: number) => (
                    <p key={i} className="text-sm mb-1 flex gap-2" style={{ color: "#9B8FC2" }}><span style={{ color: "#34D399" }}>✓</span>{h}</p>
                  ))}
                </div>
              )}
            </Section>

            {/* Nombres expression, âme, personnalité */}
            <Section title="Autres Nombres Vibratoires" icon={<BookOpen size={18}/>} color="#9B8FC2">
              {r.nombresExpression && <Bloc label={`Expression — ${r.nombresExpression.nombre}`} text={r.nombresExpression.description} />}
              {r.nombreAme && <Bloc label={`Âme — ${r.nombreAme.nombre}`} text={r.nombreAme.description} />}
              {r.nombrePersonnalite && <Bloc label={`Personnalité — ${r.nombrePersonnalite.nombre}`} text={r.nombrePersonnalite.description} />}
              {r.compatibilitesChiffres && (
                <div className="mt-4">
                  <p className="text-xs font-semibold mb-2" style={{ color: "#9B8FC2" }}>Compatibilités numériques</p>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {r.compatibilitesChiffres.favorables?.map((n: number) => (
                      <span key={n} className="badge-verified text-xs">✓ {n}</span>
                    ))}
                    {r.compatibilitesChiffres.difficiles?.map((n: number) => (
                      <span key={n} className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}>✗ {n}</span>
                    ))}
                  </div>
                  {r.compatibilitesChiffres.explication && <p className="text-xs" style={{ color: "#6B5F8A" }}>{r.compatibilitesChiffres.explication}</p>}
                </div>
              )}
            </Section>

            {/* Conclusion */}
            {r.conclusionInspiratrice && (
              <div className="glass-card-strong p-6">
                <p className="text-sm font-semibold mb-3 text-center" style={{ color: "#F4C842" }}>✨ Conclusion</p>
                <p className="text-sm leading-relaxed text-center" style={{ color: "#9B8FC2" }}>{r.conclusionInspiratrice}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setRapport(null); setProgress(0); }} className="btn-ghost flex-1">
                Nouvelle analyse
              </button>
              <button onClick={() => onNavigate("compatibilite")} className="btn-gold flex-1">
                Tester la compatibilité
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
