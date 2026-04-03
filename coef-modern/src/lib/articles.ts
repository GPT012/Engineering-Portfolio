import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { supabase } from './supabase';

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
 * Merges local .md files and Supabase records.
 */
export async function getAllArticles(): Promise<Article[]> {
  // 1. Get Local Articles
  let localArticles: Article[] = [];
  if (fs.existsSync(articlesDirectory)) {
    const fileNames = fs.readdirSync(articlesDirectory).filter(f => f.endsWith('.md'));
    localArticles = fileNames.map((fileName) => {
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
  }

  // 2. Get Supabase Articles
  let remoteArticles: Article[] = [];
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (data && !error) {
      remoteArticles = data.map((item: any) => ({
        slug: item.slug,
        title: item.title,
        date: item.published_at.split('T')[0],
        category: item.category,
        summary: item.summary,
        image: item.image_url || '/images/about-office.png',
        readTime: item.read_time,
        featured: item.is_featured,
      }));
    }
  } catch (e) {
    console.error('Failed to fetch from Supabase:', e);
  }

  // 3. Merge & Sort
  const allArticles = [...remoteArticles, ...localArticles];
  return allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single article by slug.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  // 1. Try Supabase first
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (data && !error) {
      return {
        slug: data.slug,
        title: data.title,
        date: data.published_at.split('T')[0],
        category: data.category,
        summary: data.summary,
        image: data.image_url || '/images/about-office.png',
        readTime: data.read_time,
        featured: data.is_featured,
        content: data.content, // HTML directly from Supabase
      };
    }
  } catch (e) {
    console.error('Supabase fetch failed for slug:', slug);
  }

  // 2. Fallback to Local
  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  return {
    slug,
    title: data.title || 'Sans titre',
    date: data.date || '2024-01-01',
    category: data.category || 'Actualité',
    summary: data.summary || '',
    image: data.image || '/images/about-office.png',
    readTime: data.readTime || '3 min',
    featured: data.featured || false,
    content: processedContent.toString(),
  };
}

/**
 * Get all unique categories.
 */
export async function getAllCategories(): Promise<string[]> {
  const articles = await getAllArticles();
  const categories = new Set(articles.map(a => a.category));
  return ['Toutes', ...Array.from(categories)];
}

/**
 * Get all article slugs.
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  // Combine local and remote slugs
  const localSlugs = fs.existsSync(articlesDirectory) 
    ? fs.readdirSync(articlesDirectory).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))
    : [];
    
  const { data } = await supabase.from('articles').select('slug');
  const remoteSlugs = data ? data.map((item: any) => item.slug) : [];

  return Array.from(new Set([...localSlugs, ...remoteSlugs]));
}
