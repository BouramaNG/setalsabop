"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

interface JournalPageProps {
  user: { prenom: string; nom: string; tradition: string };
  onNavigate: (page: string) => void;
  embedded?: boolean;
}

interface JournalEntry {
  id: number;
  date: string;
  title: string;
  emotion: string;
  symboles: string[];
  tradition: string;
  resume: string;
  fullDream?: string;
}

const SYMBOL_COLORS = ["#60A5FA", "#A78BFA", "#F4C842", "#00E5A0", "#FB923C", "#F472B6"];

const emotionColors: Record<string, string> = {
  paix: "#00E5A0", joie: "#F4C842", nostalgie: "#A78BFA",
  peur: "#F87171", confusion: "#60A5FA", tristesse: "#60A5FA",
  anxiete: "#FB923C", amour: "#F472B6", excitation: "#FCD34D", neutre: "#9B8FC2",
};

const buildSymbolData = (dreams: JournalEntry[]) => {
  const counts: Record<string, number> = {};
  dreams.forEach((d) => d.symboles.forEach((s) => { counts[s] = (counts[s] || 0) + 1; }));
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([symbole, count], i) => ({ symbole, count, fill: SYMBOL_COLORS[i] }));
};

const buildEmotionData = (dreams: JournalEntry[]) => {
  const counts: Record<string, number> = {};
  dreams.forEach((d) => { counts[d.emotion] = (counts[d.emotion] || 0) + 1; });
  return Object.entries(counts).map(([emotion, value]) => ({ emotion, value }));
};

const buildWeeklyData = (dreams: JournalEntry[]) => {
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const counts: Record<string, number> = {};
  days.forEach((d) => (counts[d] = 0));
  const now = new Date();
  dreams.forEach((d) => {
    const date = new Date(d.id); // id = timestamp
    const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diff < 7) counts[days[date.getDay()]]++;
  });
  return days.slice(1).concat(days[0]).map((jour) => ({ jour, reves: counts[jour] }));
};

