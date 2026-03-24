"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DreamInterpretation } from "@/app/page";

interface ResultsPageProps {
  dream: string;
  emotions: string[];
  user: { prenom: string; nom: string; tradition: string };
  interpretation: DreamInterpretation;
  onNavigate: (page: string) => void;
  onNewDream: () => void;
}

const interpretations: Record<string, { icon: string; title: string; color: string; borderColor: string }> = {
  islam: { icon: "🕌", title: "Islam — Ibn Sirin", color: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" },
  christianisme: { icon: "✝️", title: "Christianisme — La Bible", color: "rgba(96,165,250,0.08)", borderColor: "rgba(96,165,250,0.2)" },
  psychologie: { icon: "🧠", title: "Psychologie — Science", color: "rgba(167,139,250,0.08)", borderColor: "rgba(167,139,250,0.2)" },
  ancestral: { icon: "🌿", title: "Traditions Ancestrales", color: "rgba(52,211,153,0.08)", borderColor: "rgba(52,211,153,0.2)" },
};

const generateInterpretation = (dream: string, tradition: string): { text: string; ritual: string } => {
  const isWater = dream.toLowerCase().includes("eau") || dream.toLowerCase().includes("mer") || dream.toLowerCase().includes("plage") || dream.toLowerCase().includes("pluie");
  const isHouse = dream.toLowerCase().includes("maison") || dream.toLowerCase().includes("chambre");
  const isFlight = dream.toLowerCase().includes("voler") || dream.toLowerCase().includes("vol ");
  const isSnake = dream.toLowerCase().includes("serpent");
  const isDeath = dream.toLowerCase().includes("mort") || dream.toLowerCase().includes("mourir");

  const base = isWater ? "eau" : isHouse ? "maison" : isFlight ? "vol" : isSnake ? "serpent" : isDeath ? "mort" : "general";

  const texts: Record<string, Record<string, string>> = {
    eau: {
      islam: "L'eau pure dans un rêve est un signe de baraka (bénédiction divine). Selon Ibn Sirin, rêver d'eau claire et abondante annonce la prospérité, la purification spirituelle et la réalisation d'un désir légitime. Si l'eau coulait doucement, cela symbolise une période de tranquillité et de grâce d'Allah sur ta vie. C'est un rêve béni — sois reconnaissant.",
      christianisme: "L'eau dans la tradition chrétienne symbolise la purification, le baptême et le renouveau spirituel. Selon l'Évangile, l'eau vive représente la vie éternelle. Ce rêve indique que tu traverses une période de transformation intérieure guidée par la grâce de Dieu. Une nouvelle étape positive s'ouvre dans ta vie.",
      psychologie: "Selon Carl Jung et la psychologie des profondeurs, l'eau représente l'inconscient et les émotions. Une eau calme et claire indique un état intérieur équilibré, une conscience de soi en expansion. Ce rêve reflète une période de maturation émotionnelle et d'acceptation de soi. Tu es en harmonie avec tes émotions profondes.",
      ancestral: "Dans les traditions ancestrales sénégalaises et africaines, l'eau est gardée par les esprits de la nature — les génies des fleuves et de la mer. Rêver d'eau calme signifie que les ancêtres et les forces de la nature te protègent. C'est un message de paix et d'alignement avec ton lignage spirituel.",
    },
    maison: {
      islam: "La maison en rêve représente ton état intérieur selon Ibn Sirin. Une belle maison symbolise une foi solide et une vie bien construite. Si la maison était spacieuse et lumineuse, c'est un signe de longévité et de bénédictions familiales à venir. Si elle était ancienne, cela invite à se reconnecter à ses racines spirituelles.",
      christianisme: "Dans la Bible, la maison représente le corps et l'âme. Ce rêve peut être une invitation à examiner les fondations de ta foi. Jésus a dit : 'Dans la maison de mon Père, il y a beaucoup de demeures.' Ce rêve t'invite à préparer ta demeure intérieure pour recevoir les bénédictions divines.",
      psychologie: "Selon la psychanalyse freudienne et jungienne, la maison représente le soi, la psyché. Chaque pièce symbolise un aspect de ta personnalité. Un rêve de maison indique souvent une exploration de ton identité ou une transition importante dans ta vie. C'est un processus d'individuation normal et sain.",
      ancestral: "La maison ancestrale dans les traditions africaines est un lieu sacré où les esprits des ancêtres habitent. Rêver de la maison signifie que tes ancêtres communiquent avec toi. C'est une invitation à honorer ton héritage et à prendre soin de ta famille élargie. Les génies familiaux veillent sur toi.",
    },
    general: {
      islam: "Ce rêve, selon les principes d'interprétation islamique inspirés d'Ibn Sirin, contient des symboles positifs. Les éléments que tu décris indiquent une période de transition spirituelle. Allah envoie parfois des messages à travers les rêves pour guider Ses serviteurs. Il est recommandé de faire des bonnes actions dans les jours suivants.",
      christianisme: "Les rêves dans la tradition biblique peuvent être des visions envoyées par Dieu pour guider, avertir ou encourager. L'histoire de Joseph nous montre que les rêves ont un sens profond. Ce rêve semble porter un message d'espoir et d'encouragement. Médite sur sa signification en prière.",
      psychologie: "D'un point de vue psychologique, ce rêve reflète les préoccupations et aspirations de ton inconscient. Les symboles présents suggèrent un processus de résolution de conflits intérieurs ou d'intégration d'expériences récentes. C'est un signe que ton psychisme travaille activement à ton équilibre émotionnel.",
      ancestral: "Dans les cosmologies africaines, les rêves sont des portails entre le monde des vivants et celui des ancêtres. Ce rêve contient des messages des forces invisibles qui t'entourent. Il est important d'être attentif aux signes dans ta vie quotidienne dans les prochains jours — les ancêtres parlent à travers les coïncidences.",
    },
  };

  const rituals: Record<string, Record<string, string>> = {
    islam: {
      eau: "Faire une sadaqa (aumône) dans les 3 prochains jours — de préférence de la nourriture ou de l'eau potable pour les nécessiteux.",
      maison: "Réciter le Verset du Trône (Ayat al-Kursi) chaque soir pendant 7 jours pour protéger ta maison et ta famille.",
      general: "Faire 2 rakâas de prière de gratitude (Shukr) et donner une aumône à une famille dans le besoin.",
    },
    christianisme: {
      eau: "Prier de manière consciente pendant 7 jours, en demandant la guidance divine. Offrir de l'aide à quelqu'un dans le besoin.",
      maison: "Lire le Psaume 91 chaque matin pendant une semaine et bénir ta maison avec de l'eau bénite.",
      general: "Jeûner d'un repas et consacrer ce temps à la prière et à la lecture de la Bible.",
    },
    psychologie: {
      eau: "Tenir un journal de rêves pendant 30 jours. Pratiquer la méditation de pleine conscience sur les émotions liées à l'eau.",
      maison: "Faire un exercice de visualisation : imagine ta maison idéale et réfléchis à ce que tu souhaites construire dans ta vie.",
      general: "Écrire tes ressentis et faire une séance de méditation guidée pour explorer les messages de ton inconscient.",
    },
    ancestral: {
      eau: "Offrir une libation d'eau propre à la terre en honorant tes ancêtres. Verser l'eau à l'extérieur en prononçant leurs noms.",
      maison: "Allumer une bougie blanche dans ton espace de vie et méditer sur tes liens familiaux et ancestraux.",
      general: "Préparer un repas simple et partager-le avec des personnes âgées de ta communauté en signe d'honneur aux anciens.",
    },
  };

  const selectedTexts = texts[base] || texts.general;
  const selectedRituals = rituals[tradition] || rituals.islam;
  const ritualKey = isWater ? "eau" : isHouse ? "maison" : "general";

  return {
    text: selectedTexts[tradition] || selectedTexts.islam,
    ritual: selectedRituals[ritualKey] || selectedRituals.general,
  };
};

export default function ResultsPage({ dream, emotions, user, interpretation, onNavigate, onNewDream }: ResultsPageProps) {
  const [expandedTradition, setExpandedTradition] = useState(user.tradition);
  const [saved, setSaved] = useState(false);

  const traditionOrder = [
    user.tradition,
    ...["islam", "christianisme", "psychologie", "ancestral"].filter((t) => t !== user.tradition),
  ];

  // Sauvegarder automatiquement au journal localStorage
  useEffect(() => {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
      title: interpretation.title,
      emotion: emotions[0] || "neutre",
      symboles: interpretation.mainSymbols.slice(0, 3),
      tradition: user.tradition,
      resume: dream.slice(0, 100),
      fullDream: dream,
      interpretations: interpretation.interpretations,
    };
    const existing = JSON.parse(localStorage.getItem("dreaminsight_journal") || "[]");
    const updated = [entry, ...existing].slice(0, 50);
    localStorage.setItem("dreaminsight_journal", JSON.stringify(updated));
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen above-stars px-4 pt-24 pb-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 mb-4"
            style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "50px", padding: "6px 16px" }}
          >
            <span style={{ background: "#00E5A0", width: "8px", height: "8px", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 6px #00E5A0" }} />
            <span style={{ color: "#00E5A0", fontSize: "12px", fontWeight: 600 }}>Interprétation prête</span>
          </div>
          <h1 className="font-bold text-3xl mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
            <span className="text-gradient-gold">{interpretation.title}</span>
          </h1>
          <p style={{ color: "#9B8FC2", fontSize: "14px" }}>{interpretation.summary}</p>

          {/* Symboles IA */}
          {interpretation.mainSymbols.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {interpretation.mainSymbols.map((s, i) => (
                <span key={i} className="badge-gold">{s}</span>
              ))}
            </div>
          )}

          {/* Emotions display */}
          {emotions.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {emotions.map((e, i) => (
                <span key={i} className="badge-gold">{e}</span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Dream recap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 mb-5 flex items-start gap-3"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-2xl flex-shrink-0">💭</span>
          <div>
            <p style={{ color: "#6B5F8A", fontSize: "11px", marginBottom: "4px" }}>TON RÊVE</p>
            <p style={{ color: "#9B8FC2", fontSize: "13px", lineHeight: 1.6, fontStyle: "italic" }}>
              &quot;{dream.length > 120 ? dream.slice(0, 120) + "..." : dream}&quot;
            </p>
          </div>
        </motion.div>

        {/* Interpretations */}
        <div className="space-y-3 mb-6">
          {traditionOrder.map((trad, idx) => {
            const meta = interpretations[trad];
            const interp = interpretation.interpretations[trad as keyof typeof interpretation.interpretations];
            const isExpanded = expandedTradition === trad;
            const isPrimary = trad === user.tradition;

            return (
              <motion.div
                key={trad}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
              >
                <div
                  className="glass-card overflow-hidden"
                  style={{ background: isExpanded ? meta.color : "rgba(255,255,255,0.03)", border: `1px solid ${isExpanded ? meta.borderColor : "rgba(255,255,255,0.06)"}` }}
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedTradition(isExpanded ? "" : trad)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{meta.icon}</span>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p style={{ color: "#F0EDF8", fontWeight: 600, fontSize: "15px" }}>{meta.title}</p>
                          {isPrimary && <span className="badge-gold">Ta tradition</span>}
                        </div>
                        {!isExpanded && (
                          <p style={{ color: "#6B5F8A", fontSize: "12px" }}>
                            {interp.text.slice(0, 60)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <span style={{ color: "#9B8FC2", fontSize: "18px" }}>{isExpanded ? "▲" : "▼"}</span>
                  </button>

                  {/* Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4"
                      >
                        <div className="separator mb-4" />
                        <p style={{ color: "#C4B8E8", fontSize: "14px", lineHeight: 1.8 }}>
                          {interp.text}
                        </p>

                        {/* Ritual */}
                        <div
                          className="rounded-xl p-4 mt-4"
                          style={{ background: "rgba(244,200,66,0.06)", border: "1px solid rgba(244,200,66,0.15)" }}
                        >
                          <p style={{ color: "#F4C842", fontSize: "11px", fontWeight: 700, marginBottom: "6px", letterSpacing: "0.5px" }}>
                            💫 RITUEL SUGGÉRÉ
                          </p>
                          <p style={{ color: "#C4B8E8", fontSize: "13px", lineHeight: 1.6 }}>
                            {interp.ritual}
                          </p>
                          <p style={{ color: "#6B5F8A", fontSize: "11px", marginTop: "8px" }}>
                            ℹ️ À titre spirituel uniquement — pas un avis médical ou légal.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          {/* Consult marabout CTA */}
          <div
            className="glass-card-strong p-5 text-center"
            style={{ border: "1px solid rgba(0,229,160,0.2)", background: "rgba(0,229,160,0.05)" }}
          >
            <p className="text-lg mb-1">🧿</p>
            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "Sora, sans-serif", color: "#F0EDF8" }}>
              Ce rêve te préoccupe encore ?
            </h3>
            <p style={{ color: "#9B8FC2", fontSize: "13px", marginBottom: "14px" }}>
              Consulte un marabout certifié pour une analyse approfondie et personnalisée.
            </p>
            <button
              onClick={() => onNavigate("marabouts")}
              className="btn-gold w-full"
              style={{ background: "linear-gradient(135deg,#00E5A0,#00B4D8)", color: "#0D0B2B" }}
            >
              🧿 Trouver un Marabout Vérifié
            </button>
          </div>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSave}
              className="btn-ghost"
              style={{ padding: "12px", fontSize: "13px", justifyContent: "center" }}
            >
              {saved ? "✓ Sauvegardé!" : "📖 Sauvegarder"}
            </button>
            <button
              onClick={onNewDream}
              className="btn-ghost"
              style={{ padding: "12px", fontSize: "13px", justifyContent: "center" }}
            >
              🌙 Nouveau rêve
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
