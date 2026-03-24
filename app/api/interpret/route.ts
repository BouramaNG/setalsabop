import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { rateLimit } from "@/lib/rateLimit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { dream, emotions, user, userId } = await req.json();

    if (!dream || dream.trim().length < 10) {
      return NextResponse.json({ error: "Rêve trop court" }, { status: 400 });
    }

    // Rate limiting : max 10 appels/min par utilisateur
    if (userId && !rateLimit(`interpret:${userId}`, 10)) {
      return NextResponse.json({ error: "Trop de requêtes. Attends une minute." }, { status: 429 });
    }

    // Vérifier connexion + crédits
    if (!userId) {
      return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
    }
    const uc = await prisma.userCredits.findUnique({ where: { userId } });
    if (!uc || uc.credits <= 0) {
      return NextResponse.json({ error: "Crédits insuffisants" }, { status: 402 });
    }

    const emotionsList = emotions?.length > 0 ? emotions.join(", ") : "non précisées";
    const tradition = user?.tradition || "islam";
    const prenom = user?.prenom || "l'utilisateur";
    const nom = user?.nom || "";
    const prenomMere = user?.prenomMere || "";
    const nomMere = user?.nomMere || "";
    const genre = user?.genre || "non précisé";
    const age = user?.age ? `${user.age} ans` : "non précisé";

    const fullName = `${prenom} ${nom}`.trim();
    const motherName = prenomMere && nomMere ? `${prenomMere} ${nomMere}`.trim() : prenomMere || "";
    const hasMysticalData = motherName.length > 0;

    const prompt = `Tu es SetalSaBOP, un expert reconnu en interprétation de rêves spirituels au Sénégal. Tu maîtrises parfaitement les traditions islamiques (Ibn Sirin), chrétiennes (bibliques), psychologiques (Jung/Freud) et ancestrales africaines (animisme sénégalais, traditions sérère, wolof, diola).${hasMysticalData ? " Tu maîtrises aussi le calcul du poids mystique des noms selon la science des lettres ('Ilm al-Huruf) et les traditions africaines." : ""}

Contexte de la personne :
- Nom complet : ${fullName}
- Genre : ${genre}
- Âge : ${age}
- Tradition principale : ${tradition}
- Émotions ressenties pendant le rêve : ${emotionsList}${hasMysticalData ? `
- Nom de la mère : ${motherName} (pour calcul du poids mystique)` : ""}

Rêve à interpréter :
"${dream}"

Génère une interprétation profonde, culturellement précise et respectueuse selon 4 traditions. Chaque interprétation doit être personnalisée selon les infos ci-dessus, utiliser un langage évocateur et inspirant, faire référence à des textes/sources de la tradition (ex: verset coranique, psaume, auteur psychologue, nom de divinité ancestrale).

Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après, avec cette structure exacte :
{
  "title": "Titre court et poétique du rêve (4-7 mots en français)",
  "mainSymbols": ["emoji + label court", "emoji + label court"],
  "summary": "Résumé de 30 mots maximum sur le sens global du rêve",
  "interpretations": {
    "islam": {
      "text": "Interprétation islamique détaillée selon Ibn Sirin et les savants (160-200 mots). Cite une référence coranique ou hadith si pertinent.",
      "ritual": "Suggestion de rituel islamique éthique et non-violent (sadaqa, prière, dhikr, etc.) — 2-3 phrases."
    },
    "christianisme": {
      "text": "Interprétation chrétienne biblique (160-200 mots). Cite un verset biblique si pertinent.",
      "ritual": "Suggestion de rituel chrétien éthique (prière, jeûne symbolique, charité, etc.) — 2-3 phrases."
    },
    "psychologie": {
      "text": "Analyse psychologique selon Jung ou Freud (160-200 mots). Utilise des concepts psychologiques précis (archétypes, inconscient, projection, etc.).",
      "ritual": "Pratique psychologique suggérée (journaling, méditation, visualisation, thérapie) — 2-3 phrases."
    },
    "ancestral": {
      "text": "Interprétation selon les traditions ancestrales africaines sénégalaises (animisme, traditions sérère, wolof, diola) (160-200 mots).",
      "ritual": "Rituel ancestral éthique et non-violent (libation, offrande symbolique à la nature, honorer les ancêtres) — 2-3 phrases."
    }
  }
}`;

    const MODELS = ["gemini-2.5-flash-lite", "gemini-1.5-flash", "gemini-1.5-pro"];
    let text = "";
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
        break;
      } catch (err: any) {
        if (err?.status === 503 || err?.status === 429) continue;
        throw err;
      }
    }
    if (!text) return NextResponse.json({ error: "Le service d'analyse est temporairement indisponible. Réessaie dans quelques minutes." }, { status: 503 });

    let jsonText = text;
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonText);

    // Déduire 1 crédit si utilisateur connecté
    if (userId) {
      await prisma.userCredits.updateMany({
        where: { userId, credits: { gt: 0 } },
        data: { credits: { decrement: 1 } },
      });
    }

    return NextResponse.json(parsed);

  } catch (error: unknown) {
    console.error("Erreur interprétation IA:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'interprétation. Réessaie dans quelques secondes." },
      { status: 500 }
    );
  }
}