export default function JournalPage({ user, onNavigate, embedded }: JournalPageProps) {
  const [dreams, setDreams] = useState<JournalEntry[]>([]);
  const [selectedDream, setSelectedDream] = useState<JournalEntry | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("dreaminsight_journal");
    if (saved) {
      try { setDreams(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const symbolData = buildSymbolData(dreams);
  const emotionData = buildEmotionData(dreams);
  const weeklyData = buildWeeklyData(dreams);

  return (
    <div className={`above-stars ${embedded ? "" : "min-h-screen px-4 pt-24"} pb-10`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        {!embedded && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
              Mon <span className="text-gradient-gold">Journal</span>
            </h1>
            <p style={{ color: "#9B8FC2", fontSize: "14px" }}>
              {dreams.length} rêve{dreams.length !== 1 ? "s" : ""} enregistré{dreams.length !== 1 ? "s" : ""} · {user.prenom} {user.nom}
            </p>
          </div>
          <button onClick={() => onNavigate("dream")} className="btn-gold" style={{ padding: "10px 20px", fontSize: "14px" }}>
            + Nouveau rêve
          </button>
        </motion.div>
        )}

        {/* Stats row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Rêves enregistrés", value: String(dreams.length), icon: "🌙", color: "#F4C842" },
            { label: "Symbole fréquent", value: symbolData[0]?.symbole || "—", icon: "🔁", color: "#60A5FA" },
            { label: "Émotion dominante", value: emotionData.sort((a,b) => b.value - a.value)[0]?.emotion || "—", icon: "😊", color: "#00E5A0" },
            { label: "Cette semaine", value: String(weeklyData.reduce((a,b) => a + b.reves, 0)), icon: "📅", color: "#A78BFA" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 + 0.1 }}
              className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{stat.icon}</span>
                <p style={{ color: "#6B5F8A", fontSize: "11px" }}>{stat.label}</p>
              </div>
              <p className="font-bold text-lg" style={{ color: stat.color, fontFamily: "Sora, sans-serif" }}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Symbol chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-5">
            <h3 className="font-bold mb-4" style={{ fontFamily: "Sora, sans-serif", color: "#F0EDF8" }}>
              🔁 Symboles Récurrents
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={symbolData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="symbole" type="category" width={100} tick={{ fill: "#9B8FC2", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "rgba(13,11,43,0.95)", border: "1px solid rgba(244,200,66,0.2)", borderRadius: "10px", color: "#F0EDF8" }}
                  formatter={(value) => [`${value}x`, "Occurrences"]}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {symbolData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Emotion radar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card p-5">
            <h3 className="font-bold mb-4" style={{ fontFamily: "Sora, sans-serif", color: "#F0EDF8" }}>
              💭 Humeur dans les rêves
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={emotionData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="emotion" tick={{ fill: "#9B8FC2", fontSize: 11 }} />
                <Radar name="Émotions" dataKey="value" stroke="#F4C842" fill="#F4C842" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Weekly activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass-card p-5 mb-6">
          <h3 className="font-bold mb-4" style={{ fontFamily: "Sora, sans-serif", color: "#F0EDF8" }}>
            📅 Activité cette semaine
          </h3>
          <div className="flex gap-2 items-end justify-between">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: d.reves * 30 + 8 }}
                  transition={{ delay: i * 0.05 + 0.3 }}
                  className="w-full rounded-lg"
                  style={{
                    background: d.reves > 0
                      ? "linear-gradient(180deg, #F4C842, #E8A020)"
                      : "rgba(255,255,255,0.04)",
                    minHeight: "8px",
                    boxShadow: d.reves > 0 ? "0 0 10px rgba(244,200,66,0.2)" : "none",
                  }}
                />
                <span style={{ color: "#6B5F8A", fontSize: "11px" }}>{d.jour}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dream list */}
        <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "Sora, sans-serif" }}>
          Tes rêves récents
        </h3>

        {dreams.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌙</div>
            <p style={{ color: "#9B8FC2", marginBottom: "12px" }}>Ton journal est vide pour l&apos;instant.</p>
            <button onClick={() => onNavigate("dream")} className="btn-gold" style={{ padding: "12px 28px", fontSize: "14px" }}>
              ✨ Interpréter mon premier rêve
            </button>
          </div>
        )}

        <div className="space-y-3">
          {dreams.map((dream, i) => (
            <motion.div
              key={dream.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 + 0.3 }}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedDream(selectedDream?.id === dream.id ? null : dream)}
              className="glass-card p-4 cursor-pointer"
              style={{ border: selectedDream?.id === dream.id ? "1px solid rgba(244,200,66,0.2)" : "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {dream.emotion === "paix" ? "🕊️" : dream.emotion === "joie" ? "😊" : dream.emotion === "peur" ? "😨" : dream.emotion === "nostalgie" ? "💭" : dream.emotion === "amour" ? "💖" : dream.emotion === "excitation" ? "⚡" : "😵"}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: "#F0EDF8" }}>{dream.title}</h4>
                    <p style={{ color: "#6B5F8A", fontSize: "11px" }}>{dream.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ background: emotionColors[dream.emotion] || "#9B8FC2", width: "8px", height: "8px", borderRadius: "50%", display: "inline-block" }} />
                  <span style={{ color: "#6B5F8A", fontSize: "11px", textTransform: "capitalize" }}>{dream.emotion}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {dream.symboles.map((s, j) => (
                  <span key={j} className="badge-gold" style={{ fontSize: "10px", padding: "2px 8px" }}>{s}</span>
                ))}
              </div>

              {selectedDream?.id === dream.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <div className="separator my-2" />
                  <p style={{ color: "#9B8FC2", fontSize: "13px", fontStyle: "italic", lineHeight: 1.6 }}>
                    &quot;{dream.resume}&quot;
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigate("dream"); }}
                    className="btn-ghost mt-3"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                  >
                    🔍 Réanalyser
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Insight IA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-6 glass-card p-5"
          style={{ border: "1px solid rgba(192,132,252,0.2)", background: "rgba(192,132,252,0.04)" }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="font-bold text-sm mb-2" style={{ color: "#C084FC" }}>INSIGHT IA · CE MOIS</p>
              <p style={{ color: "#9B8FC2", fontSize: "14px", lineHeight: 1.7 }}>
                Tes rêves récurrents d&apos;eau (8x ce mois) indiquent une période de <strong style={{ color: "#F0EDF8" }}>transition émotionnelle profonde</strong>. Combinés à tes rêves de maison, cela suggère que tu réfléchis à ton foyer et à ta famille. C&apos;est un moment propice pour la méditation et le dialogue avec tes proches.
              </p>
              <button onClick={() => onNavigate("marabouts")} className="btn-ghost mt-3" style={{ padding: "7px 14px", fontSize: "12px" }}>
                🧿 Discuter avec un marabout
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
