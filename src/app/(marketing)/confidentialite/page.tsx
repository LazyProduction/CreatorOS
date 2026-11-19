import { LegalPage } from "@/components/legal";

export const metadata = { title: "Politique de confidentialité" };

export default function Page() {
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Données collectées</h2>
      <p>Email, nom ou pseudo, informations de profil créateur, contenus de tes projets, historique des générations et données de facturation (gérées par Stripe, nous ne stockons pas ta carte).</p>
      <h2>Finalités</h2>
      <p>Fournir le service, personnaliser les générations IA, gérer l'abonnement et assurer le support. Aucune revente de données.</p>
      <h2>Sous-traitants</h2>
      <p>Supabase (base de données et authentification), Vercel (hébergement), Stripe (paiement), Anthropic (génération IA : les textes envoyés ne servent pas à entraîner les modèles).</p>
      <h2>Tes droits</h2>
      <p>Tu peux accéder, corriger, exporter ou supprimer tes données en écrivant à [email de contact]. Tu peux aussi saisir la CNIL.</p>
    </LegalPage>
  );
}
