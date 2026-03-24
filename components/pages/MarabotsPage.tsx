"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, MessageCircle, Shield, X, ZoomIn } from "lucide-react";

interface Marabout {
  id: string;
  prenom: string;
  nom: string;
  ville: string;
  tradition: string;
  specialites: string;
  tarif: number;
  whatsapp: string;
  selfie: string | null;
  rating: number;
  totalAvis: number;
}

const TRADITION_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  islam:         { label: "Islam",         icon: "☪️", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  christianisme: { label: "Christianisme", icon: "✝️", color: "#60A5FA", bg: "rgba(96,165,250,0.12)"  },
  animisme:      { label: "Animisme",      icon: "🌿", color: "#34D399", bg: "rgba(52,211,153,0.12)"  },
  syncretisme:   { label: "Syncrétisme",   icon: "🌍", color: "#FBBF24", bg: "rgba(251,191,36,0.12)"  },
};

const VILLES_FILTER = ["Toutes", "Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack", "Touba", "Diourbel", "Tambacounda"];
const TRADITIONS_FILTER = ["Toutes", "islam", "christianisme", "animisme", "syncretisme"];

function getSpecs(m: Marabout): string[] {
  try { return JSON.parse(m.specialites); } catch { return []; }
}
function initiales(p: string, n: string) { return `${p?.[0] ?? ""}${n?.[0] ?? ""}`.toUpperCase(); }
function openWhatsApp(whatsapp: string, nom: string) {
  const number = whatsapp.replace(/\D/g, "");
  const msg = encodeURIComponent(`Bonjour ${nom}, je vous contacte via SetalSaBOP. J'aimerais une consultation spirituelle.`);
  window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
}
function StarRow({ rating, total }: { rating: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={12} fill={s <= Math.round(rating) ? "#F4C842" : "none"}
          style={{ color: s <= Math.round(rating) ? "#F4C842" : "rgba(244,200,66,0.2)" }} />
      ))}
      {total > 0
        ? <span className="text-xs font-semibold ml-1" style={{ color: "#F4C842" }}>{rating.toFixed(1)}</span>
        : <span className="text-xs ml-1" style={{ color: "#6B5F8A" }}>Nouveau</span>}
      {total > 0 && <span className="text-xs" style={{ color: "#6B5F8A" }}>({total})</span>}
    </div>
  );
}

