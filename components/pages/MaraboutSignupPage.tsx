"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Upload, ExternalLink, Copy, Clock, AlertCircle } from "lucide-react";

type Step = "infos" | "kyc" | "paiement" | "reference" | "attente";

const VILLES = ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack", "Touba", "Diourbel", "Tambacounda", "Kolda", "Fatick", "Louga", "Matam", "Kaffrine", "Sédhiou", "Kédougou"];
const TRADITIONS = [
  { id: "islam", label: "Islam", icon: "☪️" },
  { id: "christianisme", label: "Christianisme", icon: "✝️" },
  { id: "animisme", label: "Animisme / Traditionnel", icon: "🌿" },
  { id: "syncretisme", label: "Syncrétisme africain", icon: "🌍" },
];
const SPECIALITES_LIST = [
  "Interprétation de rêves",
  "Numérologie spirituelle",
  "Compatibilité & mariage",
  "Protection spirituelle",
  "Guérison & purification",
  "Désenvoûtement",
  "Retour affectif",
  "Succès & prospérité",
  "Problèmes familiaux",
  "Guidance spirituelle",
];
const WAVE_LINK = "https://pay.wave.com/m/M_sn_OrBEDgUMGWxY/c/sn/?amount=2500";

export default function MaraboutSignupPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [step, setStep] = useState<Step>("infos");

  // Formulaire
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ville, setVille] = useState("");
  const [tradition, setTradition] = useState("");
  const [specialites, setSpecialites] = useState<string[]>([]);
  const [tarif, setTarif] = useState(1000);

  // KYC
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState("");
  const [cinFile, setCinFile] = useState<File | null>(null);
  const [cinPreview, setCinPreview] = useState("");

  // Paiement
  const [maraboutId, setMaraboutId] = useState("");
  const [operateur, setOperateur] = useState("");
  const [premierChiffre, setPremierChiffre] = useState("");
  const [deuxDerniers, setDeuxDerniers] = useState("");
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [validated, setValidated] = useState(false);

  const selfieRef = useRef<HTMLInputElement>(null);
  const cinRef = useRef<HTMLInputElement>(null);

  function toggleSpec(s: string) {
    setSpecialites(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function handleFileChange(type: "selfie" | "cin", file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "selfie") { setSelfieFile(file); setSelfiePreview(url); }
    else { setCinFile(file); setCinPreview(url); }
  }

  async function uploadFile(file: File, type: "selfie" | "cin"): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch("/api/marabout/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.path;
  }

  function validerInfos() {
    setErreur("");
    if (!prenom.trim() || !nom.trim()) return setErreur("Prénom et nom obligatoires.");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErreur("Email invalide.");
    if (!telephone.trim()) return setErreur("Numéro de téléphone obligatoire.");
    if (!whatsapp.trim()) return setErreur("Numéro WhatsApp obligatoire.");
    if (!ville) return setErreur("Choisissez votre ville.");
    if (!tradition) return setErreur("Choisissez votre tradition spirituelle.");
    if (specialites.length === 0) return setErreur("Choisissez au moins une spécialité.");
    setStep("kyc");
  }

  async function validerKYC() {
    setErreur("");
    if (!selfieFile) return setErreur("La photo selfie est obligatoire.");
    if (!cinFile) return setErreur("La photo de votre carte d'identité est obligatoire.");
    setLoading(true);
    try {
      const selfieUrl = await uploadFile(selfieFile, "selfie");
      const cinUrl = await uploadFile(cinFile, "cin");

      const res = await fetch("/api/marabout/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom, nom, email, telephone, whatsapp,
          ville, tradition, specialites, tarif,
          selfie: selfieUrl, cin: cinUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMaraboutId(data.maraboutId);
      setStep("paiement");
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Erreur. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function soumettrePaiement() {
    setErreur("");
    if (!operateur) return setErreur("Choisis ton opérateur.");
    if (!/^\d$/.test(premierChiffre)) return setErreur("Entre le 1er chiffre après ton préfixe.");
    if (!/^\d{2}$/.test(deuxDerniers)) return setErreur("Entre les 2 derniers chiffres.");
    setLoading(true);
    try {
      const res = await fetch("/api/marabout/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maraboutId, operateur, premierChiffre, deuxDerniers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("attente");
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Erreur. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  // Vérification du statut toutes les 10s après soumission
  useEffect(() => {
    if (step !== "attente" || !maraboutId || validated) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/marabout/status?id=${maraboutId}`);
        const data = await res.json();
        if (data.statut === "verified") {
          setValidated(true);
          clearInterval(interval);
        }
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [step, maraboutId, validated]);

  function copyLink() {
    navigator.clipboard.writeText(WAVE_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const STEP_ORDER: Step[] = ["infos", "kyc", "paiement", "attente"];

  return (
    <div className="above-stars min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-6 pt-24">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
            style={{ background: "rgba(244,200,66,0.1)", border: "1px solid rgba(244,200,66,0.2)" }}>
            🧿
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Sora" }}>
            Devenir <span className="text-gradient-gold">Marabout</span>
          </h1>
          <p style={{ color: "#9B8FC2" }}>Rejoignez notre plateforme de confiance · Identité vérifiée · 2 500 FCFA</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEP_ORDER.map((s, i) => {
            const currentIdx = STEP_ORDER.indexOf(step === "reference" ? "paiement" : step);
            const stepIdx = i;
            const isLastStep = step === "attente";
            const done = currentIdx > stepIdx || (isLastStep && stepIdx === STEP_ORDER.length - 1);
            const active = currentIdx === stepIdx && !done;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: done ? "#00E5A0" : active ? "rgba(244,200,66,0.2)" : "rgba(255,255,255,0.05)",
                    border: `2px solid ${done ? "#00E5A0" : active ? "#F4C842" : "rgba(255,255,255,0.1)"}`,
                    color: done ? "#0D0B2B" : active ? "#F4C842" : "#6B5F8A",
                  }}>
                  {done ? <Check size={12} /> : stepIdx + 1}
                </div>
                {i < STEP_ORDER.length - 1 && (
                  <div className="w-8 h-px" style={{ background: done ? "#00E5A066" : "rgba(255,255,255,0.08)" }} />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ── ÉTAPE 1 : Infos ── */}
          {step === "infos" && (
            <motion.div key="infos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card-strong p-6 space-y-4">
                <h2 className="text-lg font-bold" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>
                  1. Vos informations
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "#6B5F8A" }}>Prénom *</label>
                    <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Ibrahima"
                      className="dream-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "#6B5F8A" }}>Nom *</label>
                    <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Diallo"
                      className="dream-input w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "#6B5F8A" }}>Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="exemple@gmail.com" className="dream-input w-full" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "#6B5F8A" }}>Téléphone *</label>
                    <input value={telephone} onChange={e => setTelephone(e.target.value)}
                      placeholder="+221 77 XXX XX XX" className="dream-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "#6B5F8A" }}>
                      WhatsApp * <span style={{ color: "#25D366" }}>📱</span>
                    </label>
                    <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                      placeholder="+221 77 XXX XX XX" className="dream-input w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "#6B5F8A" }}>Ville *</label>
                  <select value={ville} onChange={e => setVille(e.target.value)} className="dream-input w-full">
                    <option value="">Choisir une ville</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs mb-2" style={{ color: "#6B5F8A" }}>Tradition spirituelle *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRADITIONS.map(t => (
                      <button key={t.id} onClick={() => setTradition(t.id)}
                        className="py-3 px-3 rounded-xl text-sm text-left transition-all flex items-center gap-2"
                        style={{
                          background: tradition === t.id ? "rgba(244,200,66,0.12)" : "rgba(255,255,255,0.03)",
                          border: `2px solid ${tradition === t.id ? "rgba(244,200,66,0.5)" : "rgba(255,255,255,0.07)"}`,
                          color: tradition === t.id ? "#F4C842" : "#9B8FC2",
                        }}>
                        <span>{t.icon}</span><span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-2" style={{ color: "#6B5F8A" }}>
                    Spécialités * (plusieurs possibles)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALITES_LIST.map(s => (
                      <button key={s} onClick={() => toggleSpec(s)}
                        className="px-3 py-1.5 rounded-lg text-xs transition-all"
                        style={{
                          background: specialites.includes(s) ? "rgba(0,229,160,0.12)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${specialites.includes(s) ? "rgba(0,229,160,0.4)" : "rgba(255,255,255,0.08)"}`,
                          color: specialites.includes(s) ? "#00E5A0" : "#9B8FC2",
                        }}>
                        {specialites.includes(s) && "✓ "}{s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-2" style={{ color: "#6B5F8A" }}>
                    Tarif consultation * (max 3 000 FCFA) —{" "}
                    <strong style={{ color: "#F4C842" }}>{tarif.toLocaleString()} FCFA</strong>
                  </label>
                  <input type="range" min={500} max={3000} step={500} value={tarif}
                    onChange={e => setTarif(parseInt(e.target.value))}
                    className="w-full" style={{ accentColor: "#F4C842" }} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: "#6B5F8A" }}>
                    {[500, 1000, 1500, 2000, 2500, 3000].map(v => <span key={v}>{v}</span>)}
                  </div>
                </div>

                {erreur && (
                  <div className="p-3 rounded-xl text-sm flex items-center gap-2"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
                    <AlertCircle size={16} />{erreur}
                  </div>
                )}

                <button onClick={validerInfos} className="btn-gold w-full mt-2">
                  Continuer → Vérification d'identité
                </button>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 2 : KYC ── */}
          {step === "kyc" && (
            <motion.div key="kyc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card-strong p-6 space-y-5">
                <h2 className="text-lg font-bold" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>
                  2. Vérification d'identité
                </h2>
                <div className="p-3 rounded-xl text-sm flex items-start gap-2"
                  style={{ background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)", color: "#9B8FC2" }}>
                  <span className="mt-0.5 flex-shrink-0">🔒</span>
                  <span>Vos documents sont stockés de manière sécurisée et visibles uniquement par notre équipe de vérification.</span>
                </div>

                {/* Selfie */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#9B8FC2" }}>
                    📸 Photo selfie (visage bien visible) *
                  </label>
                  <input ref={selfieRef} type="file" accept="image/*" capture="user" className="hidden"
                    onChange={e => handleFileChange("selfie", e.target.files?.[0] || null)} />
                  {selfiePreview ? (
                    <div className="relative">
                      <img src={selfiePreview} alt="Selfie" className="w-full max-h-52 object-cover rounded-xl" />
                      <button onClick={() => { setSelfieFile(null); setSelfiePreview(""); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: "rgba(239,68,68,0.85)", color: "white" }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => selfieRef.current?.click()}
                      className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all hover:border-opacity-60"
                      style={{ borderColor: "rgba(155,143,194,0.3)", color: "#6B5F8A" }}>
                      <Upload size={28} />
                      <span className="text-sm">Cliquer pour ajouter votre selfie</span>
                      <span className="text-xs">JPG, PNG · Max 5 MB</span>
                    </button>
                  )}
                </div>

                {/* CIN */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#9B8FC2" }}>
                    🪪 Carte Nationale d'Identité (recto) *
                  </label>
                  <input ref={cinRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileChange("cin", e.target.files?.[0] || null)} />
                  {cinPreview ? (
                    <div className="relative">
                      <img src={cinPreview} alt="CIN" className="w-full max-h-52 object-cover rounded-xl" />
                      <button onClick={() => { setCinFile(null); setCinPreview(""); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: "rgba(239,68,68,0.85)", color: "white" }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => cinRef.current?.click()}
                      className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all hover:border-opacity-60"
                      style={{ borderColor: "rgba(155,143,194,0.3)", color: "#6B5F8A" }}>
                      <Upload size={28} />
                      <span className="text-sm">Cliquer pour ajouter votre CNI</span>
                      <span className="text-xs">Recto uniquement · JPG, PNG · Max 5 MB</span>
                    </button>
                  )}
                </div>

                {erreur && (
                  <div className="p-3 rounded-xl text-sm flex items-center gap-2"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
                    <AlertCircle size={16} />{erreur}
                  </div>
                )}

                <button onClick={validerKYC} disabled={loading} className="btn-gold w-full">
                  {loading ? "Upload en cours..." : "Continuer → Paiement"}
                </button>
                <button onClick={() => setStep("infos")} className="btn-ghost w-full">← Retour</button>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 3 : Paiement ── */}
          {step === "paiement" && (
            <motion.div key="paiement" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card-strong p-8 text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                  style={{ background: "rgba(0,180,216,0.15)", border: "1px solid rgba(0,180,216,0.3)" }}>
                  💙
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>
                  Frais d'intégration
                </h2>
                <p className="text-sm mb-2" style={{ color: "#9B8FC2" }}>
                  Paiement unique pour rejoindre la plateforme
                </p>
                <p className="text-4xl font-bold mb-6" style={{ color: "#F4C842", fontFamily: "Sora" }}>
                  2 500 <span className="text-xl">FCFA</span>
                </p>

                <a href={WAVE_LINK} target="_blank" rel="noopener noreferrer"
                  className="btn-gold w-full mb-4 flex items-center justify-center gap-2"
                  style={{ textDecoration: "none" }}>
                  <ExternalLink size={18} />
                  Payer 2 500 FCFA sur Wave
                </a>

                <button onClick={copyLink} className="btn-ghost w-full mb-6 flex items-center justify-center gap-2">
                  <Copy size={16} />
                  {copied ? "✓ Lien copié !" : "Copier le lien"}
                </button>

                <div className="p-4 rounded-xl mb-6 text-left"
                  style={{ background: "rgba(244,200,66,0.06)", border: "1px solid rgba(244,200,66,0.15)" }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#F4C842" }}>📋 Instructions</p>
                  <ol className="space-y-2 text-sm" style={{ color: "#9B8FC2" }}>
                    <li>1. Clique sur "Payer sur Wave" ci-dessus</li>
                    <li>2. Effectue le paiement de <strong style={{ color: "#F4C842" }}>2 500 FCFA</strong></li>
                    <li>3. Reviens ici et confirme ton numéro Wave</li>
                  </ol>
                </div>

                <button onClick={() => setStep("reference")} className="btn-gold w-full">
                  J'ai payé → Confirmer mon numéro
                </button>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 4 : Référence ── */}
          {step === "reference" && (
            <motion.div key="reference" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card-strong p-8">
                <h2 className="text-xl font-bold mb-2 text-center" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>
                  Confirmer le paiement
                </h2>
                <p className="text-sm text-center mb-6" style={{ color: "#9B8FC2" }}>
                  Entre le numéro Wave avec lequel tu as payé les 2 500 FCFA
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3" style={{ color: "#9B8FC2" }}>
                    Ton numéro commence par...
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["70", "76", "77", "78"].map(op => (
                      <button key={op} onClick={() => setOperateur(op)}
                        className="py-4 rounded-xl text-xl font-bold transition-all"
                        style={{
                          background: operateur === op ? "rgba(244,200,66,0.15)" : "rgba(255,255,255,0.04)",
                          border: `2px solid ${operateur === op ? "rgba(244,200,66,0.6)" : "rgba(255,255,255,0.08)"}`,
                          color: operateur === op ? "#F4C842" : "#9B8FC2",
                          fontFamily: "Sora",
                        }}>
                        {op}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium mb-3" style={{ color: "#9B8FC2" }}>
                    Quelques chiffres de ton numéro
                  </label>
                  <div className="flex items-center justify-center gap-1 mb-4 p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-lg font-bold" style={{ color: "#F4C842", fontFamily: "Sora" }}>{operateur || "??"}</span>
                    <span className="text-lg font-bold" style={{ color: premierChiffre ? "#F0EDF8" : "#6B5F8A", fontFamily: "Sora" }}>
                      {" "}{premierChiffre || "?"}
                    </span>
                    <span className="text-lg" style={{ color: "#6B5F8A", fontFamily: "Sora" }}>XX XXX XX </span>
                    <span className="text-lg font-bold" style={{ color: deuxDerniers.length === 2 ? "#F0EDF8" : "#6B5F8A", fontFamily: "Sora" }}>
                      {deuxDerniers.length === 2 ? deuxDerniers : "??"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs mb-1.5 text-center" style={{ color: "#6B5F8A" }}>
                        1er chiffre après <strong style={{ color: "#9B8FC2" }}>{operateur || "??"}</strong>
                      </p>
                      <input type="tel" value={premierChiffre}
                        onChange={e => setPremierChiffre(e.target.value.replace(/\D/g, "").slice(0, 1))}
                        placeholder="?" className="dream-input text-center text-2xl font-bold tracking-widest w-full"
                        style={{ fontFamily: "Sora" }} maxLength={1} />
                    </div>
                    <div>
                      <p className="text-xs mb-1.5 text-center" style={{ color: "#6B5F8A" }}>2 derniers chiffres</p>
                      <input type="tel" value={deuxDerniers}
                        onChange={e => setDeuxDerniers(e.target.value.replace(/\D/g, "").slice(0, 2))}
                        placeholder="??" className="dream-input text-center text-2xl font-bold tracking-widest w-full"
                        style={{ fontFamily: "Sora" }} maxLength={2} />
                    </div>
                  </div>

                  <p className="text-xs mt-3 text-center" style={{ color: "#6B5F8A" }}>
                    Exemple : numéro <strong style={{ color: "#9B8FC2" }}>77 542 18 35</strong> → tu entres{" "}
                    <strong style={{ color: "#F4C842" }}>5</strong> et <strong style={{ color: "#F4C842" }}>35</strong>
                  </p>
                </div>

                {erreur && (
                  <div className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
                    <AlertCircle size={16} />{erreur}
                  </div>
                )}

                <button onClick={soumettrePaiement} disabled={loading} className="btn-gold w-full mb-3">
                  {loading ? "Envoi..." : "Confirmer mon numéro"}
                </button>
                <button onClick={() => setStep("paiement")} className="btn-ghost w-full">← Retour</button>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 5 : Attente / Validé ── */}
          {step === "attente" && (
            <motion.div key="attente" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center">
              <div className="glass-card-strong p-10">

                {validated ? (
                  /* ── VALIDÉ ── */
                  <>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
                      className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #00E5A0, #00B87A)", boxShadow: "0 0 40px rgba(0,229,160,0.4)" }}>
                      <span style={{ fontSize: "40px" }}>🎉</span>
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "Sora", color: "#00E5A0" }}>
                      Profil activé !
                    </h2>
                    <p className="text-base mb-6" style={{ color: "#9B8FC2" }}>
                      Bienvenue sur SetalSaBOP, <strong style={{ color: "#F0EDF8" }}>{prenom}</strong> 🧿
                    </p>
                    <div className="space-y-3 mb-6 text-left">
                      {[
                        { icon: "👥", text: "Votre profil est visible par tous les utilisateurs" },
                        { icon: "📱", text: `Ils vous contacteront sur WhatsApp : ${whatsapp}` },
                        { icon: "🛡️", text: "Votre badge ✅ Vérifié vous distingue et rassure" },
                        { icon: "📧", text: `Un email de bienvenue a été envoyé à ${email}` },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                          style={{ background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.15)" }}>
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="text-sm" style={{ color: "#9B8FC2" }}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-xl mb-6"
                      style={{ background: "rgba(244,200,66,0.06)", border: "1px solid rgba(244,200,66,0.2)" }}>
                      <p className="text-sm font-semibold mb-1" style={{ color: "#F4C842" }}>💡 Conseil</p>
                      <p className="text-sm" style={{ color: "#9B8FC2" }}>
                        Assurez-vous d'avoir WhatsApp actif sur <strong style={{ color: "#F0EDF8" }}>{whatsapp}</strong> pour recevoir les demandes de consultation.
                      </p>
                    </div>
                  </>
                ) : (
                  /* ── EN ATTENTE ── */
                  <>
                    <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center glow-pulse"
                      style={{ background: "linear-gradient(135deg, rgba(244,200,66,0.2), rgba(0,229,160,0.2))", border: "2px solid rgba(244,200,66,0.3)" }}>
                      <Clock size={36} style={{ color: "#F4C842" }} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "Sora", color: "#F4C842" }}>
                      Dossier soumis !
                    </h2>
                    <p className="text-sm mb-6" style={{ color: "#9B8FC2" }}>
                      Votre candidature est en cours de vérification. Notre équipe va valider votre identité et votre paiement.
                    </p>
                    <div className="space-y-3 mb-6 text-left">
                      {[
                        { icon: "🔍", text: "Vérification de votre identité (KYC)" },
                        { icon: "💳", text: "Confirmation du paiement Wave (2 500 FCFA)" },
                        { icon: "✅", text: "Activation de votre profil sur la plateforme" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span>{item.icon}</span>
                          <span className="text-sm" style={{ color: "#9B8FC2" }}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-xl"
                      style={{ background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)" }}>
                      <p className="text-sm" style={{ color: "#00E5A0" }}>
                        📧 Vous recevrez un email de confirmation à <strong>{email}</strong>
                      </p>
                    </div>
                    <p className="text-xs mt-4" style={{ color: "#6B5F8A" }}>Délai habituel : 24 à 48 heures</p>
                  </>
                )}

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
