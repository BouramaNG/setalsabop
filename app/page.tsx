"use client";
import { useState, useEffect } from "react";
import StarField from "@/components/StarField";
import Navbar from "@/components/Navbar";
import HomePage from "@/components/pages/HomePage";
import OnboardingPage from "@/components/pages/OnboardingPage";
import DreamFormPage from "@/components/pages/DreamFormPage";
import ResultsPage from "@/components/pages/ResultsPage";
import MarabotsPage from "@/components/pages/MarabotsPage";
import JournalPage from "@/components/pages/JournalPage";
import MaraboutProPage from "@/components/pages/MaraboutProPage";
import MaraboutSignupPage from "@/components/pages/MaraboutSignupPage";
import NumerologiePage from "@/components/pages/NumerologiePage";
import CompatibilitePage from "@/components/pages/CompatibilitePage";
import ProfilPage from "@/components/pages/ProfilPage";
import TarifsPage from "@/components/pages/TarifsPage";
import AdminPage from "@/components/pages/AdminPage";

type Page = "home" | "onboarding" | "dream" | "results" | "marabouts" | "journal" | "marabout-pro" | "marabout-signup" | "numerologie" | "compatibilite" | "profil" | "tarifs" | "admin";

export interface User {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  prenomMere?: string;
  nomMere?: string;
  tradition: string;
  genre: string;
  age: string;
}

export interface TraditionResult {
  text: string;
  ritual: string;
}

export interface DreamInterpretation {
  title: string;
  mainSymbols: string[];
  summary: string;
  interpretations: {
    islam: TraditionResult;
    christianisme: TraditionResult;
    psychologie: TraditionResult;
    ancestral: TraditionResult;
  };
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [dreamText, setDreamText] = useState("");
  const [dreamEmotions, setDreamEmotions] = useState<string[]>([]);
  const [dreamInterpretation, setDreamInterpretation] = useState<DreamInterpretation | null>(null);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem("dreaminsight_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        fetchCredits(u.id);
      } catch {
        localStorage.removeItem("dreaminsight_user");
      }
    }
  }, []);

  async function fetchCredits(userId: string) {
    try {
      const res = await fetch(`/api/credits?userId=${userId}`);
      const data = await res.json();
      setCredits(data.credits ?? 0);
    } catch {}
  }

  const navigate = (p: string) => {
    // Pages nécessitant une connexion
    if (!user && ["dream", "journal", "numerologie", "compatibilite", "profil"].includes(p)) {
      setPage("onboarding");
      return;
    }
    // Pages nécessitant des crédits (utilisateur connecté avec 0 crédits)
    if (user && credits !== null && credits <= 0 && ["dream", "numerologie", "compatibilite"].includes(p)) {
      setPage("tarifs");
      return;
    }
    setPage(p as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOnboardingComplete = (u: User) => {
    setUser(u);
    localStorage.setItem("dreaminsight_user", JSON.stringify(u));
    fetchCredits(u.id);
    setPage("dream");
  };

  const handleDreamResult = (
    dream: string,
    emotions: string[],
    interpretation: DreamInterpretation
  ) => {
    setDreamText(dream);
    setDreamEmotions(emotions);
    setDreamInterpretation(interpretation);
    setPage("results");
    refreshCredits();
  };

  const handleNewDream = () => {
    setDreamText("");
    setDreamEmotions([]);
    setDreamInterpretation(null);
    setPage("dream");
  };

  const handleLogout = () => {
    localStorage.removeItem("dreaminsight_user");
    setUser(null);
    setCredits(null);
    setPage("home");
  };

  const refreshCredits = () => { if (user) fetchCredits(user.id); };

  const navPages = ["home", "dream", "journal", "marabouts", "marabout-pro", "marabout-signup", "numerologie", "compatibilite", "profil", "tarifs", "admin"] as const;
  const showNav = navPages.includes(page as typeof navPages[number]);

  return (
    <>
      <StarField />
      {showNav && (
        <Navbar current={page} onNavigate={navigate} user={user} onLogout={handleLogout} credits={credits} />
      )}

      {page === "home" && (
        <HomePage onNavigate={navigate} user={user} />
      )}

      {page === "onboarding" && (
        <OnboardingPage onComplete={handleOnboardingComplete} />
      )}

      {page === "dream" && user && (
        <DreamFormPage user={user} onResult={handleDreamResult} onNavigate={navigate} />
      )}

      {page === "results" && user && dreamInterpretation && (
        <ResultsPage
          dream={dreamText}
          emotions={dreamEmotions}
          user={user}
          interpretation={dreamInterpretation}
          onNavigate={navigate}
          onNewDream={handleNewDream}
        />
      )}

      {page === "marabouts" && (
        <MarabotsPage onNavigate={navigate} />
      )}

      {page === "journal" && user && (
        <JournalPage user={user} onNavigate={navigate} />
      )}

      {page === "marabout-pro" && (
        <MaraboutProPage onNavigate={navigate} />
      )}

      {page === "marabout-signup" && (
        <MaraboutSignupPage onNavigate={navigate} />
      )}

      {page === "numerologie" && user && (
        <NumerologiePage user={user} onNavigate={navigate} onAnalysisDone={refreshCredits} />
      )}

      {page === "compatibilite" && user && (
        <CompatibilitePage user={user} onNavigate={navigate} onAnalysisDone={refreshCredits} />
      )}

      {page === "profil" && user && (
        <ProfilPage user={user} onNavigate={navigate} onLogout={handleLogout} />
      )}

      {page === "tarifs" && (
        <TarifsPage user={user} onNavigate={navigate} onCreditsAdded={refreshCredits} />
      )}

      {page === "admin" && (
        <AdminPage />
      )}
    </>
  );
}
