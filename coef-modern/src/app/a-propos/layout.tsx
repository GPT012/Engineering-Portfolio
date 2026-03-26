import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "À Propos | Notre Histoire & Vision - CoefRessources",
  description: "Découvrez le parcours de CoefRessources depuis 2000. Vision, mission et leadership actuel sous la direction de Léa RAKOTO. L'excellence à Madagascar.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
