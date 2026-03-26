'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import type { Article } from '@/lib/articles';

const EASING: [number, number, number, number] = [0.85, 0, 0.15, 1];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ArticleDetailClient({ article }: { article: Article }) {
  return (
    <div className="min-h-screen bg-brand-sand/10">
      {/* HERO */}
      <section className="relative bg-brand-blue pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="article-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#article-grid)" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASING }}
          >
            <Link 
              href="/actualites" 
              className="inline-flex items-center gap-3 text-white/50 hover:text-brand-yellow transition-colors text-[11px] font-black uppercase tracking-[0.3em] mb-16 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
              Retour aux actualités
            </Link>

            <div className="flex items-center gap-6 mb-10">
              <span className="text-brand-green font-black text-[11px] uppercase tracking-[0.4em]">{article.category}</span>
              <span className="h-px w-8 bg-white/20" />
              <span className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                <Calendar size={12} />
                {formatDate(article.date)}
              </span>
              <span className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                <Clock size={12} />
                {article.readTime}
              </span>
            </div>

            <h1 className="font-heading text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter">
              {article.title}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* COVER IMAGE */}
      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: EASING }}
          className="relative aspect-[21/9] overflow-hidden shadow-2xl border border-brand-blue/5"
        >
          <Image 
            src={article.image} 
            alt={article.title} 
            fill 
            className="object-cover" 
            priority 
          />
        </motion.div>
      </div>

      {/* ARTICLE CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: EASING }}
        className="max-w-3xl mx-auto px-6 pb-40"
      >
        <article 
          className="prose prose-lg max-w-none
            prose-headings:font-heading prose-headings:font-black prose-headings:text-brand-blue prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:border-l-4 prose-h2:border-brand-green prose-h2:pl-6
            prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
            prose-p:text-brand-blue/70 prose-p:leading-[1.9] prose-p:font-medium
            prose-strong:text-brand-blue prose-strong:font-black
            prose-blockquote:border-l-4 prose-blockquote:border-brand-yellow prose-blockquote:bg-brand-yellow/5 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
            prose-blockquote:text-brand-blue/80
            prose-a:text-brand-green prose-a:font-bold prose-a:no-underline hover:prose-a:underline
            prose-li:text-brand-blue/70 prose-li:font-medium
          "
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />

        {/* BOTTOM NAV */}
        <div className="mt-20 pt-12 border-t border-brand-blue/10 flex items-center justify-between">
          <Link 
            href="/actualites" 
            className="inline-flex items-center gap-3 text-brand-blue/50 hover:text-brand-blue transition-colors text-[11px] font-black uppercase tracking-[0.3em] group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            Tous les articles
          </Link>
          <Link 
            href="/contact" 
            className="bg-brand-green text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-brand-blue transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
