import { getAllArticles, getAllCategories } from '@/lib/articles';
import ActualitesClient from './ActualitesClient';

export const metadata = {
  title: 'Actualités | COEF-Ressources',
  description: 'Décryptages stratégiques, rapports Afrobarometer et analyses de gouvernance par COEF-Ressources.',
};

export default async function ActualitesPage() {
  const articles = await getAllArticles();
  const categories = await getAllCategories();

  return <ActualitesClient articles={articles} categories={categories} />;
}
