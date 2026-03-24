"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Pages bloquées — affichent une modale "bientôt disponible"
const COMING_SOON = ["marabouts"];

interface NavbarProps {
  current: string;
  onNavigate: (page: string) => void;
  user?: { prenom: string; nom: string; tradition: string } | null;
  onLogout?: () => void;
  credits?: number | null;
}

export default function Navbar({ current, onNavigate, user, onLogout, credits }: NavbarProps) {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [plusOpen, setPlusOpen]     = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Liens principaux (toujours visibles desktop)
  const mainLinks = [
    { id: "dream",           label: "Mon Rêve",         icon: "🌙" },
    { id: "numerologie",     label: "Numérologie",      icon: "🔢" },
    { id: "compatibilite",   label: "Compatibilité",    icon: "💞" },
    { id: "marabouts",       label: "Marabouts",        icon: "🧿" },
    { id: "tarifs",          label: "Tarifs",           icon: "💳" },
    { id: "marabout-signup", label: "Devenir Marabout", icon: "🌟" },
  ];

  // Plus aucun lien secondaire
  const moreLinks: typeof mainLinks = [];

  const allLinks = [...mainLinks, ...moreLinks];

  function nav(id: string) {
    if (COMING_SOON.includes(id)) {
      setShowComingSoon(true);
      setMenuOpen(false);
      return;
    }
    onNavigate(id);
    setMenuOpen(false);
    setPlusOpen(false);
    setUserMenuOpen(false);
  }

  return (
    <>
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(6,4,26,0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="w-full max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <button onClick={() => nav("home")} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #1A0533, #0D1B4B)", border: "1px solid rgba(244,200,66,0.3)" }}>
            🌙
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-bold text-base" style={{ fontFamily: "Sora, sans-serif", letterSpacing: "0.01em" }}>
              <span style={{ color: "#F4C842", fontStyle: "italic" }}>Setal</span>
              <span style={{ color: "#F0EDF8" }}>Sa</span>
              <span style={{
                background: "linear-gradient(135deg, #00E5A0, #F4C842)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 900,
                letterSpacing: "0.05em",
              }}>BOP</span>
            </span>
            <span className="text-[9px] tracking-widest uppercase" style={{ color: "#6B5F8A", letterSpacing: "0.15em" }}>
              La Voyance autrement !
            </span>
          </div>
        </button>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center justify-evenly flex-1">
          {mainLinks.map(link => (
            <button key={link.id} onClick={() => nav(link.id)}
              className={`nav-link relative ${current === link.id ? "active" : ""}`}
              style={{ padding: "10px 18px", fontSize: "14px" }}>
              <span>{link.icon}</span>
              <span>{link.label}</span>
              {COMING_SOON.includes(link.id) && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "linear-gradient(135deg, #F4C842, #E8A020)", color: "#0D0B2B", letterSpacing: "0.05em" }}>
                  NEW
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-white/5 transition-colors">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #F4C842, #E8A020)", color: "#0D0B2B" }}>
                    {user.prenom?.[0] ?? "?"}
                  </div>
                  {credits !== null && credits !== undefined && (
                    <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold px-1"
                      style={{ background: credits > 0 ? "linear-gradient(135deg, #4ADE80, #16A34A)" : "#EF4444", color: "#fff", border: "1.5px solid rgba(13,11,43,0.9)" }}>
                      {credits}
                    </div>
                  )}
                </div>
                <span className="text-sm hidden xl:block max-w-[80px] truncate" style={{ color: "#9B8FC2" }}>
                  {user.prenom}
                </span>
                <ChevronDown size={13} style={{ color: "#6B5F8A" }} className={`transition-transform hidden xl:block ${userMenuOpen ? "rotate-180" : ""}`}/>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-11 w-48 rounded-xl overflow-hidden z-50"
                    style={{ background: "rgba(13,11,43,0.98)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {credits !== null && credits !== undefined && (
                      <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <span className="text-xs" style={{ color: "#9B8FC2" }}>Crédits</span>
                        <span className="text-sm font-bold" style={{ color: credits > 0 ? "#4ADE80" : "#EF4444" }}>
                          {credits} crédit{credits !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    <button onClick={() => nav("profil")} className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors" style={{ color: "#F0EDF8" }}>
                      👤 Mon Profil & Journal
                    </button>
                    <button onClick={() => nav("marabout-pro")} className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors" style={{ color: "#F0EDF8" }}>
                      ⭐ Espace Pro
                    </button>
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 12px" }}/>
                    <button onClick={() => { onLogout?.(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors" style={{ color: "#F87171" }}>
                      ↩ Se déconnecter
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => nav("onboarding")} className="btn-gold" style={{ padding: "8px 16px", fontSize: "13px" }}>
              Commencer ✨
            </button>
          )}

          {/* Burger mobile */}
          <button className="lg:hidden p-2 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "rgba(255,255,255,0.05)", color: "#F0EDF8" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden px-4 pb-4 pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,4,26,0.98)" }}>
            <div className="grid grid-cols-2 gap-1">
              {allLinks.map(link => (
                <button key={link.id} onClick={() => nav(link.id)}
                  className={`nav-link justify-start relative ${current === link.id ? "active" : ""}`}>
                  <span>{link.icon}</span>
                  <span className="text-sm">{link.label}</span>
                  {COMING_SOON.includes(link.id) && (
                    <span className="ml-1 text-[8px] font-bold px-1 py-0.5 rounded-full"
                      style={{ background: "linear-gradient(135deg, #F4C842, #E8A020)", color: "#0D0B2B" }}>
                      NEW
                    </span>
                  )}
                </button>
              ))}
              {user && (
                <>
                  <button onClick={() => nav("profil")} className="nav-link justify-start col-span-2">
                    👤 Mon Profil & Journal
                  </button>
                  <button onClick={() => { onLogout?.(); setMenuOpen(false); }}
                    className="nav-link justify-start col-span-2" style={{ color: "#F87171" }}>
                    ↩ Se déconnecter
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>

    {/* Modale Bientôt disponible */}
    <AnimatePresence>
      {showComingSoon && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(6,4,26,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowComingSoon(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative max-w-sm w-full rounded-3xl p-8 text-center"
            style={{
              background: "linear-gradient(160deg, rgba(26,5,51,0.98), rgba(13,27,75,0.98))",
              border: "1px solid rgba(244,200,66,0.25)",
              boxShadow: "0 0 60px rgba(244,200,66,0.1), 0 20px 60px rgba(0,0,0,0.5)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Étoiles décoratives */}
            <motion.div className="absolute top-4 left-6 text-lg"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity }}>✨</motion.div>
            <motion.div className="absolute top-6 right-8 text-sm"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}>⭐</motion.div>
            <motion.div className="absolute bottom-8 left-8 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.2 }}>🌟</motion.div>

            {/* Icône principale */}
            <motion.div
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="text-6xl mb-4">
              🧿
            </motion.div>

            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Sora, sans-serif", color: "#F4C842" }}>
              Bientôt disponible
            </h2>

            <div className="w-16 h-0.5 mx-auto mb-4 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, #F4C842, transparent)" }} />

            <p className="text-sm mb-2 leading-relaxed" style={{ color: "#C4B8E0" }}>
              Notre annuaire de marabouts certifiés est en cours de préparation.
            </p>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: "#9B8FC2" }}>
              Des praticiens vérifiés et des consultations spirituelles de qualité arrivent très bientôt sur <span style={{ color: "#F4C842" }}>SetalSaBOP</span> ✨
            </p>

            {/* Badge animé */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-semibold"
              style={{ background: "rgba(244,200,66,0.1)", border: "1px solid rgba(244,200,66,0.3)", color: "#F4C842" }}>
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>●</motion.span>
              En cours de préparation
            </motion.div>

            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #F4C842, #E8A020)", color: "#0D0B2B" }}>
              Compris, j'attends ! 🙏
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
