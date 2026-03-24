"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DreamInterpretation } from "@/app/page";

interface DreamFormProps {
  user: { id: string; prenom: string; nom: string; prenomMere?: string; nomMere?: string; tradition: string; genre: string; age: string };
  onResult: (dream: string, emotions: string[], interpretation: DreamInterpretation) => void;
  onNavigate?: (page: string) => void;
}

const emotions = [
  { id: "peur", label: "😨 Peur" },
  { id: "joie", label: "😊 Joie" },
  { id: "tristesse", label: "😢 Tristesse" },
  { id: "confusion", label: "😵 Confusion" },
  { id: "paix", label: "🕊️ Paix" },
  { id: "anxiete", label: "😰 Anxiété" },
  { id: "excitation", label: "⚡ Excitation" },
  { id: "amour", label: "💖 Amour" },
];

const symbolSuggestions: Record<string, string[]> = {
  eau: ["🌊 Eau", "💧 Pluie", "🌊 Océan", "🏞️ Rivière"],
  maison: ["🏠 Maison", "🚪 Porte", "🏚️ Ruines"],
  serpent: ["🐍 Serpent"],
  voler: ["🦅 Voler", "✈️ Avion"],
  mort: ["⚰️ Mort", "👻 Fantôme"],
  lumiere: ["☀️ Lumière", "⭐ Étoile", "🕯️ Bougie"],
  forêt: ["🌳 Forêt", "🌿 Nature"],
  animal: ["🦁 Lion", "🐦 Oiseau", "🐪 Chameau"],
};

const autoTags = (text: string): string[] => {
  const tags: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes("eau") || lower.includes("mer") || lower.includes("plage")) tags.push("🌊 Eau");
  if (lower.includes("maison") || lower.includes("chambre") || lower.includes("porte")) tags.push("🏠 Maison");
  if (lower.includes("serpent")) tags.push("🐍 Serpent");
  if (lower.includes("voler") || lower.includes("vol")) tags.push("🦅 Voler");
  if (lower.includes("mort") || lower.includes("mourir")) tags.push("⚰️ Mort");
  if (lower.includes("lumière") || lower.includes("soleil") || lower.includes("étoile")) tags.push("☀️ Lumière");
  if (lower.includes("famille") || lower.includes("mère") || lower.includes("père")) tags.push("👨‍👩‍👧 Famille");
  if (lower.includes("argent") || lower.includes("monnaie")) tags.push("💰 Argent");
  if (lower.includes("pluie")) tags.push("🌧️ Pluie");
  return tags;
};

const loadingSteps = [
  "Analyse des symboles de ton rêve...",
  "Consultation des traditions spirituelles...",
  "Génération de ton interprétation personnalisée...",
];

