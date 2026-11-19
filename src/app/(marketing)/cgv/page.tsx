import { LegalPage } from "@/components/legal";

export const metadata = { title: "Conditions générales de vente" };

export default function Page() {
  return (
    <LegalPage title="Conditions générales de vente et d'utilisation">
      <h2>1. Objet</h2>
      <p>Les présentes conditions régissent l'utilisation de CreatorOS, logiciel en ligne d'aide à la création de contenu, et la souscription aux offres payantes.</p>
      <h2>2. Offres et crédits</h2>
      <p>CreatorOS propose un plan gratuit et des abonnements mensuels ou annuels donnant droit à un nombre de crédits IA renouvelés à chaque période. Les crédits mensuels non utilisés ne sont pas reportés. Les crédits achetés à l'unité n'expirent pas tant que le compte est actif.</p>
      <h2>3. Prix et paiement</h2>
      <p>Les prix sont indiqués en euros TTC. Le paiement est effectué par carte via Stripe. L'abonnement est reconduit tacitement à chaque échéance.</p>
      <h2>4. Résiliation</h2>
      <p>L'abonnement est sans engagement et résiliable à tout moment depuis l'espace « Abonnement ». L'accès aux avantages est maintenu jusqu'à la fin de la période en cours.</p>
      <h2>5. Droit de rétractation</h2>
      <p>Conformément à l'article L221-28 du Code de la consommation, l'utilisateur qui consomme des crédits IA dès la souscription reconnaît renoncer à son droit de rétractation pour la part du service exécutée.</p>
      <h2>6. Contenus générés</h2>
      <p>Les contenus générés par l'IA sont fournis à titre de proposition. L'utilisateur reste responsable de leur relecture et de leur publication.</p>
      <h2>7. Contact</h2>
      <p>Pour toute question : [email de contact].</p>
    </LegalPage>
  );
}
