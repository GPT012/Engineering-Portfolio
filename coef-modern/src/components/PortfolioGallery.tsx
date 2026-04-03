'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Maximize2, MapPin, Loader2 } from 'lucide-react';
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
  },
  {
    src: '/images/portfolio/AFR_4902.JPG',
    category: 'Afrobarometer',
    title: 'Présentation des clés de résultats',
    location: 'Antananarivo',
    description: 'Partage des données d\'opinion publique avec les décideurs et partenaires internationaux.',
  },
  {
    src: '/images/portfolio/IMG_6337.JPG',
    category: 'Social',
    title: 'Confiance & Échange',
    location: 'Zone rurale',
    description: 'Moment d\'interview privilégié garantissant l\'authenticité des réponses.',
  },
  {
    src: '/images/portfolio/IMG-20241104-WA0001.jpg',
    category: 'Social',
    title: 'Force Collective',
    location: 'Siège COEF',
    description: 'L\'équipe COEF Ressources unie pour l\'excellence opérationnelle.',
    span: 'col-span-2'
  },
  {
    src: '/images/portfolio/20230519_134123.jpg',
    category: 'Formation',
    title: 'Briefing méthodologique',
    location: 'Centre de formation',
    description: 'Préparation rigoureuse des enquêteurs avant le déploiement terrain.',
  },
  {
    src: '/images/portfolio/IMG_5938.JPG',
    category: 'Terrain',
    title: 'Interview de proximité',
    location: 'Sud de Madagascar',
    description: 'Collecte de données en tête-à-tête pour une précision maximale.',
  },
  {
    src: '/images/portfolio/IMG-20240212-WA0006.jpg',
    category: 'Terrain',
    title: 'Sur le sentier',
    location: 'Androy',
    description: 'Le relief malgache n\'est pas un obstacle à la donnée.',
  },
  {
    src: '/images/portfolio/WhatsApp Image 2024-10-15 à 19.11.10_7acc3e19.jpg',
    category: 'Afrobarometer',
    title: 'Gouvernance & Démocratie',
    location: 'Event International',
    description: 'Rayonnement de l\'expertise malgache sur la scène panafricaine.',
  },
  {
    src: '/images/portfolio/FB_IMG_1706701945769.jpg',
    category: 'Social',
    title: 'L\'Avenir de Madagascar',
    location: 'École primaire rurale',
    description: 'Nos études servent à éclairer les politiques sociales pour la jeunesse.',
  },
  {
    src: '/images/portfolio/PXL_20230521_120841109.PORTRAIT.jpg',
    category: 'Terrain',
    title: 'Détail Technique',
    location: 'Terrain',
    description: 'L\'utilisation de technologies mobiles sur le terrain assure la traçabilité.',
  },
  {
    src: '/images/portfolio/IMG-20241014-WA0027.jpg',
    category: 'Formation',
    title: 'Table Ronde Experts',
    location: 'Conférence',
    description: 'Validation par les pairs et échanges sur les meilleures pratiques RH.',
  },
  {
    src: '/images/portfolio/IMG-20240212-WA0001.jpg',
    category: 'Terrain',
    title: 'Marche d\'Équipe',
    location: 'Hauts Plateaux',
    description: 'Cohésion d\'équipe en mission longue durée.',
  },
  {
    src: '/images/portfolio/IMG-20241015-WA0008.jpg',
    category: 'Afrobarometer',
    title: 'Key Results Session',
    location: 'Hôtel Colbert',
    description: 'Publication annuelle des baromètres de l\'opinion.',
  }
];

const CATEGORIES: Category[] = ['Tous', 'Terrain', 'Formation', 'Afrobarometer', 'Social'];

export default function PortfolioGallery() {
  const [filter, setFilter] = useState<Category>('Tous');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          const remotePhotos: Photo[] = data.map((item: any) => ({
            src: item.image_url,
            category: item.category as Category,
            title: item.title,
            location: item.location,
            description: item.description,
            span: item.span as any,
          }));
          // Mix with initial ones but put new ones first
          setPhotos([...remotePhotos, ...INITIAL_PHOTOS]);
        }
      } catch (err) {
        console.error('Portfolio fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, []);

  const filteredPhotos = filter === 'Tous' 
    ? photos 
    : photos.filter(p => p.category === filter);

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* FILTERS */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-8 py-3 rounded-full text-[10px] uppercase font-black tracking-[0.2em] transition-all duration-300",
                filter === cat
                  ? "bg-brand-blue text-white shadow-xl scale-105"
                  : "bg-brand-blue/5 text-brand-blue hover:bg-brand-blue/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo, idx) => (
              <motion.div
                key={photo.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={cn(
                  "group relative overflow-hidden rounded-3xl cursor-pointer bg-brand-blue/5",
                  photo.span || ""
                )}
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/90 via-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-brand-yellow text-brand-blue text-[8px] font-black uppercase rounded-full">
                      {photo.category}
                    </span>
                    {photo.location && (
                      <span className="flex items-center gap-1 text-white/70 text-[9px]">
                        <MapPin size={10} />
                        {photo.location}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-heading font-black text-xl leading-tight mb-2">
                    {photo.title}
                  </h3>
                  <div className="flex items-center justify-between text-white/60 text-[10px] uppercase tracking-widest font-bold">
                    <span>En savoir plus</span>
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Maximize2 size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

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
              <div 
                className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative aspect-[4/3] md:aspect-auto md:h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={selectedPhoto.src}
                    alt={selectedPhoto.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-white">
                   <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-2 bg-brand-green text-white text-[10px] font-black uppercase rounded-full">
                      {selectedPhoto.category}
                    </span>
                    {selectedPhoto.location && (
                      <span className="flex items-center gap-2 text-white/60 text-xs font-bold">
                        <MapPin size={14} className="text-brand-yellow" />
                        {selectedPhoto.location}
                      </span>
                    )}
                  </div>
                  <h2 className="text-4xl md:text-6xl font-heading font-black mb-6 leading-tight">
                    {selectedPhoto.title}
                  </h2>
                  <p className="text-lg md:text-xl text-white/70 font-medium mb-8 leading-relaxed italic">
                    "{selectedPhoto.description}"
                  </p>
                  <button 
                    onClick={() => setSelectedPhoto(null)}
                    className="px-10 py-4 bg-white text-brand-blue rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-brand-yellow transition-colors"
                  >
                    Fermer la vue
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
