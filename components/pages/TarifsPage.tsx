"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ExternalLink, Copy, Clock, Star } from "lucide-react";

interface Props {
  user: { id: string; prenom: string; nom: string } | null;
  onNavigate: (page: string) => void;
  onCreditsAdded?: () => void;
}

const PACKS = [
  {
    id: "decouverte",
    label: "Découverte",
    montant: 500,
    credits: 1,
    badge: null,
    couleur: "#9B8FC2",
    features: [
      "1 analyse au choix",
      "Interprétation de rêves",
      "Analyse numérologique",
      "Test de compatibilité",
    ],
    sadaqa: false,
  },
  {
    id: "essentiel",
    label: "Essentiel",
    montant: 1500,
    credits: 4,
    badge: "POPULAIRE",
    badgeColor: "#00E5A0",
    couleur: "#00E5A0",
    features: [
      "4 analyses au choix",
      "Interprétation de rêves",
      "Analyse numérologique complète",
      "Test de compatibilité complet",
      "Journal des rêves illimité",
    ],
    sadaqa: false,
  },
  {
    id: "complet",
    label: "Complet",
    montant: 2500,
    credits: 10,
    badge: "MEILLEURE VALEUR",
    badgeColor: "#F4C842",
    couleur: "#F4C842",
    features: [
      "10 analyses au choix",
      "Toutes les analyses incluses",
      "Journal des rêves illimité",
      "Accès aux marabouts vérifiés",
      "🕌 Sadaqa Guidée personnalisée",
      "Recommandations spirituelles IA",
    ],
    sadaqa: true,
  },
];

type Step = "choix" | "paiement" | "reference" | "attente";

