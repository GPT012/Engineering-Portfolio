'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Maximize2, MapPin, Loader2, Sparkles, Plus, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Category = 'Tous' | 'Terrain' | 'Formation' | 'Afrobarometer' | 'Social';

interface Photo {
  src: string;
  category: Category;
  title: string;
  location?: string;
  description: string;
  span?: 'row-span-2' | 'col-span-2' | '';
}

const INITIAL_PHOTOS: Photo[] = [
  {
    src: '/images/portfolio/IMG_6226.JPG',
    category: 'Terrain',
    title: 'Logistique fluviale',
    location: 'Madagascar profond',
    description: 'Accès aux zones les plus reculées par voie fluviale pour garantir la représentativité des données.',
    span: 'col-span-2'
  },
  {
    src: '/images/portfolio/IMG_5840.JPG',
    category: 'Terrain',
    title: 'Panorama des Plateaux',
    location: 'Haute Terre',
    description: 'Progression des équipes de terrain vers les villages isolés.',
    span: 'row-span-2'
  }
  // ... (the rest are fetched from Supabase anyway)
];

const CATEGORIES: Category[] = ['Tous', 'Terrain', 'Formation', 'Afrobarometer', 'Social'];

export default function PortfolioGallery() {
  const [filter, setFilter] = useState<Category>('Tous');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error) {
          const remotePhotos: Photo[] = data.map((item: any) => ({
            src: item.image_url,
            category: item.category as Category,
            title: item.title,
            location: item.location,
            description: item.description,
            span: item.span as any,
          }));
          
          // Combine unique photos (avoid duplicates if initial ones are in DB)
          setPhotos(remotePhotos);
        }
      } catch (err) {
        console.error('Portfolio fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, []);

  const filteredPhotos = useMemo(() => {
    const list = filter === 'Tous' 
      ? photos 
      : photos.filter(p => p.category === filter);
    return list;
  }, [photos, filter]);

  const displayedPhotos = filteredPhotos.slice(0, visibleCount);

  // Helper to extract a "Stat" from description if it contains numbers/percentages
  const extractStat = (desc: string) => {
    const match = desc.match(/(\d+%|\d+,\d+%|\d+ pays|\d+ ans)/i);
    return match ? match[0] : null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-12 h-12 text-brand-yellow animate-spin" />
        <p className="text-brand-blue/40 font-heading font-black tracking-widest uppercase text-xs">Initialisation de la galerie...</p>
      </div>
    );
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* FILTERS - STICKY-READY */}
        <div className="flex flex-wrap justify-center gap-3 mb-20">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                setVisibleCount(12); // Reset count on filter change
              }}
              className={cn(
                "group relative px-8 py-3 rounded-full text-[10px] uppercase font-black tracking-[0.2em] transition-all duration-500 overflow-hidden",
                filter === cat
                  ? "bg-brand-blue text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] scale-105"
                  : "bg-brand-blue/5 text-brand-blue hover:bg-brand-blue/10"
              )}
            >
              <span className="relative z-10">{cat}</span>
              {filter === cat && (
                <motion.div 
                  layoutId="activeFilter"
                  className="absolute inset-0 bg-brand-blue"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* MASONRY GRID WITH FLUID LAYOUT */}
        <LayoutGroup>
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px] md:auto-rows-[340px]"
          >
            <AnimatePresence mode="popLayout">
              {displayedPhotos.map((photo, idx) => {
                const stat = extractStat(photo.description);
                return (
                  <motion.div
                    key={photo.src}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      opacity: { duration: 0.3 },
                      layout: { type: "spring", bounce: 0.2, duration: 0.7 }
                    }}
                    className={cn(
                      "group relative overflow-hidden rounded-[2.5rem] cursor-pointer bg-brand-blue/5 border border-brand-blue/5",
                      photo.span === 'col-span-2' ? 'md:col-span-2' : '',
                      photo.span === 'row-span-2' ? 'md:row-span-2' : ''
                    )}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                    />
                    
                    {/* DATA POP OVERLAY (NEW) */}
                    {stat && (
                      <div className="absolute top-6 left-6 z-20">
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-yellow/90 backdrop-blur-md rounded-full shadow-xl"
                        >
                          <Sparkles className="w-3 h-3 text-brand-blue" />
                          <span className="text-brand-blue text-[10px] font-black uppercase tracking-tighter">
                            {stat}
                          </span>
                        </motion.div>
                      </div>
                    )}

                    {/* PREMIUM OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/95 via-brand-blue/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10">
                      <div className="flex items-center gap-3 mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                        <span className="px-4 py-1.5 bg-brand-yellow text-brand-blue text-[9px] font-black uppercase rounded-full">
                          {photo.category}
                        </span>
                        {photo.location && (
                          <span className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold">
                            <MapPin size={12} className="text-brand-yellow" />
                            {photo.location}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-white font-heading font-black text-2xl leading-tight mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                        {photo.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-white/50 text-[10px] uppercase tracking-[0.3em] font-black translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">
                        <span className="flex items-center gap-2 group/btn">
                          Détails Expertise 
                          <div className="w-6 h-[1px] bg-white/20 group-hover/btn:w-12 transition-all" />
                        </span>
                        <div className="h-10 w-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-brand-blue flex items-center justify-center transition-all">
                          <Maximize2 size={18} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {/* LOAD MORE BAR */}
        {visibleCount < filteredPhotos.length && (
          <div className="mt-24 text-center">
             <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="group relative inline-flex items-center gap-4 px-12 py-6 bg-brand-blue text-white rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-brand-yellow hover:text-brand-blue transition-all duration-500 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Plus className="w-4 h-4" />
              <span className="relative z-10 text-nowrap">Charger plus d'analyses & missions</span>
              <span className="relative z-10 px-3 py-1 bg-white/10 rounded-full text-[9px]">
                {filteredPhotos.length - visibleCount} restantes
              </span>
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {displayedPhotos.length === 0 && !loading && (
          <div className="py-40 text-center">
            <h3 className="text-brand-blue/30 text-3xl font-heading font-black italic">Aucune archive correspondante.</h3>
          </div>
        )}

        {/* LIGHTBOX (MODAL) */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-brand-blue/98 backdrop-blur-2xl flex items-center justify-center p-6 md:p-12"
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.button 
                className="absolute top-10 right-10 z-50 text-white/50 hover:text-white transition-colors"
                onClick={() => setSelectedPhoto(null)}
              >
                <Plus className="w-10 h-10 rotate-45" />
              </motion.button>

              <div 
                className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                onClick={e => e.stopPropagation()}
              >
                <motion.div 
                  layoutId={selectedPhoto.src}
                  className="relative aspect-square md:aspect-auto md:h-[80vh] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-white/5"
                >
                  <Image
                    src={selectedPhoto.src}
                    alt={selectedPhoto.title}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </motion.div>
                
                <div className="text-left">
                   <div className="flex items-center gap-4 mb-8">
                    <span className="px-6 py-2 bg-brand-yellow text-brand-blue text-[10px] font-black uppercase rounded-full shadow-xl">
                      {selectedPhoto.category}
                    </span>
                    {selectedPhoto.location && (
                      <span className="flex items-center gap-2 text-white/60 text-sm font-bold uppercase tracking-widest">
                        <MapPin size={16} className="text-brand-yellow" />
                        {selectedPhoto.location}
                      </span>
                    )}
                  </div>
                  <h2 className="text-5xl md:text-8xl font-heading font-black text-white mb-10 leading-[0.9] tracking-tighter">
                    {selectedPhoto.title}
                  </h2>
                  <div className="h-px bg-white/10 w-24 mb-10" />
                  <p className="text-xl md:text-2xl text-white/70 font-medium mb-12 leading-relaxed italic border-l-4 border-brand-yellow pl-8">
                    "{selectedPhoto.description}"
                  </p>
                  
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setSelectedPhoto(null)}
                      className="px-12 py-5 bg-white text-brand-blue rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-brand-yellow transition-all shadow-2xl active:scale-95"
                    >
                      Retour aux archives
                    </button>
                    {selectedPhoto.category === 'Afrobarometer' && (
                      <a href="https://afrobarometer.org" target="_blank" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                        <Search className="w-4 h-4" />
                        Consulter la source AB
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
