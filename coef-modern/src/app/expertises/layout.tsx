import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Nos Expertises | RH, Audit & Conseil à Madagascar | CoefRessources",
  description: "Découvrez nos expertises multidisciplinaires : Ressources Humaines, Organisation, Gestion de Projets et Sondages d'Opinion à Madagascar. 24 ans de savoir-faire.",
};

export default function ExpertisesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
