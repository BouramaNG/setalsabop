import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SetalSaBOP — La Voyance autrement !",
  description: "Voyance, interprétation de rêves, numérologie et compatibilité spirituelle au Sénégal. Marabouts certifiés, Islam, Christianisme, traditions africaines. Xam sa bop, dëkk sa bëj-gël.",
  keywords: [
    // Français
    "voyance", "voyance Sénégal", "marabout", "marabout Sénégal", "marabout en ligne",
    "interprétation de rêves", "rêve islam", "signification des rêves",
    "numérologie", "numérologie africaine", "compatibilité amoureuse",
    "spiritualité africaine", "mysticisme", "ésotérisme", "tarots", "divination",
    "horoscope", "astrologie", "prédiction", "bonne aventure",
    "Islam Sénégal", "prière", "protection spirituelle", "chance",
    "retour affectif", "envoûtement", "désenvoûtement",
    "Dakar", "Thiès", "Saint-Louis", "Kaolack", "Touba",
    // Wolof
    "xam sa bop", "dëkk sa bëj-gël", "setal sa bop", "marabout wolof",
    "rêve wolof", "ndëp", "xam-xam", "jëf ak yëgël", "bàkku ak yëgël",
    "doom Senegaal", "jëfandikoo ci Yàlla", "mbind mi", "liggéey",
    // Anglais (diaspora)
    "dream interpretation Senegal", "African spirituality", "Senegalese marabout",
    "Islamic dream meaning", "numerology Africa", "love compatibility Africa",
  ],
  openGraph: {
    title: "SetalSaBOP — La Voyance autrement !",
    description: "Voyance, interprétation de rêves, numérologie et compatibilité selon l'Islam, le Christianisme et les traditions africaines. Marabouts certifiés au Sénégal.",
    siteName: "SetalSaBOP",
    locale: "fr_SN",
    type: "website",
    url: "https://setalsabop.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "SetalSaBOP — La Voyance autrement !",
    description: "Voyance spirituelle, interprétation de rêves et numérologie au Sénégal. Xam sa bop, dëkk sa bëj-gël.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://setalsabop.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
