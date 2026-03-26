import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const articlesDirectory = path.join(process.cwd(), 'content/actualites');

export interface Article {
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  image: string;
  readTime: string;
  featured: boolean;
  content?: string;
}

/**
 * Get all articles sorted by date (most recent first).
 * Reads .md files from content/actualites/
 */
export function getAllArticles(): Article[] {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(articlesDirectory).filter(f => f.endsWith('.md'));

  const articles = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(articlesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title || 'Sans titre',
      date: data.date || '2024-01-01',
      category: data.category || 'Actualité',
      summary: data.summary || '',
      image: data.image || '/images/about-office.png',
      readTime: data.readTime || '3 min',
      featured: data.featured || false,
    };
  });

  // Sort by date descending (most recent first)
  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single article by slug, with full HTML content.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const htmlContent = processedContent.toString();

  return {
    slug,
    title: data.title || 'Sans titre',
    date: data.date || '2024-01-01',
    category: data.category || 'Actualité',
    summary: data.summary || '',
    image: data.image || '/images/about-office.png',
    readTime: data.readTime || '3 min',
    featured: data.featured || false,
    content: htmlContent,
  };
}

/**
 * Get all unique categories from articles.
 */
export function getAllCategories(): string[] {
  const articles = getAllArticles();
  const categories = new Set(articles.map(a => a.category));
  return ['Toutes', ...Array.from(categories)];
}

/**
 * Get all article slugs (for static generation).
 */
export function getAllArticleSlugs(): string[] {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }
  return fs.readdirSync(articlesDirectory)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}
