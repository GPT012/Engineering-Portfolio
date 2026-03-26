import { getAllArticles, getAllCategories } from '@/lib/articles';
import ActualitesClient from './ActualitesClient';

export const metadata = {
  title: 'Actualités | COEF-Ressources',
  description: 'Décryptages stratégiques, rapports Afrobarometer et analyses de gouvernance par COEF-Ressources.',
};

export default function ActualitesPage() {
  const articles = getAllArticles();
  const categories = getAllCategories();

  return <ActualitesClient articles={articles} categories={categories} />;
}
