"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, RefreshCw, Lock, ExternalLink } from "lucide-react";


const PACK_LABELS: Record<string, string> = {
  decouverte: "🔵 Découverte — 500 FCFA",
  essentiel:  "🟢 Essentiel — 1 500 FCFA",
  complet:    "🟡 Complet — 2 500 FCFA",
};

const STATUT_STYLE: Record<string, { color: string; label: string }> = {
  pending:   { color: "#FB923C", label: "En attente" },
  validated: { color: "#00E5A0", label: "Validé" },
  rejected:  { color: "#F87171", label: "Rejeté" },
  verified:  { color: "#00E5A0", label: "Vérifié" },
  paid:      { color: "#00E5A0", label: "Payé" },
};

interface Payment {
  id: string;
  pack: string;
  montant: number;
  credits: number;
  reference: string | null;
  statut: string;
  createdAt: string;
  user: { prenom: string; nom: string; email: string };
}

interface MaraboutCandidat {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  whatsapp: string;
  ville: string;
  tradition: string;
  specialites: string;
  tarif: number;
  selfie: string | null;
  cin: string | null;
  paymentRef: string | null;
  paymentStatut: string;
  statut: string;
  motifRejet: string | null;
  createdAt: string;
}

const TRADITION_LABELS: Record<string, string> = {
  islam: "☪️ Islam",
  christianisme: "✝️ Christianisme",
  animisme: "🌿 Animisme",
  syncretisme: "🌍 Syncrétisme",
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<"paiements" | "marabouts">("paiements");

  // Paiements
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payFilter, setPayFilter] = useState("pending");

  // Marabouts
  const [marabouts, setMarabouts] = useState<MaraboutCandidat[]>([]);
  const [maraFilter, setMaraFilter] = useState("pending");
  const [motifRejet, setMotifRejet] = useState<Record<string, string>>({});
  const [expandedKyc, setExpandedKyc] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function authenticate() {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: secret }),
    });
    if (res.ok) setAuthenticated(true);
    else setMessage("Mot de passe incorrect");
  }

  async function chargerPaiements() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?statut=${payFilter}`);
      const data = await res.json();
      setPayments(data.payments || []);
    } catch { setMessage("Erreur chargement paiements"); }
    finally { setLoading(false); }
  }

  async function chargerMarabouts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/marabouts?statut=${maraFilter}`);
      const data = await res.json();
      setMarabouts(data.marabouts || []);
    } catch { setMessage("Erreur chargement marabouts"); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!authenticated) return;
    if (tab === "paiements") chargerPaiements();
    else chargerMarabouts();
  }, [authenticated, tab, payFilter, maraFilter]);

  async function actionPaiement(paymentId: string, act: "validate" | "reject") {
    setActionLoading(paymentId);
    setMessage("");
    try {
      const res = await fetch("/api/admin/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action: act }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(act === "validate" ? "✅ Paiement validé, crédits ajoutés" : "❌ Paiement rejeté");
      chargerPaiements();
    } catch (e: unknown) {
      setMessage("Erreur : " + (e instanceof Error ? e.message : "inconnue"));
    } finally { setActionLoading(null); }
  }

  async function actionMarabout(maraboutId: string, act: "validate" | "reject") {
    setActionLoading(maraboutId);
    setMessage("");
    try {
      const res = await fetch("/api/admin/marabouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maraboutId, action: act, motif: motifRejet[maraboutId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(act === "validate" ? "✅ Marabout validé et notifié" : "❌ Marabout rejeté et notifié");
      chargerMarabouts();
    } catch (e: unknown) {
      setMessage("Erreur : " + (e instanceof Error ? e.message : "inconnue"));
    } finally { setActionLoading(null); }
  }

  if (!authenticated) {
    return (
      <div className="above-stars min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(244,200,66,0.15)", border: "1px solid rgba(244,200,66,0.3)" }}>
            <Lock size={26} style={{ color: "#F4C842" }} />
          </div>
          <h1 className="text-xl font-bold mb-6" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>Espace Admin</h1>
          <input type="password" value={secret} onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === "Enter" && authenticate()}
            placeholder="Mot de passe admin" className="dream-input mb-4" />
          {message && <p className="text-sm mb-3" style={{ color: "#F87171" }}>{message}</p>}
          <button onClick={authenticate} className="btn-gold w-full">Accéder</button>
        </motion.div>
      </div>
    );
  }

  const pendingPay = payments.filter(p => p.statut === "pending" && p.reference).length;
  const pendingMara = marabouts.filter(m => m.statut === "pending").length;

  return (
    <div className="above-stars min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-24">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>
            🛡️ Espace Admin
          </h1>
          <button onClick={() => tab === "paiements" ? chargerPaiements() : chargerMarabouts()}
            className="btn-ghost flex items-center gap-2" style={{ padding: "8px 16px" }}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("paiements")}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: tab === "paiements" ? "rgba(244,200,66,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab === "paiements" ? "rgba(244,200,66,0.4)" : "rgba(255,255,255,0.07)"}`,
              color: tab === "paiements" ? "#F4C842" : "#9B8FC2",
            }}>
            💳 Paiements utilisateurs
            {pendingPay > 0 && tab !== "paiements" && (
              <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: "#FB923C", color: "#0D0B2B" }}>{pendingPay}</span>
            )}
          </button>
          <button onClick={() => setTab("marabouts")}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: tab === "marabouts" ? "rgba(244,200,66,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab === "marabouts" ? "rgba(244,200,66,0.4)" : "rgba(255,255,255,0.07)"}`,
              color: tab === "marabouts" ? "#F4C842" : "#9B8FC2",
            }}>
            🧿 Candidatures Marabout
            {pendingMara > 0 && tab !== "marabouts" && (
              <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: "#FB923C", color: "#0D0B2B" }}>{pendingMara}</span>
            )}
          </button>
        </div>

        {message && (
          <div className="p-3 rounded-xl mb-5 text-sm" style={{
            background: message.startsWith("✅") ? "rgba(0,229,160,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${message.startsWith("✅") ? "rgba(0,229,160,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: message.startsWith("✅") ? "#00E5A0" : "#FCA5A5",
          }}>
            {message}
          </div>
        )}

        {/* ── PAIEMENTS ── */}
        {tab === "paiements" && (
          <>
            <div className="flex gap-2 mb-6">
              {["pending", "validated", "rejected", "all"].map(f => (
                <button key={f} onClick={() => setPayFilter(f)}
                  className="px-4 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: payFilter === f ? "rgba(244,200,66,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${payFilter === f ? "rgba(244,200,66,0.4)" : "rgba(255,255,255,0.07)"}`,
                    color: payFilter === f ? "#F4C842" : "#9B8FC2",
                  }}>
                  {f === "pending" ? "En attente" : f === "validated" ? "Validés" : f === "rejected" ? "Rejetés" : "Tous"}
                  {f === "pending" && pendingPay > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs" style={{ background: "#FB923C", color: "#0D0B2B" }}>{pendingPay}</span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20" style={{ color: "#6B5F8A" }}>Chargement...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <p style={{ color: "#6B5F8A" }}>Aucun paiement {payFilter === "pending" ? "en attente" : ""}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map(p => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-semibold" style={{ color: "#F0EDF8" }}>
                            {p.user.prenom} {p.user.nom}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: (STATUT_STYLE[p.statut]?.color || "#999") + "22",
                              color: STATUT_STYLE[p.statut]?.color || "#999",
                              border: `1px solid ${(STATUT_STYLE[p.statut]?.color || "#999")}44`,
                            }}>
                            {STATUT_STYLE[p.statut]?.label || p.statut}
                          </span>
                        </div>
                        <p className="text-xs mb-1" style={{ color: "#9B8FC2" }}>{p.user.email}</p>
                        <p className="text-sm mb-1" style={{ color: "#9B8FC2" }}>{PACK_LABELS[p.pack] || p.pack}</p>
                        {p.reference ? (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs" style={{ color: "#6B5F8A" }}>📱 Numéro Wave :</span>
                            <span className="text-sm font-bold px-3 py-1 rounded-lg"
                              style={{ background: "rgba(244,200,66,0.1)", color: "#F4C842", border: "1px solid rgba(244,200,66,0.3)" }}>
                              {p.reference}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs mt-2" style={{ color: "#6B5F8A" }}>⏳ En attente du numéro Wave</p>
                        )}
                        <p className="text-xs mt-2" style={{ color: "#6B5F8A" }}>
                          {new Date(p.createdAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                      {p.statut === "pending" && p.reference && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => actionPaiement(p.id, "validate")} disabled={actionLoading === p.id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{ background: "rgba(0,229,160,0.15)", color: "#00E5A0", border: "1px solid rgba(0,229,160,0.3)" }}>
                            <Check size={16} />{actionLoading === p.id ? "..." : "Valider"}
                          </button>
                          <button onClick={() => actionPaiement(p.id, "reject")} disabled={actionLoading === p.id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                            <X size={16} />Rejeter
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── MARABOUTS ── */}
        {tab === "marabouts" && (
          <>
            <div className="flex gap-2 mb-6">
              {["pending", "verified", "rejected"].map(f => (
                <button key={f} onClick={() => setMaraFilter(f)}
                  className="px-4 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: maraFilter === f ? "rgba(244,200,66,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${maraFilter === f ? "rgba(244,200,66,0.4)" : "rgba(255,255,255,0.07)"}`,
                    color: maraFilter === f ? "#F4C842" : "#9B8FC2",
                  }}>
                  {f === "pending" ? "En attente" : f === "verified" ? "Vérifiés" : "Rejetés"}
                  {f === "pending" && pendingMara > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs" style={{ background: "#FB923C", color: "#0D0B2B" }}>{pendingMara}</span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20" style={{ color: "#6B5F8A" }}>Chargement...</div>
            ) : marabouts.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <p style={{ color: "#6B5F8A" }}>Aucune candidature {maraFilter === "pending" ? "en attente" : ""}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {marabouts.map(m => {
                  const specs = (() => { try { return JSON.parse(m.specialites); } catch { return []; } })();
                  const isExpanded = expandedKyc === m.id;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="font-semibold" style={{ color: "#F0EDF8" }}>
                              {m.prenom} {m.nom}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: (STATUT_STYLE[m.statut]?.color || "#999") + "22",
                                color: STATUT_STYLE[m.statut]?.color || "#999",
                                border: `1px solid ${(STATUT_STYLE[m.statut]?.color || "#999")}44`,
                              }}>
                              {STATUT_STYLE[m.statut]?.label || m.statut}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3" style={{ color: "#9B8FC2" }}>
                            <span>📧 {m.email}</span>
                            <span>📞 {m.telephone}</span>
                            <span>📱 WhatsApp: {m.whatsapp}</span>
                            <span>📍 {m.ville}</span>
                            <span>{TRADITION_LABELS[m.tradition] || m.tradition}</span>
                            <span>💰 {m.tarif.toLocaleString()} FCFA/consultation</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {specs.map((s: string, i: number) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-md"
                                style={{ background: "rgba(244,200,66,0.08)", color: "#C4A832", border: "1px solid rgba(244,200,66,0.15)" }}>
                                {s}
                              </span>
                            ))}
                          </div>

                          {/* Paiement Wave */}
                          {m.paymentRef ? (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs" style={{ color: "#6B5F8A" }}>💳 Wave :</span>
                              <span className="text-sm font-bold px-3 py-1 rounded-lg"
                                style={{ background: "rgba(244,200,66,0.1)", color: "#F4C842", border: "1px solid rgba(244,200,66,0.3)" }}>
                                {m.paymentRef}
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs mb-3" style={{ color: "#6B5F8A" }}>⏳ Numéro Wave non encore soumis</p>
                          )}

                          {/* KYC */}
                          <button onClick={() => setExpandedKyc(isExpanded ? null : m.id)}
                            className="text-xs flex items-center gap-1.5 mb-3 hover:opacity-80"
                            style={{ color: "#9B8FC2" }}>
                            🪪 {isExpanded ? "Masquer" : "Voir"} les documents KYC
                          </button>
                          {isExpanded && (
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              {m.selfie && (
                                <div>
                                  <p className="text-xs mb-1" style={{ color: "#6B5F8A" }}>📸 Selfie</p>
                                  <img src={m.selfie} alt="Selfie" className="w-full h-32 object-cover rounded-lg" />
                                  <a href={m.selfie} target="_blank" rel="noopener noreferrer"
                                    className="text-xs flex items-center gap-1 mt-1" style={{ color: "#9B8FC2" }}>
                                    <ExternalLink size={10} /> Ouvrir
                                  </a>
                                </div>
                              )}
                              {m.cin && (
                                <div>
                                  <p className="text-xs mb-1" style={{ color: "#6B5F8A" }}>🪪 CNI</p>
                                  <img src={m.cin} alt="CNI" className="w-full h-32 object-cover rounded-lg" />
                                  <a href={m.cin} target="_blank" rel="noopener noreferrer"
                                    className="text-xs flex items-center gap-1 mt-1" style={{ color: "#9B8FC2" }}>
                                    <ExternalLink size={10} /> Ouvrir
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-xs" style={{ color: "#6B5F8A" }}>
                            {new Date(m.createdAt).toLocaleString("fr-FR")}
                          </p>
                        </div>

                        {m.statut === "pending" && (
                          <div className="flex flex-col gap-2 flex-shrink-0 min-w-[160px]">
                            <button onClick={() => actionMarabout(m.id, "validate")}
                              disabled={actionLoading === m.id || !m.paymentRef}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                              style={{
                                background: m.paymentRef ? "rgba(0,229,160,0.15)" : "rgba(255,255,255,0.03)",
                                color: m.paymentRef ? "#00E5A0" : "#6B5F8A",
                                border: `1px solid ${m.paymentRef ? "rgba(0,229,160,0.3)" : "rgba(255,255,255,0.06)"}`,
                              }}>
                              <Check size={16} />
                              {actionLoading === m.id ? "..." : m.paymentRef ? "Valider" : "Attente paiement"}
                            </button>
                            <div>
                              <input value={motifRejet[m.id] || ""}
                                onChange={e => setMotifRejet(prev => ({ ...prev, [m.id]: e.target.value }))}
                                placeholder="Motif de rejet (optionnel)"
                                className="dream-input text-xs mb-1 w-full" style={{ padding: "6px 10px" }} />
                              <button onClick={() => actionMarabout(m.id, "reject")}
                                disabled={actionLoading === m.id}
                                className="flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                                <X size={16} />Rejeter
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