/* ── Carte marabout style "réseau social" ── */
function MaraboutCard({ m, onClick }: { m: Marabout; onClick: () => void }) {
  const specs = getSpecs(m);
  const trad = TRADITION_META[m.tradition];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>

      {/* ── Couverture floue ── */}
      <div className="relative h-24 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A0533, #0D1B4B)" }}>
        {m.selfie && (
          <img src={m.selfie} alt="" aria-hidden
            className="w-full h-full object-cover object-top scale-110"
            style={{ filter: "blur(12px) brightness(0.4)", transform: "scale(1.2)" }} />
        )}
        {/* Badge CERTIFIÉ */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,229,160,0.15)", border: "1px solid rgba(0,229,160,0.4)", backdropFilter: "blur(8px)" }}>
          <Shield size={10} style={{ color: "#00E5A0" }} />
          <span style={{ color: "#00E5A0", fontSize: "10px", fontWeight: 700 }}>CERTIFIÉ</span>
        </div>
        {/* Badge tradition */}
        {trad && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: trad.bg, border: `1px solid ${trad.color}55`, backdropFilter: "blur(8px)" }}>
            <span style={{ fontSize: "10px" }}>{trad.icon}</span>
            <span style={{ color: trad.color, fontSize: "10px", fontWeight: 600 }}>{trad.label}</span>
          </div>
        )}
      </div>

      {/* ── Photo de profil ronde ── */}
      <div className="px-5 pb-4">
        <div className="relative -mt-10 mb-3 flex items-end justify-between">
          <div className="relative">
            {m.selfie ? (
              <img src={m.selfie} alt={`${m.prenom} ${m.nom}`}
                className="w-20 h-20 rounded-full object-cover object-top"
                style={{ border: "3px solid #0D0B2B", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }} />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ border: "3px solid #0D0B2B", background: "linear-gradient(135deg,#1A0533,#0D1B4B)", color: "#F4C842", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
                {initiales(m.prenom, m.nom)}
              </div>
            )}
            {/* Point vert "actif" */}
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full"
              style={{ background: "#00E5A0", border: "2px solid #0D0B2B", boxShadow: "0 0 6px #00E5A0" }} />
          </div>
          {/* Bouton WhatsApp flottant */}
          <button
            onClick={e => { e.stopPropagation(); openWhatsApp(m.whatsapp, `${m.prenom} ${m.nom}`); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: "linear-gradient(135deg,#25D366,#128C4C)", color: "white", boxShadow: "0 4px 12px rgba(37,211,102,0.3)" }}>
            <MessageCircle size={13} /> WhatsApp
          </button>
        </div>

        {/* Nom + ville */}
        <h3 className="font-bold text-base leading-tight mb-0.5" style={{ color: "#F0EDF8", fontFamily: "Sora" }}>
          {m.prenom} {m.nom}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          <MapPin size={11} style={{ color: "#6B5F8A" }} />
          <span style={{ color: "#6B5F8A", fontSize: "12px" }}>{m.ville}</span>
        </div>

        <StarRow rating={m.rating} total={m.totalAvis} />

        {/* Spécialités */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {specs.slice(0, 2).map((s, j) => (
            <span key={j} className="text-xs px-2 py-1 rounded-lg"
              style={{ background: "rgba(244,200,66,0.07)", border: "1px solid rgba(244,200,66,0.15)", color: "#C4A832" }}>
              {s}
            </span>
          ))}
          {specs.length > 2 && (
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", color: "#6B5F8A" }}>
              +{specs.length - 2}
            </span>
          )}
        </div>

        {/* Tarif */}
        <div className="mt-3 pt-3 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <span className="font-bold text-base" style={{ color: "#F4C842", fontFamily: "Sora" }}>
              {m.tarif.toLocaleString()}
            </span>
            <span className="text-xs ml-1" style={{ color: "#6B5F8A" }}>FCFA / consultation</span>
          </div>
          <span className="text-xs" style={{ color: "#9B8FC2" }}>Voir profil →</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function MarabotsPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [marabouts, setMarabouts] = useState<Marabout[]>([]);
  const [loading, setLoading] = useState(true);
  const [villeFilter, setVilleFilter] = useState("Toutes");
  const [traditionFilter, setTraditionFilter] = useState("Toutes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Marabout | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState(false);

  useEffect(() => {
    fetch("/api/marabout/list")
      .then(r => r.json())
      .then(data => { setMarabouts(data.marabouts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = marabouts.filter(m => {
    if (villeFilter !== "Toutes" && m.ville !== villeFilter) return false;
    if (traditionFilter !== "Toutes" && m.tradition !== traditionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!`${m.prenom} ${m.nom}`.toLowerCase().includes(q) && !m.ville.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen above-stars px-4 pt-24 pb-16">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
            style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00E5A0", boxShadow: "0 0 8px #00E5A0", display: "inline-block" }} />
            <span style={{ color: "#00E5A0", fontSize: "12px", fontWeight: 600 }}>
              {loading ? "..." : `${marabouts.length} Marabout${marabouts.length !== 1 ? "s" : ""} Certifié${marabouts.length !== 1 ? "s" : ""}`}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "Sora" }}>
            Marabouts <span className="text-gradient-gold">Certifiés</span>
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: "#9B8FC2" }}>
            Identité vérifiée · Photo réelle · Contact WhatsApp direct
          </p>
        </motion.div>

        {/* Garanties */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { icon: "🪪", text: "Identité vérifiée" },
            { icon: "📸", text: "Photo réelle" },
            { icon: "💙", text: "Paiement confirmé" },
            { icon: "📱", text: "WhatsApp direct" },
            { icon: "🛡️", text: "Zéro arnaque" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9B8FC2" }}>
              <span>{b.icon}</span><span>{b.text}</span>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="space-y-3 mb-8">
          <input type="text" placeholder="🔍 Rechercher par nom ou ville..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="dream-input w-full" />
          <div className="flex flex-wrap gap-2">
            {VILLES_FILTER.map(v => (
              <button key={v} onClick={() => setVilleFilter(v)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: villeFilter === v ? "rgba(244,200,66,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${villeFilter === v ? "rgba(244,200,66,0.5)" : "rgba(255,255,255,0.08)"}`,
                  color: villeFilter === v ? "#F4C842" : "#9B8FC2",
                }}>{v}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TRADITIONS_FILTER.map(t => {
              const meta = TRADITION_META[t];
              return (
                <button key={t} onClick={() => setTraditionFilter(t)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5"
                  style={{
                    background: traditionFilter === t ? (meta?.bg || "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.04)",
                    border: `1px solid ${traditionFilter === t ? (meta?.color || "#F4C842") + "66" : "rgba(255,255,255,0.08)"}`,
                    color: traditionFilter === t ? (meta?.color || "#F4C842") : "#9B8FC2",
                  }}>
                  {meta && <span>{meta.icon}</span>}
                  {t === "Toutes" ? "Toutes traditions" : meta?.label}
                </button>
              );
            })}
          </div>
          {!loading && <p style={{ color: "#6B5F8A", fontSize: "13px" }}>{filtered.length} marabout{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}</p>}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4 animate-pulse">🧿</div>
            <p style={{ color: "#9B8FC2" }}>Chargement...</p>
          </div>
        )}

        {/* Vide */}
        {!loading && marabouts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🧿</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#F0EDF8" }}>Bientôt disponible</h3>
            <p className="text-sm mb-6" style={{ color: "#9B8FC2" }}>Les premiers marabouts vérifiés arrivent bientôt.</p>
            {onNavigate && <button onClick={() => onNavigate("marabout-signup")} className="btn-gold">Devenir Marabout</button>}
          </div>
        )}

        {/* Grille */}
        {!loading && filtered.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((m, i) => (
              <MaraboutCard key={m.id} m={m} onClick={() => { setSelected(m); setZoomPhoto(false); }} />
            ))}
          </div>
        )}

        {/* Aucun résultat */}
        {!loading && marabouts.length > 0 && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="mb-4" style={{ color: "#9B8FC2" }}>Aucun marabout avec ces filtres.</p>
            <button onClick={() => { setVilleFilter("Toutes"); setTraditionFilter("Toutes"); setSearchQuery(""); }} className="btn-ghost">Réinitialiser</button>
          </div>
        )}

        {/* CTA */}
        {!loading && (
          <div className="mt-12 rounded-2xl p-8 text-center"
            style={{ background: "linear-gradient(135deg,rgba(244,200,66,0.06),rgba(167,139,250,0.06))", border: "1px solid rgba(244,200,66,0.15)" }}>
            <div className="text-4xl mb-3">🧿</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Sora", color: "#F0EDF8" }}>Vous êtes marabout ?</h3>
            <p className="text-sm mb-5" style={{ color: "#9B8FC2" }}>Rejoignez la plateforme · Identité vérifiée · Badge Certifié · WhatsApp direct</p>
            {onNavigate && <button onClick={() => onNavigate("marabout-signup")} className="btn-gold">Rejoindre SetalSaBOP · 2 500 FCFA</button>}
          </div>
        )}
      </div>

      {/* ── MODAL PROFIL ── */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
            onClick={() => setSelected(null)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: "#0D0B2B", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}
              onClick={e => e.stopPropagation()}>

              {/* ── Couverture floue ── */}
              <div className="relative h-32 overflow-hidden"
                style={{ background: "linear-gradient(135deg,#1A0533,#0D1B4B)" }}>
                {selected.selfie && (
                  <img src={selected.selfie} alt="" aria-hidden
                    className="w-full h-full object-cover"
                    style={{ filter: "blur(16px) brightness(0.35)", transform: "scale(1.3)" }} />
                )}
                <button onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", color: "white" }}>
                  <X size={16} />
                </button>
              </div>

              <div className="px-5 pb-6">
                {/* ── Photo profil ronde + badge ── */}
                <div className="relative -mt-12 mb-4 flex items-end justify-between">
                  <div className="relative group cursor-pointer" onClick={() => selected.selfie && setZoomPhoto(true)}>
                    {selected.selfie ? (
                      <img src={selected.selfie} alt={`${selected.prenom} ${selected.nom}`}
                        className="w-24 h-24 rounded-full object-cover object-top transition-transform group-hover:scale-105"
                        style={{ border: "4px solid #0D0B2B", boxShadow: "0 4px 20px rgba(0,0,0,0.6)" }} />
                    ) : (
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
                        style={{ border: "4px solid #0D0B2B", background: "linear-gradient(135deg,#1A0533,#0D1B4B)", color: "#F4C842" }}>
                        {initiales(selected.prenom, selected.nom)}
                      </div>
                    )}
                    {selected.selfie && (
                      <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(0,0,0,0.5)" }}>
                        <ZoomIn size={20} style={{ color: "white" }} />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full"
                      style={{ background: "#00E5A0", border: "2px solid #0D0B2B", boxShadow: "0 0 6px #00E5A0" }} />
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-1"
                    style={{ background: "rgba(0,229,160,0.12)", border: "1px solid rgba(0,229,160,0.4)" }}>
                    <Shield size={12} style={{ color: "#00E5A0" }} />
                    <span style={{ color: "#00E5A0", fontSize: "11px", fontWeight: 700 }}>CERTIFIÉ</span>
                  </div>
                </div>

                {/* Nom + ville */}
                <h3 className="text-2xl font-bold mb-1" style={{ color: "#F0EDF8", fontFamily: "Sora" }}>
                  {selected.prenom} {selected.nom}
                </h3>
                <div className="flex items-center gap-1 mb-3">
                  <MapPin size={13} style={{ color: "#9B8FC2" }} />
                  <span style={{ color: "#9B8FC2", fontSize: "13px" }}>{selected.ville}</span>
                </div>
                <StarRow rating={selected.rating} total={selected.totalAvis} />

                {/* Tradition */}
                {TRADITION_META[selected.tradition] && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: TRADITION_META[selected.tradition].bg, border: `1px solid ${TRADITION_META[selected.tradition].color}44` }}>
                    <span>{TRADITION_META[selected.tradition].icon}</span>
                    <span className="text-sm font-semibold" style={{ color: TRADITION_META[selected.tradition].color }}>
                      {TRADITION_META[selected.tradition].label}
                    </span>
                  </div>
                )}

                {/* Spécialités */}
                <div className="mt-4">
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#6B5F8A" }}>Spécialités</p>
                  <div className="flex flex-wrap gap-2">
                    {getSpecs(selected).map((s, i) => (
                      <span key={i} className="text-sm px-3 py-1.5 rounded-lg"
                        style={{ background: "rgba(244,200,66,0.07)", border: "1px solid rgba(244,200,66,0.18)", color: "#C4A832" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Garantie */}
                <div className="mt-4 p-3 rounded-xl flex items-start gap-3"
                  style={{ background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.12)" }}>
                  <Shield size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#00E5A0" }} />
                  <p style={{ color: "#9B8FC2", fontSize: "12px", lineHeight: 1.6 }}>
                    Profil vérifié manuellement — selfie + carte d'identité confirmés. Paiement Wave validé.
                  </p>
                </div>

                {/* Tarif + CTA */}
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#F4C842", fontFamily: "Sora" }}>
                      {selected.tarif.toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                    </p>
                    <p style={{ color: "#6B5F8A", fontSize: "12px" }}>par consultation</p>
                  </div>
                  <button onClick={() => openWhatsApp(selected.whatsapp, `${selected.prenom} ${selected.nom}`)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: "linear-gradient(135deg,#25D366,#128C4C)", color: "white", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}>
                    <MessageCircle size={16} />
                    Contacter sur WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ZOOM PHOTO ── */}
      <AnimatePresence>
        {zoomPhoto && selected?.selfie && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.95)" }}
            onClick={() => setZoomPhoto(false)}>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              src={selected.selfie} alt={`${selected.prenom} ${selected.nom}`}
              className="max-w-sm w-full rounded-2xl object-cover"
              style={{ maxHeight: "80vh", boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}
              onClick={e => e.stopPropagation()} />
            <button onClick={() => setZoomPhoto(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
