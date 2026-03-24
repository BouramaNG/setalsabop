"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
  { mois: "Nov", revenus: 45000 },
  { mois: "Déc", revenus: 62000 },
  { mois: "Jan", revenus: 58000 },
  { mois: "Fév", revenus: 71000 },
  { mois: "Mar", revenus: 87500 },
];

const pendingRequests = [
  { id: 1, name: "Fatou D.", reve: "Rêve d'eau et de lumière", tarif: "2 500 XOF", temps: "Il y a 2h", tradition: "🕌" },
  { id: 2, name: "Mamadou B.", reve: "Serpent dans la maison", tarif: "2 500 XOF", temps: "Il y a 4h", tradition: "🌿" },
  { id: 3, name: "Aminata C.", reve: "Vol au-dessus de la mer", tarif: "2 500 XOF", temps: "Il y a 5h", tradition: "🕌" },
];

const recentReviews = [
  { note: 5, text: "Très précis, Alhamdulillah. Que Dieu le bénisse.", user: "Ibrahima S.", date: "14 Mar" },
  { note: 5, text: "Ma question a été résolue, baraka Allah oo fikk", user: "Fatoumata D.", date: "12 Mar" },
  { note: 4, text: "Bonne interprétation, répond vite. Je recommande.", user: "Ousmane T.", date: "10 Mar" },
];

