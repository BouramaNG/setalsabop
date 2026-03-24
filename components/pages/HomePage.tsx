"use client";
import { motion } from "framer-motion";

interface HomePageProps {
  onNavigate: (page: string) => void;
  user: { prenom: string; nom: string; tradition: string } | null;
}

const features = [
  {
    icon: "🌙",
    title: "Interprétation IA",
    desc: "Ton rêve analysé en secondes selon ta tradition spirituelle — Islam, Christianisme, Psychologie ou Ancestral.",
    color: "rgba(192,132,252,0.1)",
    border: "rgba(192,132,252,0.2)",
  },
  {
    icon: "🧿",
    title: "Marabouts Vérifiés",
    desc: "Connecte-toi à des guides spirituels certifiés au Sénégal. Zéro arnaque — chaque profil est vérifié manuellement.",
    color: "rgba(0,229,160,0.1)",
    border: "rgba(0,229,160,0.2)",
  },
  {
    icon: "📖",
    title: "Journal de Rêves",
    desc: "Suis tes rêves dans le temps. Découvre tes symboles récurrents et les patterns de ton inconscient.",
    color: "rgba(244,200,66,0.1)",
    border: "rgba(244,200,66,0.2)",
  },
  {
    icon: "💫",
    title: "Rituels Éthiques",
    desc: "Des suggestions personnalisées — prières, sadaqa, méditations — pour donner suite à tes rêves importants.",
    color: "rgba(56,189,248,0.1)",
    border: "rgba(56,189,248,0.2)",
  },
];

const traditions = [
  { icon: "🕌", label: "Islam", sub: "Ibn Sirin", color: "#10B981" },
  { icon: "✝️", label: "Christianisme", sub: "Bible", color: "#60A5FA" },
  { icon: "🧠", label: "Psychologie", sub: "Science", color: "#A78BFA" },
  { icon: "🌿", label: "Ancestral", sub: "Traditions", color: "#34D399" },
];

const stats = [
  { value: "12 400+", label: "Rêves interprétés" },
  { value: "87", label: "Marabouts vérifiés" },
  { value: "4.9★", label: "Note moyenne" },
  { value: "100%", label: "Données sécurisées" },
];

