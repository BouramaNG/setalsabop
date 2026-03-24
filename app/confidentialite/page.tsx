export default function ConfidentialitePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #06041A, #0D1B4B)",
      padding: "80px 24px 60px",
      fontFamily: "Sora, sans-serif",
    }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", color: "#C4B8E0", lineHeight: 1.8 }}>
        <h1 style={{ color: "#F4C842", fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
          Politique de Confidentialité
        </h1>
        <p style={{ color: "#6B5F8A", marginBottom: "40px" }}>Dernière mise à jour : mars 2026</p>

        <Section title="1. Données collectées">
          Nous collectons les données suivantes lors de votre utilisation de SetalSaBOP :
          <ul>
            <li>Informations de compte : prénom, nom, email, tradition spirituelle</li>
            <li>Données d'analyse : textes de rêves, noms pour la numérologie et la compatibilité</li>
            <li>Pour les marabouts : photo selfie et copie de carte d'identité (CNI) à des fins de vérification KYC</li>
            <li>Données de paiement : numéro Wave partiel (non complet), référence de transaction</li>
          </ul>
        </Section>

        <Section title="2. Utilisation des données">
          Vos données sont utilisées exclusivement pour :
          <ul>
            <li>Fournir les analyses spirituelles personnalisées (interprétation, numérologie, compatibilité)</li>
            <li>Gérer votre compte et vos crédits</li>
            <li>Vérifier l'identité des marabouts inscrits sur la plateforme</li>
            <li>Vous envoyer des notifications liées à votre compte (email uniquement)</li>
          </ul>
          Nous ne vendons, ne partageons, ni ne revendons vos données à des tiers.
        </Section>

        <Section title="3. Données KYC (Marabouts)">
          Les photos d'identité (selfie et CNI) collectées dans le cadre de l'inscription des marabouts sont
          stockées de manière sécurisée sur notre serveur, accessibles uniquement par notre équipe d'administration
          pour vérification. Ces fichiers ne sont jamais partagés publiquement.
        </Section>

        <Section title="4. Conservation des données">
          Vos données sont conservées tant que votre compte est actif. Sur simple demande à notre adresse email,
          vous pouvez demander la suppression de votre compte et de toutes vos données associées.
        </Section>

        <Section title="5. Sécurité">
          Nous mettons en œuvre des mesures techniques (chiffrement, authentification) pour protéger vos données.
          Les mots de passe sont hachés et ne sont jamais stockés en clair.
        </Section>

        <Section title="6. Vos droits">
          Conformément aux lois applicables, vous disposez d'un droit d'accès, de rectification et de suppression
          de vos données personnelles. Pour exercer ces droits, contactez-nous par email.
        </Section>

        <Section title="7. Contact">
          Pour toute question relative à cette politique :
          <br />
          <strong style={{ color: "#F4C842" }}>contact@setalsabop.com</strong>
        </Section>

        <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <a href="/" style={{ color: "#F4C842", textDecoration: "none", fontSize: "14px" }}>
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ color: "#F0EDF8", fontSize: "17px", fontWeight: 700, marginBottom: "12px" }}>{title}</h2>
      <div style={{ fontSize: "14px", color: "#9B8FC2" }}>{children}</div>
    </div>
  );
}
