import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SetalSaBOP — La Voyance autrement !",
  description: "Interprétez vos rêves, découvrez votre numérologie et testez votre compatibilité selon vos traditions spirituelles. Marabouts certifiés au Sénégal.",
  openGraph: {
    title: "SetalSaBOP — La Voyance autrement !",
    description: "Interprétation de rêves, numérologie et compatibilité selon l'Islam, le Christianisme et les traditions africaines.",
    siteName: "SetalSaBOP",
    locale: "fr_SN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SetalSaBOP — La Voyance autrement !",
    description: "Interprétation de rêves et voyance spirituelle au Sénégal.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
