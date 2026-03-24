import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import { rateLimit } from "@/lib/rateLimit";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ─── Calculs numériques purs ───────────────────────────────────────────────

// Table Pythagoricienne (occidental)
const PYTHA: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
  J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
  S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8
};

// Table Chaldéenne (oriental/mystique)
const CHALD: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,
  J:1,K:2,L:3,M:4,N:5,O:7,P:8,Q:1,R:2,
  S:3,T:4,U:6,V:6,W:6,X:5,Y:1,Z:7
};

// Table Abjad arabe (lettres latines approximées)
const ABJAD: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:80,G:3,H:8,I:10,
  J:3,K:20,L:30,M:40,N:50,O:70,P:80,Q:100,R:200,
  S:60,T:400,U:6,V:6,W:800,X:60,Y:10,Z:7
};

function reduire(n: number, garderMaitresse = true): number {
  const maitresses = [11, 22, 33];
  if (garderMaitresse && maitresses.includes(n)) return n;
  if (n <= 9) return n;
  const somme = String(n).split("").reduce((acc, d) => acc + parseInt(d), 0);
  return reduire(somme, garderMaitresse);
}

function valeurNom(nom: string, table: Record<string, number>): number {
  const lettres = nom.toUpperCase().replace(/[^A-Z]/g, "").split("");
  return lettres.reduce((acc, l) => acc + (table[l] || 0), 0);
}

function voyelles(nom: string, table: Record<string, number>): number {
  const voy = "AEIOU";
  return nom.toUpperCase().replace(/[^A-Z]/g, "").split("")
    .filter(l => voy.includes(l))
    .reduce((acc, l) => acc + (table[l] || 0), 0);
}

function consonnes(nom: string, table: Record<string, number>): number {
  const voy = "AEIOU";
  return nom.toUpperCase().replace(/[^A-Z]/g, "").split("")
    .filter(l => !voy.includes(l))
    .reduce((acc, l) => acc + (table[l] || 0), 0);
}

function calculCheminVie(dateStr: string): number {
  const chiffres = dateStr.replace(/\D/g, "").split("").map(Number);
  const somme = chiffres.reduce((a, b) => a + b, 0);
  return reduire(somme);
}

function calculAnneePersonnelle(dateStr: string, annee: number): number {
  const parts = dateStr.split(/[-\/]/);
  const jour = parseInt(parts[parts.length - 1] || parts[0]);
  const mois = parseInt(parts[parts.length - 2] || parts[1]);
  const sommeAnnee = String(annee).split("").reduce((a, b) => a + parseInt(b), 0);
  return reduire(jour + mois + sommeAnnee);
}

function getTable(systeme: string) {
  if (systeme === "oriental") return CHALD;
  if (systeme === "abjad") return ABJAD;
  return PYTHA;
}

