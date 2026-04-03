import { getArticleBySlug, getAllArticleSlugs } from '@/lib/articles';
import { notFound } from 'next/navigation';
import ArticleDetailClient from './ArticleDetailClient';

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Article introuvable' };
  return {
    title: `${article.title} | COEF-Ressources`,
    description: article.summary,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <ArticleDetailClient article={article} />;
}
