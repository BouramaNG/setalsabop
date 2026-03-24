"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingProps {
  onComplete: (user: { id: string; email: string; prenom: string; nom: string; prenomMere: string; nomMere: string; tradition: string; genre: string; age: string }) => void;
}

const traditions = [
  { id: "islam", icon: "🕌", label: "Islam", desc: "Selon Ibn Sirin & les savants", color: "#10B981" },
  { id: "christianisme", icon: "✝️", label: "Christianisme", desc: "Selon la Bible", color: "#60A5FA" },
  { id: "psychologie", icon: "🧠", label: "Psychologie", desc: "Approche scientifique", color: "#A78BFA" },
  { id: "ancestral", icon: "🌿", label: "Traditions Ancestrales", desc: "Animisme & croyances", color: "#34D399" },
];

// Steps: 0=Email+Password, 1=OTP, 2=Tradition, 3=Profil
const STEPS = ["Compte", "Vérification", "Tradition", "Profil"];

export default function OnboardingPage({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 0
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Step 1 — OTP
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 2
  const [tradition, setTradition] = useState("");

  // Step 3
  const [form, setForm] = useState({ prenom: "", nom: "", genre: "homme", age: "", prenomMere: "", nomMere: "" });

  const clearError = () => setError("");

  // ─── Step 0: Inscription ────────────────────────────────────────────
  const handleRegister = async () => {
    setError("");
    if (!email.includes("@")) return setError("Email invalide");
    if (password.length < 6) return setError("Mot de passe trop court (6 caractères minimum)");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setStep(1);
      startResendCooldown();
    } catch {
      setError("Erreur réseau, réessaye.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 1: Vérification OTP ───────────────────────────────────────
  const handleVerifyOTP = async () => {
    setError("");
    if (otp.length !== 6) return setError("Le code doit contenir 6 chiffres");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setStep(2);
    } catch {
      setError("Erreur réseau, réessaye.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setError("");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      startResendCooldown();
    } catch {
      setError("Erreur réseau.");
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  // ─── Step 3: Compléter le profil ────────────────────────────────────
  const handleCompleteProfile = async () => {
    setError("");
    if (form.prenom.length < 2) return setError("Prénom trop court");
    if (form.nom.length < 2) return setError("Nom trop court");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          prenom: form.prenom,
          nom: form.nom,
          prenomMere: form.prenomMere,
          nomMere: form.nomMere,
          tradition,
          genre: form.genre,
          age: form.age,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      onComplete(data.user);
    } catch {
      setError("Erreur réseau, réessaye.");
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return email.includes("@") && password.length >= 6;
    if (step === 1) return otp.length === 6;
    if (step === 2) return !!tradition;
    if (step === 3) return form.prenom.length >= 2 && form.nom.length >= 2;
    return false;
  };

  const handleNext = () => {
    if (step === 0) handleRegister();
    else if (step === 1) handleVerifyOTP();
    else if (step === 2) setStep(3);
    else if (step === 3) handleCompleteProfile();
  };

  return (
    <div className="min-h-screen above-stars flex items-center justify-center px-4 pt-20 pb-10">
      <div className="w-full max-w-md">

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                    style={{
                      background: i <= step ? "linear-gradient(135deg,#F4C842,#E8A020)" : "rgba(255,255,255,0.06)",
                      color: i <= step ? "#0D0B2B" : "#6B5F8A",
                      boxShadow: i === step ? "0 0 15px rgba(244,200,66,0.4)" : "none",
                    }}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span style={{ color: i === step ? "#F4C842" : "#6B5F8A", fontSize: "11px", fontWeight: i === step ? 600 : 400, marginTop: "4px" }}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-px mx-2 mb-4" style={{ background: i < step ? "rgba(244,200,66,0.4)" : "rgba(255,255,255,0.08)", width: "40px" }} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#F4C842,#E8A020)" }}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </motion.div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            className="glass-card-strong p-7"
          >

            {/* ── Step 0 — Email + Password ── */}
            {step === 0 && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">✨</div>
                  <h2 className="font-bold text-2xl mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
                    Créer ton compte <span className="text-gradient-gold">DreamInsight</span>
                  </h2>
                  <p style={{ color: "#9B8FC2", fontSize: "14px" }}>Un code de vérification sera envoyé sur ton email</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label style={{ color: "#9B8FC2", fontSize: "13px", marginBottom: "8px", display: "block" }}>Adresse email</label>
                    <input
                      type="email"
                      placeholder="ton@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearError(); }}
                      className="dream-input"
                      onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#9B8FC2", fontSize: "13px", marginBottom: "8px", display: "block" }}>Mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="Minimum 6 caractères"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearError(); }}
                        className="dream-input"
                        style={{ paddingRight: "48px" }}
                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#6B5F8A", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}
                      >
                        {showPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1 — Vérification OTP ── */}
            {step === 1 && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">📩</div>
                  <h2 className="font-bold text-2xl mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
                    Vérifie ton <span className="text-gradient-gold">email</span>
                  </h2>
                  <p style={{ color: "#9B8FC2", fontSize: "14px" }}>
                    On a envoyé un code à 6 chiffres à<br />
                    <strong style={{ color: "#F0EDF8" }}>{email}</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label style={{ color: "#9B8FC2", fontSize: "13px", marginBottom: "8px", display: "block" }}>Code de vérification</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="• • • • • •"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); clearError(); }}
                      className="dream-input"
                      style={{ fontSize: "28px", letterSpacing: "12px", textAlign: "center", fontWeight: "700" }}
                      onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    />
                  </div>

                  <div className="text-center">
                    <p style={{ color: "#6B5F8A", fontSize: "13px" }}>
                      Pas reçu ?{" "}
                      <button
                        onClick={handleResendOTP}
                        disabled={resendCooldown > 0}
                        style={{
                          color: resendCooldown > 0 ? "#6B5F8A" : "#F4C842",
                          background: "none",
                          border: "none",
                          cursor: resendCooldown > 0 ? "default" : "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer le code"}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2 — Tradition ── */}
            {step === 2 && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🌙</div>
                  <h2 className="font-bold text-2xl mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
                    Ta <span className="text-gradient-mystic">tradition spirituelle</span>
                  </h2>
                  <p style={{ color: "#9B8FC2", fontSize: "13px" }}>
                    Aucune bonne ou mauvaise réponse. Tu pourras voir les autres plus tard.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {traditions.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTradition(t.id)}
                      className={`tradition-card ${tradition === t.id ? "selected" : ""}`}
                    >
                      <div className="text-3xl mb-2">{t.icon}</div>
                      <p className="font-bold text-sm" style={{ color: "#F0EDF8" }}>{t.label}</p>
                      <p style={{ color: t.color, fontSize: "11px", marginTop: "3px" }}>{t.desc}</p>
                      {tradition === t.id && <div className="mt-2"><span className="badge-gold">✓ Sélectionné</span></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3 — Profil ── */}
            {step === 3 && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">👤</div>
                  <h2 className="font-bold text-2xl mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
                    Dis-nous <span className="text-gradient-gold">qui tu es</span>
                  </h2>
                  <p style={{ color: "#9B8FC2", fontSize: "13px" }}>
                    Ces infos personnalisent ton interprétation. Tout est privé et chiffré.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Prénom + Nom */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ color: "#9B8FC2", fontSize: "13px", marginBottom: "8px", display: "block" }}>Prénom *</label>
                      <input
                        type="text"
                        placeholder="ex: Moussa"
                        value={form.prenom}
                        onChange={(e) => { setForm({ ...form, prenom: e.target.value }); clearError(); }}
                        className="dream-input"
                      />
                    </div>
                    <div>
                      <label style={{ color: "#9B8FC2", fontSize: "13px", marginBottom: "8px", display: "block" }}>Nom *</label>
                      <input
                        type="text"
                        placeholder="ex: Diallo"
                        value={form.nom}
                        onChange={(e) => { setForm({ ...form, nom: e.target.value }); clearError(); }}
                        className="dream-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ color: "#9B8FC2", fontSize: "13px", marginBottom: "8px", display: "block" }}>Âge</label>
                    <input
                      type="number"
                      placeholder="ex: 28"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      className="dream-input"
                      min="10" max="100"
                    />
                  </div>

                  <div>
                    <label style={{ color: "#9B8FC2", fontSize: "13px", marginBottom: "8px", display: "block" }}>Genre</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["homme", "femme", "autre"].map((g) => (
                        <button
                          key={g}
                          onClick={() => setForm({ ...form, genre: g })}
                          className="p-3 rounded-xl text-sm font-medium capitalize transition-all"
                          style={{
                            background: form.genre === g ? "rgba(244,200,66,0.12)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${form.genre === g ? "rgba(244,200,66,0.4)" : "rgba(255,255,255,0.08)"}`,
                            color: form.genre === g ? "#F4C842" : "#9B8FC2",
                          }}
                        >
                          {g === "homme" ? "👨" : g === "femme" ? "👩" : "🧑"} {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prénom + Nom de la mère */}
                  <div>
                    <label style={{ color: "#9B8FC2", fontSize: "13px", marginBottom: "4px", display: "block" }}>
                      Identité de ta mère
                      <span className="badge-gold ml-2">Poids mystique</span>
                    </label>
                    <p style={{ color: "#6B5F8A", fontSize: "11px", marginBottom: "8px" }}>
                      💡 Le nom et prénom de ta mère permettent de calculer le poids mystique de ton identité pour une interprétation plus précise.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Prénom de ta mère"
                        value={form.prenomMere}
                        onChange={(e) => setForm({ ...form, prenomMere: e.target.value })}
                        className="dream-input"
                      />
                      <input
                        type="text"
                        placeholder="Nom de ta mère"
                        value={form.nomMere}
                        onChange={(e) => setForm({ ...form, nomMere: e.target.value })}
                        className="dream-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Erreur */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: "13px" }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Boutons navigation */}
            <div className="flex gap-3 mt-7">
              {step > 0 && step !== 1 && (
                <button onClick={() => { setStep(step - 1); clearError(); }} className="btn-ghost flex-1">
                  ← Retour
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canNext() || loading}
                className="btn-gold flex-1"
                style={{ opacity: canNext() && !loading ? 1 : 0.4, cursor: canNext() && !loading ? "pointer" : "not-allowed" }}
              >
                {loading ? "⏳ Chargement..." : step === 3 ? "🌙 Commencer" : "Continuer →"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center mt-4" style={{ color: "#4A3F6B", fontSize: "12px" }}>
          🔒 Tes données sont chiffrées · RGPD compliant · Aucune revente
        </p>
      </div>
    </div>
  );
}
