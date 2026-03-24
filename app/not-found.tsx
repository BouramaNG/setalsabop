import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #06041A, #0D1B4B)",
      fontFamily: "Sora, sans-serif",
      padding: "24px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "80px", marginBottom: "16px" }}>🌙</div>
      <h1 style={{ fontSize: "72px", fontWeight: 900, color: "rgba(255,255,255,0.06)", margin: "0 0 8px" }}>404</h1>
      <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#F0EDF8", margin: "0 0 12px" }}>
        Cette page n'existe pas
      </h2>
      <p style={{ color: "#9B8FC2", fontSize: "15px", maxWidth: "320px", lineHeight: 1.6, marginBottom: "32px" }}>
        Comme dans un rêve, cette page s'est évaporée. Retourne à l'accueil pour continuer ton voyage.
      </p>
      <Link href="/" style={{
        display: "inline-block",
        padding: "12px 28px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #F4C842, #E8A020)",
        color: "#0D0B2B",
        fontWeight: 700,
        fontSize: "14px",
        textDecoration: "none",
      }}>
        Retour à l'accueil
      </Link>
    </div>
  );
}
