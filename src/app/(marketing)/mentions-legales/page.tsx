import { LegalPage } from "@/components/legal";

export const metadata = { title: "Mentions légales" };

export default function Page() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur</h2>
      <p>CreatorOS est édité par [Nom ou raison sociale], [statut juridique], SIRET [numéro], dont le siège est situé [adresse]. Directeur de la publication : [nom]. Contact : [email].</p>
      <h2>Hébergement</h2>
      <p>Application hébergée par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Données stockées par Supabase (région Union européenne).</p>
      <h2>Propriété intellectuelle</h2>
      <p>L'ensemble des éléments du site (marque, logo, interface, textes) est protégé. Les contenus générés par les utilisateurs leur appartiennent.</p>
    </LegalPage>
  );
}
