'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Article } from '@/lib/articles';

const EASING: [number, number, number, number] = [0.85, 0, 0.15, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASING } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface Props {
  articles: Article[];
  categories: string[];
}

export default function ActualitesClient({ articles, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter(a => {
    const matchesCategory = activeCategory === "Toutes" || a.category === activeCategory;
    const matchesSearch = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles.find(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  return (
    <div className="pt-24 min-h-screen bg-brand-sand/10 selection:bg-brand-yellow selection:text-brand-blue overflow-hidden">
      
      {/* 1. HERO - Blue Journal Style */}
      <section className="relative bg-brand-blue pt-32 pb-60 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="journal-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#journal-grid)" />
          </svg>
        </div>
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
          <motion.div initial="hidden" animate="show" variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="mb-12 flex items-center justify-center md:justify-start gap-6">
              <span className="h-px w-10 bg-brand-yellow" />
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-yellow">Intelligence & Prospective</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="font-heading text-6xl md:text-[100px] font-black text-white leading-[0.9] tracking-tighter mb-12">
              Le Journal du <br /> <span className="serif-heading italic font-normal text-brand-yellow">Capital Humain.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-white/50 max-w-2xl leading-relaxed font-medium">
              Décryptages stratégiques, rapports Afrobarometer et analyses de gouvernance pour éclairer les décisions de demain.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 relative z-20 -mt-24">
        
        {/* SEARCH & FILTER BAR */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: EASING }}
          className="flex flex-col lg:flex-row justify-between items-stretch gap-0 mb-32 bg-white shadow-2xl overflow-hidden border border-brand-blue/5"
        >
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-nowrap bg-brand-sand/30 border-b lg:border-b-0 lg:border-r border-brand-blue/10">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 lg:px-8 py-5 text-[9px] lg:text-[11px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] transition-all duration-500 border-r border-b sm:border-b-0 border-brand-blue/5 last:border-r-0",
                  activeCategory === cat ? "bg-brand-blue text-white" : "text-brand-blue/40 hover:text-brand-blue hover:bg-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative group w-full lg:w-80 flex items-center bg-white">
            <Search size={16} className="absolute left-8 text-brand-green" />
            <input 
              type="text" 
              placeholder="RECHERCHER..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-8 pl-16 pr-10 text-[10px] font-black uppercase tracking-widest text-brand-blue outline-none transition-all placeholder:text-brand-blue/20"
            />
          </div>
        </motion.div>

        {/* NO RESULTS */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-32">
            <p className="text-brand-blue/40 text-lg font-medium">Aucun article trouvé pour cette recherche.</p>
          </div>
        )}

        {/* FEATURED ARTICLE */}
        {featuredArticle && activeCategory === "Toutes" && !searchQuery && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASING }}
            className="mb-40 group relative grid md:grid-cols-12 gap-0 bg-white border border-brand-blue/5 overflow-hidden shadow-2xl hover:shadow-[0_80px_120px_rgba(60,80,139,0.1)] transition-all duration-1000"
          >
            <div className="md:col-span-12 lg:col-span-7 aspect-[16/9] md:aspect-auto relative overflow-hidden">
               <Image src={featuredArticle.image} alt={featuredArticle.title} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms] group-hover:scale-105" />
               <div className="absolute top-10 left-10 bg-brand-green text-white px-6 py-2 text-[10px] font-black uppercase tracking-[0.4em]">À l&apos;honneur</div>
            </div>
            
            <div className="md:col-span-12 lg:col-span-5 p-12 md:p-20 flex flex-col justify-center bg-white">
              <div className="flex items-center gap-6 mb-10">
                <span className="text-brand-green font-black text-[11px] uppercase tracking-[0.4em]">{featuredArticle.category}</span>
                <span className="h-px w-8 bg-brand-blue/10" />
                <span className="text-brand-blue/30 text-[10px] font-bold uppercase tracking-widest">{formatDate(featuredArticle.date)}</span>
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-black text-brand-blue leading-[1.1] mb-10 tracking-tighter group-hover:text-brand-green transition-colors duration-500">
                {featuredArticle.title}
              </h2>
              <p className="text-brand-blue/50 text-lg mb-12 font-medium leading-relaxed italic">
                {featuredArticle.summary}
              </p>
              <div className="flex items-center justify-between">
                <Link href={`/actualites/${featuredArticle.slug}`} className="inline-flex items-center gap-6 text-brand-blue font-black text-[11px] uppercase tracking-[0.4em] hover:text-brand-green transition-colors group/link">
                  Lire l&apos;analyse <ArrowRight size={18} className="group-hover/link:translate-x-3 transition-transform" />
                </Link>
                <span className="text-brand-blue/20 text-[9px] font-bold uppercase tracking-widest">{featuredArticle.readTime}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ARTICLES GRID */}
        <motion.div 
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-12"
        >
          {regularArticles.map((article) => (
            <motion.div 
              key={article.slug} variants={fadeInUp}
              className="flex flex-col group"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden mb-10 bg-brand-sand border border-brand-blue/5 shadow-xl group-hover:shadow-2xl transition-all duration-1000">
                <Image src={article.image} alt={article.title} fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1500ms]" />
                <div className="absolute inset-0 bg-brand-blue/10 opacity-40 group-hover:opacity-0 transition-opacity" />
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-brand-green font-black text-[9px] uppercase tracking-[0.3em]">{article.category}</span>
                <span className="h-px w-4 bg-brand-blue/10" />
                <span className="text-brand-blue/30 text-[9px] font-bold uppercase tracking-wider">{formatDate(article.date)}</span>
              </div>
              
              <h3 className="font-heading text-2xl font-black text-brand-blue mb-4 leading-snug group-hover:text-brand-green transition-colors duration-500 tracking-tight">
                {article.title}
              </h3>

              <p className="text-brand-blue/50 text-sm leading-relaxed mb-8 line-clamp-2">
                {article.summary}
              </p>
              
              <div className="mt-auto pt-8 border-t border-brand-blue/5">
                <Link href={`/actualites/${article.slug}`} className="flex items-center justify-between group/btn text-brand-blue/40 hover:text-brand-blue transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Continuer la lecture</span>
                  <ChevronRight size={20} className="group-hover/btn:translate-x-2 transition-transform text-brand-green" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* NEWSLETTER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASING }}
          className="mt-60 bg-brand-sand border border-brand-blue/5 p-16 md:p-32 text-center relative overflow-hidden shadow-3xl mb-40"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-yellow/5 rounded-full blur-[100px]" />
          
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="text-brand-green font-black text-[11px] uppercase tracking-[0.6em] mb-10 block">Newsletter Privée</span>
            <h2 className="font-heading text-4xl md:text-6xl font-black text-brand-blue mb-12 tracking-tighter leading-[0.95]">Ne manquez aucune <br /> <span className="serif-heading italic font-normal">nouvelle publication.</span></h2>
            <p className="text-brand-blue/60 text-xl mb-16 font-medium leading-relaxed italic">
              Rapports sectoriels, notes de conjoncture et analyses RH. Directement dans votre boîte mail.
            </p>
            
            <form className="max-w-lg mx-auto flex flex-col sm:flex-row items-stretch gap-0 border border-brand-blue/10 shadow-xl" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="VOTRE@EMAIL.COM" 
                className="flex-1 bg-white px-8 py-6 text-[11px] font-black uppercase tracking-widest text-brand-blue outline-none placeholder:text-brand-blue/20" 
              />
              <button className="bg-brand-blue text-white px-10 py-6 font-black text-[11px] uppercase tracking-[0.4em] hover:bg-brand-green transition-all duration-500 whitespace-nowrap">
                S&apos;abonner
              </button>
            </form>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