export async function POST(req: NextRequest) {
  try {
    const { nomComplet, dateNaissance, systeme = "occidental", userId } = await req.json();

    if (!nomComplet || !dateNaissance) {
      return NextResponse.json({ error: "Nom et date requis" }, { status: 400 });
    }

    // Rate limiting : max 10 appels/min par utilisateur
    if (userId && !rateLimit(`numerologie:${userId}`, 10)) {
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

    // ── Calculs ──
    const cheminDeVie     = calculCheminVie(dateNaissance);
    const nombreExpression = reduire(valeurNom(nomComplet, table));
    const nombreAme        = reduire(voyelles(nomComplet, table));
    const nombrePersonnalite = reduire(consonnes(nomComplet, table));
    const anneeActuelle    = new Date().getFullYear();
    const anneePersonnelle = calculAnneePersonnelle(dateNaissance, anneeActuelle);

    // ── Prompt IA ──
    const prompt = `Tu es un expert de renommée mondiale en numérologie mystique, combinant :
- La tradition islamique : Ilm al-Huruf, science des lettres et des chiffres, Abjad
- La numérologie de Pythagore (occidentale)
- La numérologie chaldéenne (orientale)
- Les traditions spirituelles d'Afrique de l'Ouest : Sénégal, Wolof, Sérère, Diola

Tu analyses la personne suivante avec une profondeur et une précision extraordinaires, en utilisant son prénom, son histoire vibratoire, et les chiffres calculés.

DONNÉES CALCULÉES pour ${nomComplet} :
- Date de naissance : ${dateNaissance}
- Système utilisé : ${systeme}
- Chemin de Vie : ${cheminDeVie}
- Nombre d'Expression (destin extérieur) : ${nombreExpression}
- Nombre de l'Âme (désirs intérieurs) : ${nombreAme}
- Nombre de Personnalité (façade sociale) : ${nombrePersonnalite}
- Année Personnelle ${anneeActuelle} : ${anneePersonnelle}

Génère un rapport ULTRA-COMPLET, PROFOND, PERSONNALISÉ et en français, en JSON strict avec cette structure exacte :

{
  "titre": "titre poétique et personnalisé ex: 'L'Architecte de l'Harmonie'",
  "introduction": "3-4 phrases d'introduction personnalisées qui nomment la personne, décrivent sa combinaison unique de chiffres et sa mission globale",

  "cheminDeVie": {
    "nombre": ${cheminDeVie},
    "nom": "nom archétypal ex: Le Maître Bâtisseur / L'Harmonisatrice",
    "couleur": "couleur vibratoire associée",
    "pierre": "pierre précieuse associée",
    "mission": "150 mots — mission de vie profonde, raison d'être sur terre",
    "donsNaturels": "120 mots — talents innés, dons spirituels et pratiques",
    "karma": "100 mots — karmas à résoudre, leçons de vie à intégrer",
    "conseil": "conseil spirituel concret islamique ou africain"
  },

  "profilPsychologique": {
    "descriptionGenerale": "200 mots — portrait psychologique complet et nuancé, tensions intérieures, dynamiques entre les chiffres",
    "motivationsProfonde": "120 mots — ce qui anime vraiment cette personne au fond de son âme",
    "peursInconscientes": "100 mots — peurs cachées qui freinent son épanouissement",
    "schemasRepetitifs": "100 mots — patterns récurrents dans sa vie, comportements automatiques",
    "gestionStress": "80 mots — comment cette personne réagit sous pression et comment mieux gérer"
  },

  "qualites": [
    {
      "titre": "nom de la qualité",
      "description": "120 mots — description détaillée et concrète de cette qualité",
      "commentDevelopper": "conseil pratique islamique ou africain pour développer cette qualité",
      "verset": "verset coranique ou proverbe africain lié (optionnel)"
    },
    { "titre": "...", "description": "...", "commentDevelopper": "...", "verset": "..." },
    { "titre": "...", "description": "...", "commentDevelopper": "...", "verset": "..." },
    { "titre": "...", "description": "...", "commentDevelopper": "...", "verset": "..." }
  ],

  "defauts": [
    {
      "titre": "nom du défaut",
      "description": "100 mots — comment ce défaut se manifeste concrètement",
      "solutionIslamique": "remède spirituel islamique (dhikr, sourate, pratique)",
      "solutionPratique": "3 actions concrètes pour corriger ce défaut"
    },
    { "titre": "...", "description": "...", "solutionIslamique": "...", "solutionPratique": "..." },
    { "titre": "...", "description": "...", "solutionIslamique": "...", "solutionPratique": "..." }
  ],

  "vieProfessionnelle": {
    "styleTravail": "100 mots — environnement idéal, style de management, relation à l'argent",
    "metiersIdeaux": "liste de 8-10 métiers précis et adaptés à cette personne",
    "pilogesCarriere": "80 mots — erreurs professionnelles à éviter absolument"
  },

  "vieAmoureuse": {
    "styleAmoureux": "120 mots — comportement en couple, besoins affectifs, mode d'attachement",
    "compatibilites": "chiffres de vie compatibles et pourquoi",
    "conseilCouple": "conseil islamique ou africain pour la vie de couple"
  },

  "vieFamiliale": {
    "styleParental": "100 mots — relation aux enfants, style éducatif, dynamiques familiales",
    "roleEnFamille": "80 mots — rôle naturel dans la famille élargie"
  },

  "vieSociale": {
    "styleAmitie": "100 mots — comment cette personne noue et entretient ses amitiés",
    "placeGroupe": "60 mots — rôle naturel dans un groupe"
  },

  "developpementPersonnel": {
    "pratiquesSpirituelles": ["pratique1 islamique", "pratique2 africaine", "pratique3 universelle"],
    "habitudesQuotidiennes": ["habitude1", "habitude2", "habitude3"],
    "livresRecommandes": ["livre ou enseignement1", "livre ou enseignement2"]
  },

  "anneePersonnelle": {
    "nombre": ${anneePersonnelle},
    "theme": "thème de l'année ${anneeActuelle} en 5 mots",
    "description": "120 mots — ce qui attend cette personne cette année précisément",
    "opportunites": ["opportunité1", "opportunité2"],
    "pieges": ["danger1", "danger2"],
    "moisForts": ["mois1", "mois2", "mois3"]
  },

  "nombresExpression": {
    "nombre": ${nombreExpression},
    "description": "100 mots — destin extérieur et expression dans le monde"
  },

  "nombreAme": {
    "nombre": ${nombreAme},
    "description": "100 mots — désirs profonds et vie intérieure"
  },

  "nombrePersonnalite": {
    "nombre": ${nombrePersonnalite},
    "description": "80 mots — image projetée et première impression"
  },

  "compatibilitesChiffres": {
    "favorables": [liste de nombres],
    "difficiles": [liste de nombres],
    "explication": "50 mots"
  },

  "conclusionInspiratrice": "150 mots — conclusion personnalisée, encourageante, qui nomme la personne et synthétise son potentiel unique avec une touche spirituelle islamique et africaine"
}

IMPORTANT :
- Nomme la personne par son prénom (${nomComplet.split(" ")[0]}) dans le texte
- Sois PRÉCIS, PROFOND, et PERSONNEL — pas de généralités
- Intègre des références islamiques (versets, hadiths, noms d'Allah) ET africaines (proverbes wolof, sérère)
- Réponds UNIQUEMENT avec le JSON valide, aucun texte avant ou après`;

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

    // ── Sauvegarde BDD + déduction crédit si utilisateur connecté ──
    if (userId) {
      await prisma.numerologie.create({
        data: {
          userId,
          nomComplet,
          dateNaissance,
          systeme,
          cheminDeVie,
          nombreAme,
          nombreExpression,
          nombrePersonnalite,
          anneePersonnelle,
          rapport: JSON.stringify(rapport),
        }
      });
      // Déduire 1 crédit
      await prisma.userCredits.updateMany({
        where: { userId, credits: { gt: 0 } },
        data: { credits: { decrement: 1 } },
      });
    }

    return NextResponse.json({
      cheminDeVie, nombreExpression, nombreAme,
      nombrePersonnalite, anneePersonnelle, rapport
    });

  } catch (e) {
    console.error("Erreur numérologie:", e);
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 });
  }
}
