import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import { rateLimit } from "@/lib/rateLimit";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PYTHA: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
  J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
  S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8
};
const CHALD: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,
  J:1,K:2,L:3,M:4,N:5,O:7,P:8,Q:1,R:2,
  S:3,T:4,U:6,V:6,W:6,X:5,Y:1,Z:7
};
const ABJAD: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:80,G:3,H:8,I:10,
  J:3,K:20,L:30,M:40,N:50,O:70,P:80,Q:100,R:200,
  S:60,T:400,U:6,V:6,W:800,X:60,Y:10,Z:7
};

function getTable(systeme: string) {
  if (systeme === "oriental") return CHALD;
  if (systeme === "abjad") return ABJAD;
  return PYTHA;
}

function reduire(n: number): number {
  if ([11, 22, 33].includes(n)) return n;
  if (n <= 9) return n;
  return reduire(String(n).split("").reduce((a, b) => a + parseInt(b), 0));
}

function valeurNom(nom: string, table: Record<string, number>): number {
  return nom.toUpperCase().replace(/[^A-Z]/g, "").split("")
    .reduce((acc, l) => acc + (table[l] || 0), 0);
}

function calculCheminVie(dateStr: string): number {
  if (!dateStr) return 0;
  const chiffres = dateStr.replace(/\D/g, "").split("").map(Number);
  return reduire(chiffres.reduce((a, b) => a + b, 0));
}

// Calcul poids mystique Abjad combiné (nom + nom de la mère)
function poidsMyستique(nom: string, nomMere: string, table: Record<string, number>): number {
  const valNom = valeurNom(nom, table);
  const valMere = valeurNom(nomMere, table);
  return reduire(valNom + valMere);
}

export async function POST(req: NextRequest) {
  try {
    const {
      nomPersonne1, nomMere1, dateNaissance1,
      nomPersonne2, nomMere2, dateNaissance2,
      systeme = "occidental", userId
    } = await req.json();

    if (!nomPersonne1 || !nomPersonne2 || !nomMere1 || !nomMere2) {
      return NextResponse.json({ error: "Noms et noms de mères requis" }, { status: 400 });
    }

    // Rate limiting : max 10 appels/min par utilisateur
    if (userId && !rateLimit(`compatibilite:${userId}`, 10)) {
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

    const table = getTable(systeme);

    const cv1 = calculCheminVie(dateNaissance1 || "");
    const cv2 = calculCheminVie(dateNaissance2 || "");
    const expr1 = reduire(valeurNom(nomPersonne1, table));
    const expr2 = reduire(valeurNom(nomPersonne2, table));
    const poids1 = poidsMyستique(nomPersonne1, nomMere1, ABJAD);
    const poids2 = poidsMyستique(nomPersonne2, nomMere2, ABJAD);
    const poidsUnion = reduire(poids1 + poids2);

    const prompt = `Tu es un expert en compatibilité spirituelle combinant la numérologie islamique (Ilm al-Huruf, calcul Abjad), la numérologie de Pythagore, et les traditions mystiques d'Afrique de l'Ouest.

Analyse de compatibilité entre :
- Personne 1 : ${nomPersonne1} (mère: ${nomMere1}${dateNaissance1 ? `, né(e) le ${dateNaissance1}` : ""})
  → Chemin de Vie: ${cv1 || "non calculé"}, Expression: ${expr1}, Poids mystique (Abjad): ${poids1}
- Personne 2 : ${nomPersonne2} (mère: ${nomMere2}${dateNaissance2 ? `, né(e) le ${dateNaissance2}` : ""})
  → Chemin de Vie: ${cv2 || "non calculé"}, Expression: ${expr2}, Poids mystique (Abjad): ${poids2}
- Poids mystique de l'union : ${poidsUnion}
- Système de calcul : ${systeme}

Génère une analyse de compatibilité PROFONDE et PRÉCISE en JSON strict :
{
  "scoreTotal": 85,
  "niveau": "Très compatible / Compatible / Neutre / Difficile / Incompatible",
  "titre": "titre poétique de cette union",
  "resume": "résumé de 3 phrases sur cette relation",
  "poidsUnion": ${poidsUnion},
  "significationPoidsUnion": "signification mystique du chiffre ${poidsUnion} pour cette union en 3 phrases",
  "dimensions": {
    "spirituelle": {
      "score": 80,
      "description": "150 mots — compatibilité des âmes, missions spirituelles communes, karma partagé"
    },
    "emotionnelle": {
      "score": 75,
      "description": "150 mots — harmonie émotionnelle, gestion des conflits, empathie mutuelle"
    },
    "materielle": {
      "score": 70,
      "description": "100 mots — compatibilité financière, projets communs, stabilité"
    },
    "physique": {
      "score": 65,
      "description": "100 mots — énergie, attraction, vitalité commune"
    }
  },
  "forcesUnion": ["force1", "force2", "force3"],
  "defisUnion": ["défi1", "défi2"],
  "conseilsSpirituels": ["conseil islamique", "conseil ancestral africain", "conseil psychologique"],
  "periodesFavorables": ["mois ou période favorable", "autre période"],
  "avertissement": "point de vigilance crucial pour cette union",
  "conclusion": "conclusion inspirante de 2 phrases"
}

Réponds UNIQUEMENT avec le JSON, aucun texte avant ou après.`;

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
    if (text.startsWith("```")) {
      text = text.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
    }

    const rapport = JSON.parse(text);

    if (userId) {
      await prisma.compatibilite.create({
        data: {
          userId, nomPersonne1, nomMere1,
          dateNaissance1: dateNaissance1 || null,
          nomPersonne2, nomMere2,
          dateNaissance2: dateNaissance2 || null,
          systeme, scoreTotal: rapport.scoreTotal,
          rapport: JSON.stringify(rapport),
        }
      });
      // Déduire 1 crédit
      await prisma.userCredits.updateMany({
        where: { userId, credits: { gt: 0 } },
        data: { credits: { decrement: 1 } },
      });
    }

    return NextResponse.json({ rapport, cv1, cv2, expr1, expr2, poids1, poids2, poidsUnion });

  } catch (e) {
    console.error("Erreur compatibilité:", e);
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 });
  }
}