export default function HomePage({ onNavigate, user }: HomePageProps) {
  return (
    <div className="min-h-screen above-stars">
      {/* Hero */}
      <section className="pt-28 pb-20 px-4 max-w-7xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 mb-6"
            style={{
              background: "rgba(244,200,66,0.08)",
              border: "1px solid rgba(244,200,66,0.2)",
              borderRadius: "50px", padding: "6px 18px",
            }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" style={{ background: "#00E5A0", boxShadow: "0 0 6px #00E5A0" }}></span>
            <span style={{ color: "#F4C842", fontSize: "13px", fontWeight: 600 }}>
              Lancé au Sénégal · 87 Marabouts vérifiés
            </span>
          </div>

          {/* Main title */}
          <h1
            className="font-bold mb-6 leading-tight"
            style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2.4rem, 6vw, 4.5rem)", lineHeight: 1.15 }}
          >
            <span className="text-gradient-gold">Tes rêves ont</span><br />
            <span style={{ color: "#F0EDF8" }}>un sens profond.</span><br />
            <span className="text-gradient-mystic">Découvrons-le ensemble.</span>
          </h1>

          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: "#9B8FC2", lineHeight: 1.7 }}>
            DreamInsight est la première plateforme sénégalaise d&apos;interprétation de rêves — alliant
            l&apos;intelligence artificielle, les traditions spirituelles et des marabouts certifiés.
            Simple à utiliser, sécurisée, et 100% éthique.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(user ? "dream" : "onboarding")}
              className="btn-gold glow-pulse"
              style={{ fontSize: "16px", padding: "16px 36px" }}
            >
              ✨ {user ? "Interpréter un rêve" : "Commencer gratuitement"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => onNavigate("marabouts")}
              className="btn-ghost"
              style={{ fontSize: "15px" }}
            >
              🧿 Voir les marabouts
            </motion.button>
          </div>
        </motion.div>

        {/* Floating cards preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 relative"
        >
          <div
            className="glass-card p-6 max-w-lg mx-auto"
            style={{ boxShadow: "0 20px 80px rgba(0,0,0,0.5), 0 0 40px rgba(244,200,66,0.06)" }}
          >
            {/* Fake dream card */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(244,200,66,0.12)", border: "1px solid rgba(244,200,66,0.2)" }}>
                🌊
              </div>
              <div className="text-left">
                <p style={{ color: "#F0EDF8", fontSize: "15px", fontWeight: 500 }}>
                  &quot;J&apos;étais au bord de l&apos;océan, l&apos;eau était d&apos;une pureté...&quot;
                </p>
                <p style={{ color: "#6B5F8A", fontSize: "12px", marginTop: "4px" }}>Ce matin · Dakar</p>
              </div>
            </div>

            <div className="separator mb-4" />

            <div className="flex items-start gap-2 mb-3">
              <span>🕌</span>
              <div>
                <p style={{ color: "#F4C842", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>INTERPRÉTATION ISLAMIQUE</p>
                <p style={{ color: "#9B8FC2", fontSize: "13px", lineHeight: 1.6 }}>
                  L&apos;eau pure représente la baraka et la prospérité à venir. Ce rêve est un signe positif — une période de renouveau spirituel approche.
                </p>
              </div>
            </div>

            <div
              className="rounded-xl p-3 flex items-center justify-between mt-4"
              style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.15)" }}
            >
              <div className="flex items-center gap-2">
                <span>💫</span>
                <span style={{ color: "#00E5A0", fontSize: "13px" }}>Rituel suggéré : Sadaqa dans les 3 jours</span>
              </div>
              <span style={{ color: "#6B5F8A", fontSize: "11px" }}>✓ Éthique</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.5 }}
              className="glass-card p-5 text-center"
            >
              <p className="text-gradient-gold font-bold text-2xl" style={{ fontFamily: "Sora, sans-serif" }}>
                {stat.value}
              </p>
              <p style={{ color: "#6B5F8A", fontSize: "13px", marginTop: "4px" }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="font-bold text-3xl mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
            Tout ce qu&apos;il te faut, <span className="text-gradient-gold">au même endroit</span>
          </h2>
          <p style={{ color: "#9B8FC2" }}>Simple comme envoyer un WhatsApp. Puissant comme une consultation avec un expert.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card p-6 cursor-pointer"
              style={{ border: `1px solid ${f.border}`, background: f.color }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "Sora, sans-serif", color: "#F0EDF8" }}>
                {f.title}
              </h3>
              <p style={{ color: "#9B8FC2", fontSize: "14px", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Traditions */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-bold text-3xl mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
            <span className="text-gradient-mystic">4 Traditions,</span> une seule vérité
          </h2>
          <p style={{ color: "#9B8FC2" }}>Chaque rêve est analysé selon ta croyance. Aucun jugement, juste du respect.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {traditions.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => onNavigate("onboarding")}
              className="tradition-card"
            >
              <div className="text-4xl mb-3">{t.icon}</div>
              <p className="font-bold" style={{ color: "#F0EDF8", fontFamily: "Sora, sans-serif" }}>{t.label}</p>
              <p style={{ color: t.color, fontSize: "12px", marginTop: "4px" }}>{t.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center glass-card p-10"
          style={{ boxShadow: "0 0 60px rgba(244,200,66,0.08)" }}
        >
          <div className="text-5xl mb-4" style={{ animation: "float 4s ease-in-out infinite" }}>🌙</div>
          <h2 className="font-bold text-2xl mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
            Tu as eu un rêve cette nuit ?
          </h2>
          <p className="mb-6" style={{ color: "#9B8FC2" }}>
            Raconte-le maintenant avant de l&apos;oublier. L&apos;interprétation est gratuite et arrive en moins de 10 secondes.
          </p>
          <button
            onClick={() => onNavigate(user ? "dream" : "onboarding")}
            className="btn-gold glow-pulse"
            style={{ fontSize: "16px", padding: "16px 40px" }}
          >
            🌙 Interpréter mon rêve maintenant
          </button>
          <p style={{ color: "#6B5F8A", fontSize: "12px", marginTop: "12px" }}>
            Gratuit · Sécurisé · Privé · Aucune carte bancaire requise
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p style={{ color: "#6B5F8A", fontSize: "13px" }}>
          🌙 DreamInsight · Made with ❤️ au Sénégal · {new Date().getFullYear()}
        </p>
        <p style={{ color: "#4A3F6B", fontSize: "11px", marginTop: "6px" }}>
          Les interprétations sont à titre informatif et culturel uniquement. Ce n&apos;est ni un avis médical ni légal.
        </p>
      </footer>
    </div>
  );
}