export default function TarifsPage({ user, onNavigate, onCreditsAdded }: Props) {
  const [step, setStep] = useState<Step>("choix");
  const [selectedPack, setSelectedPack] = useState<typeof PACKS[0] | null>(null);
  const [paymentId, setPaymentId] = useState("");
  const [waveLink, setWaveLink] = useState("");
  const [numeroWave, setNumeroWave] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [copied, setCopied] = useState(false);
  const [validated, setValidated] = useState(false);
  const [creditsAdded, setCreditsAdded] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Polling quand on est sur l'étape "attente"
  useEffect(() => {
    if (step === "attente" && paymentId) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment/status?paymentId=${paymentId}`);
          const data = await res.json();
          if (data.statut === "validated") {
            clearInterval(pollingRef.current!);
            setCreditsAdded(data.credits);
            setValidated(true);
            onCreditsAdded?.();
          }
        } catch {}
      }, 5000);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [step, paymentId]);

  async function choisirPack(pack: typeof PACKS[0]) {
    if (!user) { onNavigate("onboarding"); return; }
    setSelectedPack(pack);
    setLoading(true);
    setErreur("");
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, pack: pack.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPaymentId(data.paymentId);
      setWaveLink(data.waveLink);
      setStep("paiement");
    } catch {
      setErreur("Erreur. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function soumettrReference() {
    const num = numeroWave.replace(/\D/g, "");
    if (num.length < 9) { setErreur("Entre ton numéro Wave complet (ex: 77 542 18 35)."); return; }
    setLoading(true); setErreur("");
    try {
      const res = await fetch("/api/payment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, reference: numeroWave.trim(), userId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("attente");
    } catch {
      setErreur("Erreur. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(waveLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="above-stars min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-24">

        <AnimatePresence mode="wait">

          {/* ── ÉTAPE 1 : Choix du pack ── */}
          {step === "choix" && (
            <motion.div key="choix" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "Sora" }}>
                  Nos <span className="text-gradient-gold">Offres</span>
                </h1>
                <p style={{ color: "#9B8FC2" }}>Paiement simple via Wave — pas de carte bancaire requise</p>
              </div>

              {/* Gratuit */}
              <div className="glass-card p-5 mb-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "rgba(155,143,194,0.15)", border: "1px solid rgba(155,143,194,0.2)" }}>🎁</div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#F0EDF8" }}>Accès Gratuit inclus à l'inscription</p>
                  <p className="text-xs mt-1" style={{ color: "#6B5F8A" }}>3 interprétations de rêves · 1 numérologie · 1 compatibilité — offerts à la création de compte</p>
                </div>
                <span className="badge-verified ml-auto flex-shrink-0">Gratuit</span>
              </div>

              {/* Packs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {PACKS.map((pack) => (
                  <motion.div key={pack.id} whileHover={{ y: -4 }} className="relative rounded-2xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `2px solid ${pack.badge ? pack.couleur + "66" : "rgba(255,255,255,0.08)"}`,
                    }}>
                    {pack.badge && (
                      <div className="text-center py-1.5 text-xs font-bold tracking-wider"
                        style={{ background: pack.badgeColor + "22", color: pack.badgeColor }}>
                        {pack.badge}
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "Sora", color: pack.couleur }}>{pack.label}</h3>
                      <div className="flex items-end gap-1 mb-1">
                        <span className="text-3xl font-bold" style={{ color: "#F0EDF8", fontFamily: "Sora" }}>
                          {pack.montant.toLocaleString()}
                        </span>
                        <span className="text-sm mb-1" style={{ color: "#6B5F8A" }}>FCFA</span>
                      </div>
                      <p className="text-sm mb-5" style={{ color: pack.couleur }}>{pack.credits} crédit{pack.credits > 1 ? "s" : ""}</p>

                      <ul className="space-y-2 mb-6">
                        {pack.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#9B8FC2" }}>
                            <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: pack.couleur }} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <button onClick={() => choisirPack(pack)} disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                        style={{
                          background: pack.badge ? `linear-gradient(135deg, ${pack.couleur}, ${pack.couleur}cc)` : "rgba(255,255,255,0.06)",
                          color: pack.badge ? "#0D0B2B" : "#F0EDF8",
                          border: pack.badge ? "none" : `1px solid rgba(255,255,255,0.1)`,
                        }}>
                        {loading && selectedPack?.id === pack.id ? "Chargement..." : "Choisir cette offre"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {erreur && <p className="text-center text-sm mt-4" style={{ color: "#F87171" }}>{erreur}</p>}

              {/* Moyens de paiement */}
              <div className="mt-10 text-center">
                <p className="text-sm mb-3" style={{ color: "#6B5F8A" }}>Moyens de paiement acceptés</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  {["💙 Wave", "🟠 Orange Money", "🟢 Free Money"].map(m => (
                    <span key={m} className="text-sm px-4 py-2 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#9B8FC2" }}>
                      {m}
                    </span>
                  ))}
                </div>
                <p className="text-xs mt-4" style={{ color: "#6B5F8A" }}>Aucune carte bancaire requise · Paiement local sécurisé</p>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 2 : Paiement Wave ── */}
          {step === "paiement" && selectedPack && (
            <motion.div key="paiement" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-lg mx-auto">
              <div className="glass-card-strong p-8 text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                  style={{ background: "rgba(0,180,216,0.15)", border: "1px solid rgba(0,180,216,0.3)" }}>
                  💙
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>
                  Payer via Wave
                </h2>
                <p className="text-sm mb-6" style={{ color: "#9B8FC2" }}>
                  {selectedPack.label} — <span style={{ color: "#F4C842", fontWeight: "bold" }}>{selectedPack.montant.toLocaleString()} FCFA</span>
                </p>

                {/* Lien Wave */}
                <a href={waveLink} target="_blank" rel="noopener noreferrer"
                  className="btn-gold w-full mb-4 flex items-center justify-center gap-2 no-underline"
                  style={{ textDecoration: "none" }}>
                  <ExternalLink size={18} />
                  Payer {selectedPack.montant.toLocaleString()} FCFA sur Wave
                </a>

                <button onClick={copyLink} className="btn-ghost w-full mb-6 flex items-center justify-center gap-2">
                  <Copy size={16} />
                  {copied ? "✓ Lien copié !" : "Copier le lien de paiement"}
                </button>

                <div className="p-4 rounded-xl mb-6 text-left" style={{ background: "rgba(244,200,66,0.06)", border: "1px solid rgba(244,200,66,0.15)" }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#F4C842" }}>📋 Instructions</p>
                  <ol className="space-y-2 text-sm" style={{ color: "#9B8FC2" }}>
                    <li>1. Clique sur "Payer sur Wave" ci-dessus</li>
                    <li>2. Effectue le paiement de <strong style={{ color: "#F4C842" }}>{selectedPack.montant.toLocaleString()} FCFA</strong></li>
                    <li>3. Wave t'envoie un SMS avec ta <strong style={{ color: "#F0EDF8" }}>référence de transaction</strong></li>
                    <li>4. Reviens ici et entre cette référence</li>
                  </ol>
                </div>

                <button onClick={() => setStep("reference")} className="btn-gold w-full">
                  J'ai payé → Confirmer mon numéro
                </button>
                <button onClick={() => setStep("choix")} className="btn-ghost w-full mt-3">
                  ← Retour
                </button>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 3 : Numéro Wave ── */}
          {step === "reference" && selectedPack && (
            <motion.div key="reference" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-lg mx-auto">
              <div className="glass-card-strong p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">💙</div>
                  <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>
                    Confirmer le paiement
                  </h2>
                  <p className="text-sm" style={{ color: "#9B8FC2" }}>
                    Entre le numéro Wave avec lequel tu as payé
                  </p>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2" style={{ color: "#9B8FC2" }}>
                    Ton numéro Wave
                  </label>
                  <input
                    type="tel"
                    value={numeroWave}
                    onChange={e => { setNumeroWave(e.target.value); setErreur(""); }}
                    placeholder="ex : 77 542 18 35"
                    className="dream-input w-full text-center text-xl font-bold tracking-widest"
                    style={{ fontFamily: "Sora" }}
                    maxLength={14}
                  />
                  <p className="text-xs mt-2 text-center" style={{ color: "#6B5F8A" }}>
                    C'est le numéro avec lequel tu as effectué le paiement Wave de{" "}
                    <strong style={{ color: "#F4C842" }}>{selectedPack.montant.toLocaleString()} FCFA</strong>
                  </p>
                </div>

                {erreur && (
                  <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
                    ⚠️ {erreur}
                  </div>
                )}

                <button onClick={soumettrReference} disabled={loading} className="btn-gold w-full mb-3">
                  {loading ? "Envoi..." : "Confirmer mon numéro"}
                </button>
                <button onClick={() => setStep("paiement")} className="btn-ghost w-full">
                  ← Retour
                </button>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 4 : Attente / Succès ── */}
          {step === "attente" && !validated && (
            <motion.div key="attente" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-lg mx-auto text-center">
              <div className="glass-card-strong p-10">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(244,200,66,0.2), rgba(0,229,160,0.2))", border: "2px solid rgba(244,200,66,0.3)" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                    <Clock size={36} style={{ color: "#F4C842" }} />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "Sora", color: "#F4C842" }}>
                  En attente de validation
                </h2>
                <p className="text-sm mb-4" style={{ color: "#9B8FC2" }}>
                  Ta référence a été soumise. Notre équipe vérifie ton paiement...
                </p>

                {/* Points de pulsation */}
                <div className="flex justify-center gap-2 mb-6">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full"
                      style={{ background: "#F4C842" }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }} />
                  ))}
                </div>

                <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)" }}>
                  <p className="text-sm" style={{ color: "#00E5A0" }}>
                    Cette page se mettra à jour automatiquement dès validation ✨
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Star size={16} style={{ color: "#F4C842" }} />
                  <p className="text-xs" style={{ color: "#6B5F8A" }}>Délai habituel : moins de 2 heures</p>
                </div>
                <button onClick={() => onNavigate("home")} className="btn-ghost w-full">
                  Retour à l'accueil
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Succès après validation admin ── */}
          {step === "attente" && validated && (
            <motion.div key="succes" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="max-w-lg mx-auto text-center">
              <div className="glass-card-strong p-10">
                <motion.div className="text-7xl mb-4"
                  animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: 2 }}>
                  🎉
                </motion.div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Sora", color: "#00E5A0" }}>
                  Paiement validé !
                </h2>
                <p className="text-sm mb-6" style={{ color: "#9B8FC2" }}>
                  Ton paiement a été confirmé par notre équipe.
                </p>

                <div className="p-6 rounded-2xl mb-6"
                  style={{ background: "linear-gradient(135deg, rgba(0,229,160,0.1), rgba(244,200,66,0.1))", border: "1px solid rgba(0,229,160,0.3)" }}>
                  <p className="text-4xl font-bold mb-1" style={{ fontFamily: "Sora", color: "#F4C842" }}>
                    +{creditsAdded}
                  </p>
                  <p className="text-sm" style={{ color: "#00E5A0" }}>
                    crédit{creditsAdded > 1 ? "s" : ""} ajouté{creditsAdded > 1 ? "s" : ""} à ton compte
                  </p>
                </div>

                <button onClick={() => onNavigate("dream")} className="btn-gold w-full mb-3">
                  Interpréter un rêve ✨
                </button>
                <button onClick={() => onNavigate("home")} className="btn-ghost w-full">
                  Retour à l'accueil
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
