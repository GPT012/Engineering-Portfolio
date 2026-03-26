'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  History, Target, Award, Users, 
  Sparkles, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const EASING: [number, number, number, number] = [0.85, 0, 0.15, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASING } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const TIMELINE = [
  {
    year: "2000",
    title: "Fondation Historique",
    desc: "Création du cabinet par Désiré RAZAFINDRAZAKA, jetant les bases de l'excellence en conseil RH à Madagascar. Une vision pionnière qui a redéfini le recrutement local."
  },
  {
    year: "2015",
    title: "Autorité Scientifique",
    desc: "Consolidation de notre rigueur avec le partenariat exclusif Afrobarometer. Devenant ainsi la seule voix de la donnée d'opinion fiable sur le territoire malgache."
  },
  {
    year: "2024",
    title: "Nouvelle Ère Digitale",
    desc: "Léa RAKOTO prend la direction du cabinet. Lancement d'une transformation profonde axée sur l'agilité, l'innovation technologique et l'internationalisation."
  }
];

function MagneticButton({ children, className, ...props }: any) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });
  const { x, y } = position;

  return (
    <motion.button ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} animate={{ x, y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }} className={className} {...props}>
      {children}
    </motion.button>
  );
}

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const heroImageY = useTransform(scrollYProgress, [0, 0.3], ["0%", "40%"]);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });
  const lineHeight = useTransform(timelineProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="pt-24 min-h-screen bg-brand-sand/10 overflow-hidden relative selection:bg-brand-gold selection:text-brand-forest">
      
      {/* 1. HERO PARALLAX - Statutory & Deep */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-brand-forest">
        <motion.div style={{ y: heroImageY }} className="absolute inset-0 w-full h-[150%] -top-1/4">
          <Image 
            src="/images/about-office.png" 
            alt="Signature CoefRessources" 
            fill 
            className="object-cover grayscale opacity-40 brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-forest/60 via-transparent to-brand-forest" />
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none z-0" />
        </motion.div>
        
        <div className="relative z-10 text-center max-w-5xl px-6">
          <motion.div initial="hidden" animate="show" variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="mb-12 flex items-center justify-center gap-6">
              <span className="h-px w-10 bg-brand-gold" />
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-gold">Depuis 2000</span>
              <span className="h-px w-10 bg-brand-gold" />
            </motion.div>
            <motion.h1 variants={fadeInUp} className="font-heading text-6xl md:text-[110px] font-black text-white leading-[0.9] tracking-tighter mb-10">
              L'excellence forge <br /> <span className="serif-heading italic font-normal text-brand-gold">notre signature.</span>
            </motion.h1>
          </motion.div>
        </div>
        
        {/* Prestige Ornament */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/20">
          <span className="text-[9px] font-black uppercase tracking-[0.5em] rotate-90 mb-8 origin-center">Scroll</span>
          <div className="h-20 w-px bg-gradient-to-b from-brand-gold to-transparent" />
        </div>
      </section>

      {/* 2. OUR STORY (Editorial Layout) */}
      <section className="py-40 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="grid lg:grid-cols-12 gap-20 items-stretch"
        >
          {/* Main Story Block */}
          <motion.div variants={fadeInUp} className="lg:col-span-12 mb-20">
             <div className="flex items-center gap-6 mb-12">
                <span className="text-brand-gold font-black text-[11px] uppercase tracking-[0.5em]">Héritage & Vision</span>
                <div className="h-px flex-1 bg-brand-forest/10" />
             </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="font-heading text-5xl md:text-7xl font-black text-brand-forest mb-12 leading-[0.95] tracking-tighter">
              24 ans de bâtisseurs <br /> de capital humain.
            </h2>
            <div className="space-y-8 text-xl text-brand-forest/70 leading-relaxed font-medium">
              <p>
                Fondé en 2000 par **Désiré RAZAFINDRAZAKA**, le cabinet COEF Ressources s'est érigé comme le pilier stratégique des organisations malgaches. 
                Sous la direction de **Léa RAKOTO**, PDG, nous perpétuons cet héritage d&apos;excellence avec une vision résolument tournée vers l&apos;avenir.
              </p>
              <p>
                Notre force réside dans cette alliance rare : une rigueur académique internationale couplée à une maîtrise chirurgicale des réalités du terrain malgache. 
                Une signature qui convainc les plus grandes institutions mondiales.
              </p>
            </div>
            
            <div className="mt-16 flex items-center gap-12">
              <div className="flex flex-col">
                <span className="text-5xl font-heading font-black text-brand-forest">2000</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mt-2">Fondation</span>
              </div>
              <div className="h-12 w-px bg-brand-forest/10" />
              <div className="flex flex-col">
                <span className="text-5xl font-heading font-black text-brand-forest">150+</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mt-2">Partenaires</span>
              </div>
            </div>
          </motion.div>

          {/* Prestige Image Block */}
          <motion.div variants={fadeInUp} className="lg:col-span-5 relative">
             <div className="relative aspect-[3/4] overflow-hidden border-8 border-white shadow-2xl">
                <Image 
                  src="/images/hero.png" 
                  alt="Direction CoefRessources" 
                  fill 
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
             </div>
             <div className="absolute -bottom-10 -right-10 bg-brand-forest p-12 shadow-3xl">
                <div className="h-1 w-12 bg-brand-gold mb-6" />
                <p className="text-white font-heading text-2xl mb-2 italic">"L'excellence n'est pas un but, c'est une exigence quotidienne."</p>
                <p className="text-brand-gold text-[10px] font-black uppercase tracking-widest mt-6">Léa RAKOTO • PDG</p>
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. ANIMATED TIMELINE - Noir Style */}
      <section className="bg-brand-forest py-60 px-6 relative mt-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-40 relative z-20">
            <div className="inline-flex items-center gap-4 mb-10">
               <span className="h-px w-8 bg-brand-gold/30" />
               <p className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-gold">Chronologie Statutaire</p>
               <span className="h-px w-8 bg-brand-gold/30" />
             </div>
            <h2 className="font-heading text-6xl md:text-[90px] font-black text-white leading-[0.9] tracking-tighter">Notre Trajectoire.</h2>
          </div>

          <div className="max-w-4xl mx-auto relative" ref={timelineRef}>
            <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-px bg-white/10 rounded-full -translate-x-1/2" />
            <motion.div 
              style={{ height: lineHeight }} 
              className="absolute top-0 left-[27px] md:left-1/2 w-0.5 bg-brand-gold rounded-full -translate-x-1/2 shadow-[0_0_20px_#B5935E]" 
            />
            
            {TIMELINE.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: EASING }}
                className={cn("relative z-10 flex flex-col md:flex-row items-center gap-16 mb-40 last:mb-0", 
                  idx % 2 === 0 ? "md:flex-row-reverse" : ""
                )}
              >
                <div className="absolute left-[27px] md:left-1/2 w-4 h-4 bg-brand-forest border-2 border-brand-gold rounded-full -translate-x-1/2 shadow-[0_0_15px_#B5935E]" />
                
                <div className={cn("w-full md:w-1/2 pl-20 md:pl-0", idx % 2 === 0 ? "md:pl-20 text-left" : "md:pr-20 md:text-right")}>
                  <div className="text-brand-gold font-heading text-7xl font-black mb-8 leading-none opacity-40">{step.year}</div>
                  <h3 className="font-heading text-3xl font-black text-white mb-8 tracking-tighter uppercase">{step.title}</h3>
                  <p className="text-white/50 text-xl leading-relaxed italic border-l-4 border-brand-gold/30 pl-8">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CORE VALUES - Minimalist Grid */}
      <section className="py-60 px-6 bg-brand-sand/20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
            <div className="mb-32">
               <div className="inline-flex items-center gap-4 mb-8">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">Nos Fondations</p>
                 <div className="h-px w-20 bg-brand-gold/30" />
               </div>
               <h2 className="font-heading text-6xl md:text-8xl font-black text-brand-forest tracking-tighter">L&apos;ADN de <br /> <span className="serif-heading italic font-normal text-brand-gold">l'Excellence.</span></h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-0 border border-brand-forest/10 overflow-hidden shadow-2xl">
              {[
                { icon: Sparkles, title: "Innovation", desc: "Adapter perpétuellement nos outils aux nouveaux défis structurels du marché et de la donnée mondiale." },
                { icon: Users, title: "Impact Social", desc: "Chaque projet mené doit agir comme un levier direct contribuant au bien commun de l'Océan Indien." },
                { icon: History, title: "Expérience", desc: "Capitaliser sur 24 ans de recul stratégique pour anticiper et désamorcer les enjeux complexes." }
              ].map((val, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeInUp}
                  className="p-16 bg-white border-r last:border-r-0 border-brand-forest/10 flex flex-col items-start hover:bg-brand-forest hover:text-white transition-all duration-700 group"
                >
                  <div className="h-16 w-16 bg-brand-forest/5 flex items-center justify-center text-brand-forest mb-12 group-hover:bg-brand-gold group-hover:text-white transition-all duration-500">
                    <val.icon size={32} strokeWidth={1} />
                  </div>
                  <h3 className="font-heading text-3xl font-black mb-8 tracking-tighter group-hover:text-white">{val.title}</h3>
                  <p className="text-brand-forest/50 text-lg leading-relaxed font-medium group-hover:text-white/60">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. FINAL CTA - Editorial Style */}
      <section className="pb-60 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASING }} className="max-w-7xl mx-auto rounded-none bg-brand-forest p-20 md:p-40 text-center relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-heading text-5xl md:text-8xl font-black text-white mb-16 tracking-tighter leading-[0.9]">
              Rédigeons la prochaine <span className="serif-heading italic font-normal text-brand-gold">page de votre histoire.</span>
            </h2>
            <Link href="/contact">
              <MagneticButton className="bg-brand-gold text-brand-forest px-16 py-8 rounded-none font-bold text-[12px] tracking-widest uppercase hover:bg-white transition-all duration-500 shadow-2xl flex items-center gap-8 mx-auto">
                Lancer la discussion <ArrowRight size={20} />
              </MagneticButton>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