export default function MaraboutProPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "consultations" | "profil">("dashboard");
  const [acceptedIds, setAcceptedIds] = useState<number[]>([]);
  const [declinedIds, setDeclinedIds] = useState<number[]>([]);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "consultations", label: "Demandes", icon: "💬" },
    { id: "profil", label: "Mon Profil", icon: "👤" },
  ];

  return (
    <div className="min-h-screen above-stars px-4 pt-24 pb-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="glass-card-strong p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#1A0533,#0D1B4B)", border: "2px solid rgba(244,200,66,0.4)", color: "#F4C842" }}
            >
              SI
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-bold text-xl" style={{ fontFamily: "Sora, sans-serif" }}>
                  Serigne Ibrahima FALL
                </h1>
                <span className="badge-gold">🥇 Expert Certifié</span>
              </div>
              <p style={{ color: "#9B8FC2", fontSize: "13px" }}>Thiès · Spécialiste rêves islamiques · 127 consultations · ⭐ 4.9</p>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ background: "#00E5A0", width: "8px", height: "8px", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 8px #00E5A0" }} />
              <span style={{ color: "#00E5A0", fontSize: "13px" }}>En ligne</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? "rgba(244,200,66,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeTab === tab.id ? "rgba(244,200,66,0.3)" : "rgba(255,255,255,0.07)"}`,
                color: activeTab === tab.id ? "#F4C842" : "#9B8FC2",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === "consultations" && (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "#F4C842", color: "#0D0B2B" }}
                >
                  {pendingRequests.filter((r) => !acceptedIds.includes(r.id) && !declinedIds.includes(r.id)).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Revenus Mar.", value: "87 500 XOF", change: "+23%", color: "#00E5A0" },
                { label: "Consultations", value: "34", change: "+5", color: "#F4C842" },
                { label: "Avis reçus", value: "12", change: "ce mois", color: "#A78BFA" },
                { label: "Note moyenne", value: "4.9 ⭐", change: "stable", color: "#F4C842" },
              ].map((kpi, i) => (
                <div key={i} className="glass-card p-4">
                  <p style={{ color: "#6B5F8A", fontSize: "11px", marginBottom: "6px" }}>{kpi.label}</p>
                  <p className="font-bold text-lg" style={{ color: kpi.color, fontFamily: "Sora, sans-serif" }}>{kpi.value}</p>
                  <p style={{ color: "#6B5F8A", fontSize: "11px", marginTop: "2px" }}>{kpi.change}</p>
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <div className="glass-card p-5">
              <h3 className="font-bold mb-4" style={{ fontFamily: "Sora, sans-serif", color: "#F0EDF8" }}>
                💰 Évolution des revenus (5 derniers mois)
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={revenueData}>
                  <XAxis dataKey="mois" tick={{ fill: "#9B8FC2", fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "rgba(13,11,43,0.95)", border: "1px solid rgba(244,200,66,0.2)", borderRadius: "10px", color: "#F0EDF8" }}
                    formatter={(v) => [`${Number(v).toLocaleString()} XOF`]}
                  />
                  <Bar dataKey="revenus" fill="#F4C842" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent reviews */}
            <div className="glass-card p-5">
              <h3 className="font-bold mb-4" style={{ fontFamily: "Sora, sans-serif", color: "#F0EDF8" }}>
                ⭐ Derniers avis reçus
              </h3>
              <div className="space-y-3">
                {recentReviews.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#F4C842,#E8A020)", color: "#0D0B2B" }}>
                      {r.user[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ color: "#F4C842" }}>{"★".repeat(r.note)}</span>
                        <span style={{ color: "#F0EDF8", fontSize: "13px", fontWeight: 500 }}>{r.user}</span>
                        <span style={{ color: "#6B5F8A", fontSize: "11px", marginLeft: "auto" }}>{r.date}</span>
                      </div>
                      <p style={{ color: "#9B8FC2", fontSize: "13px" }}>&quot;{r.text}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick link to pending */}
            <button
              onClick={() => setActiveTab("consultations")}
              className="glass-card w-full p-4 flex items-center justify-between"
              style={{ border: "1px solid rgba(244,200,66,0.15)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">💬</span>
                <div className="text-left">
                  <p style={{ color: "#F0EDF8", fontWeight: 600 }}>3 demandes en attente</p>
                  <p style={{ color: "#9B8FC2", fontSize: "12px" }}>Réponds pour améliorer ton taux de réponse</p>
                </div>
              </div>
              <span style={{ color: "#F4C842", fontSize: "20px" }}>→</span>
            </button>
          </motion.div>
        )}

        {/* CONSULTATIONS TAB */}
        {activeTab === "consultations" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
              Demandes en attente
            </h3>

            {pendingRequests.map((req, i) => {
              const isAccepted = acceptedIds.includes(req.id);
              const isDeclined = declinedIds.includes(req.id);
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5"
                  style={{
                    border: isAccepted ? "1px solid rgba(0,229,160,0.3)"
                      : isDeclined ? "1px solid rgba(248,113,113,0.3)"
                      : "1px solid rgba(255,255,255,0.07)"
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#1A0533,#0D1B4B)", color: "#F4C842", border: "1px solid rgba(244,200,66,0.2)" }}>
                        {req.name[0]}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: "#F0EDF8" }}>{req.name}</p>
                        <p style={{ color: "#9B8FC2", fontSize: "13px" }}>{req.reve}</p>
                        <p style={{ color: "#6B5F8A", fontSize: "11px", marginTop: "2px" }}>
                          {req.tradition} · {req.tarif} · {req.temps}
                        </p>
                      </div>
                    </div>

                    {!isAccepted && !isDeclined ? (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setAcceptedIds([...acceptedIds, req.id])}
                          className="btn-gold"
                          style={{ padding: "8px 14px", fontSize: "12px", background: "linear-gradient(135deg,#00E5A0,#00B4D8)", color: "#0D0B2B" }}
                        >
                          ✓ Accepter
                        </button>
                        <button
                          onClick={() => setDeclinedIds([...declinedIds, req.id])}
                          className="btn-ghost"
                          style={{ padding: "8px 14px", fontSize: "12px", borderColor: "rgba(248,113,113,0.3)", color: "#F87171" }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className={isAccepted ? "badge-verified" : ""} style={isDeclined ? { color: "#F87171", fontSize: "12px" } : {}}>
                        {isAccepted ? "✓ Acceptée" : "✕ Déclinée"}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {pendingRequests.every((r) => acceptedIds.includes(r.id) || declinedIds.includes(r.id)) && (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">✅</div>
                <p style={{ color: "#9B8FC2" }}>Toutes les demandes ont été traitées!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* PROFIL TAB */}
        {activeTab === "profil" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4" style={{ fontFamily: "Sora, sans-serif", color: "#F0EDF8" }}>
                Informations du profil
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Nom complet", value: "Serigne Ibrahima FALL" },
                  { label: "Ville", value: "Thiès, Sénégal" },
                  { label: "Tarif par défaut", value: "2 500 XOF" },
                  { label: "Paiement", value: "Wave Sénégal · +221 77 xxx xxx" },
                ].map((field, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div>
                      <p style={{ color: "#6B5F8A", fontSize: "11px" }}>{field.label}</p>
                      <p style={{ color: "#F0EDF8", fontSize: "14px", fontWeight: 500 }}>{field.value}</p>
                    </div>
                    <button style={{ color: "#F4C842", fontSize: "12px" }}>Modifier</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification badges */}
            <div className="glass-card p-5">
              <h3 className="font-bold mb-4" style={{ fontFamily: "Sora, sans-serif", color: "#F0EDF8" }}>
                🛡️ Vérification DreamInsight
              </h3>
              <div className="space-y-3">
                {[
                  { step: "Identité vérifiée (CNI)", done: true },
                  { step: "Adresse confirmée", done: true },
                  { step: "2 références communautaires", done: true },
                  { step: "Test d'interprétation", done: true },
                  { step: "50+ avis vérifiés → Badge Expert", done: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{ background: item.done ? "linear-gradient(135deg,#00E5A0,#00B4D8)" : "rgba(255,255,255,0.05)", color: item.done ? "#0D0B2B" : "#6B5F8A" }}>
                      {item.done ? "✓" : "○"}
                    </div>
                    <p style={{ color: item.done ? "#F0EDF8" : "#6B5F8A", fontSize: "14px" }}>{item.step}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