export default function DreamFormPage({ user, onResult, onNavigate }: DreamFormProps) {
  const [dream, setDream] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const tags = autoTags(dream);

  const toggleEmotion = (id: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (dream.trim().length < 10) return;
    setLoading(true);
    setError("");

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dream: dream.trim(),
          emotions: selectedEmotions,
          userId: user.id,
          user: { prenom: user.prenom, nom: user.nom, prenomMere: user.prenomMere, nomMere: user.nomMere, tradition: user.tradition, genre: user.genre, age: user.age },
        }),
      });

      clearInterval(stepInterval);

      if (res.status === 401) {
        setLoading(false);
        onNavigate?.("onboarding");
        return;
      }
      if (res.status === 402) {
        setLoading(false);
        onNavigate?.("tarifs");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur serveur");
      }

      const interpretation: DreamInterpretation = await res.json();
      setLoadingStep(loadingSteps.length - 1);
      await new Promise((r) => setTimeout(r, 400));
      onResult(dream, selectedEmotions, interpretation);
    } catch (err) {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(0);
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Réessaie.");
    }
  };

  if (loading) {
    const steps = loadingSteps;
    return (
      <div className="min-h-screen above-stars flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card-strong p-10 text-center max-w-sm w-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-6 inline-block"
          >
            🌙
          </motion.div>
          <h3 className="font-bold text-xl mb-4" style={{ fontFamily: "Sora, sans-serif" }}>
            L&apos;IA décrypte ton rêve...
          </h3>
          <div className="space-y-3 mb-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: i <= loadingStep ? 1 : 0.3 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: i < loadingStep ? "linear-gradient(135deg,#00E5A0,#00B4D8)"
                      : i === loadingStep ? "linear-gradient(135deg,#F4C842,#E8A020)"
                      : "rgba(255,255,255,0.05)",
                  }}
                >
                  {i < loadingStep ? "✓" : i === loadingStep ? "⟳" : "○"}
                </div>
                <span style={{ color: i === loadingStep ? "#F4C842" : i < loadingStep ? "#00E5A0" : "#6B5F8A", fontSize: "14px" }}>
                  {s}
                </span>
              </motion.div>
            ))}
          </div>
          {/* Loading bar */}
          <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#F4C842,#E8A020)" }}
              animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p style={{ color: "#6B5F8A", fontSize: "11px", marginTop: "14px" }}>
            ✨ Powered by Claude AI
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen above-stars px-4 pt-24 pb-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-5xl mb-3">🌙</div>
          <h1 className="font-bold text-3xl mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
            Raconte ton rêve, <span className="text-gradient-gold">{user.prenom}</span>
          </h1>
          <p style={{ color: "#9B8FC2", fontSize: "14px" }}>
            Décris-le avec le plus de détails possible. Plus c&apos;est précis, plus l&apos;interprétation est juste.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-card-strong p-7 space-y-6">

            {/* Dream textarea */}
            <div>
              <label style={{ color: "#9B8FC2", fontSize: "13px", fontWeight: 500, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                📝 Décris ce que tu as vu dans ton rêve
              </label>
              <textarea
                rows={6}
                placeholder="Ex: J'étais dans une grande maison blanche au bord de la mer. Il y avait de l'eau qui coulait doucement. Je voyais ma mère au loin..."
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                className="dream-input resize-none"
                style={{ lineHeight: 1.7 }}
              />
              <div className="flex justify-between mt-2">
                <p style={{ color: "#6B5F8A", fontSize: "11px" }}>
                  💡 Plus de détails = interprétation plus précise
                </p>
                <p style={{ color: dream.length > 50 ? "#00E5A0" : "#6B5F8A", fontSize: "11px" }}>
                  {dream.length} / 2000
                </p>
              </div>
            </div>

            {/* AI Symbol Tags */}
            <AnimatePresence>
              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "rgba(244,200,66,0.06)", border: "1px solid rgba(244,200,66,0.15)" }}
                  >
                    <p style={{ color: "#F4C842", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>
                      ✨ SYMBOLES DÉTECTÉS PAR L&apos;IA
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="badge-gold"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Emotions */}
            <div>
              <label style={{ color: "#9B8FC2", fontSize: "13px", fontWeight: 500, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                💭 Comment te sentais-tu dans ce rêve ? <span style={{ color: "#6B5F8A" }}>(optionnel)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {emotions.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => toggleEmotion(e.id)}
                    className={`emotion-tag ${selectedEmotions.includes(e.id) ? "selected" : ""}`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tradition reminder */}
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-2xl">
                {user.tradition === "islam" ? "🕌"
                  : user.tradition === "christianisme" ? "✝️"
                  : user.tradition === "psychologie" ? "🧠" : "🌿"}
              </span>
              <div>
                <p style={{ color: "#9B8FC2", fontSize: "13px" }}>
                  Tradition principale : <span style={{ color: "#F4C842", textTransform: "capitalize" }}>{user.tradition}</span>
                </p>
                <p style={{ color: "#6B5F8A", fontSize: "11px" }}>
                  Les 3 autres traditions seront aussi disponibles dans les résultats
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl p-4"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
              >
                <p style={{ color: "#F87171", fontSize: "13px" }}>⚠️ {error}</p>
              </motion.div>
            )}

            {/* Disclaimer */}
            <p style={{ color: "#4A3F6B", fontSize: "11px", textAlign: "center" }}>
              🔒 Ton rêve est chiffré et strictement privé. Nous ne le partageons jamais.
            </p>

            {/* Submit */}
            <motion.button
              whileHover={dream.trim().length > 10 ? { scale: 1.02 } : {}}
              whileTap={dream.trim().length > 10 ? { scale: 0.98 } : {}}
              onClick={handleSubmit}
              disabled={dream.trim().length < 10}
              className="btn-gold w-full"
              style={{
                fontSize: "16px", padding: "16px",
                opacity: dream.trim().length < 10 ? 0.4 : 1,
                cursor: dream.trim().length < 10 ? "not-allowed" : "pointer",
              }}
            >
              🌙 Interpréter mon rêve avec l&apos;IA
            </motion.button>

            {dream.trim().length < 10 && dream.length > 0 && (
              <p style={{ color: "#F4C842", fontSize: "12px", textAlign: "center", marginTop: "-8px" }}>
                Ajoute encore quelques mots pour une meilleure interprétation
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
