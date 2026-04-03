'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  History, Target, Award, Users, 
  Sparkles, ArrowRight, Quote
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
    desc: "Création du cabinet par Désiré RAZAFINDRAZAKA, jetant les bases de l'excellence en conseil RH à Madagascar. Une vision pionnière qui a redéfini le recrutement local.",
    color: "text-brand-green"
  },
  {
    year: "2015",
    title: "Autorité Scientifique",
    desc: "Consolidation de notre rigueur avec le partenariat exclusif Afrobarometer. Devenant ainsi la seule voix de la donnée d'opinion fiable sur le territoire malgache.",
    color: "text-brand-yellow"
  },
  {
    year: "2024",
    title: "Transformation Digitale",
    desc: "Amorçage d'une transformation profonde axée sur l'agilité, l'innovation technologique et l'optimisation des processus de collecte de données à travers l'île.",
    color: "text-brand-blue"
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
    <div ref={containerRef} className="pt-48 min-h-screen bg-brand-sand/10 overflow-hidden relative selection:bg-brand-yellow selection:text-brand-blue">
      
      {/* 1. HERO PARALLAX */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-brand-blue">
        <motion.div style={{ y: heroImageY }} className="absolute inset-0 w-full h-[150%] -top-1/4">
          <Image 
            src="/images/portfolio/IMG-20241104-WA0001.jpg" 
            alt="Signature CoefRessources" 
            fill 
            className="object-cover opacity-60 brightness-75 transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/60 via-transparent to-brand-blue" />
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none z-0" />
        </motion.div>
        
        <div className="relative z-10 text-center max-w-5xl px-6">
          <motion.div initial="hidden" animate="show" variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="mb-8 flex items-center justify-center gap-6">
              <span className="h-px w-10 bg-brand-yellow" />
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-yellow">Depuis 2000</span>
              <span className="h-px w-10 bg-brand-yellow" />
            </motion.div>
            <motion.h1 variants={fadeInUp} className="font-heading text-5xl md:text-[90px] font-black text-white leading-[0.9] tracking-tighter mb-8 italic">
              L&apos;expertise collective <br /> au service de <span className="serif-heading italic font-normal text-brand-yellow">Madagascar.</span>
            </motion.h1>
          </motion.div>
        </div>
        
        {/* Prestige Ornament */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/20">
          <span className="text-[9px] font-black uppercase tracking-[0.5em] rotate-90 mb-6 origin-center">Scroll</span>
          <div className="h-16 w-px bg-gradient-to-b from-brand-yellow to-transparent" />
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="grid lg:grid-cols-12 gap-20 items-center"
        >
          {/* Header & General Intro */}
          <motion.div variants={fadeInUp} className="lg:col-span-12 mb-4">
             <div className="flex items-center gap-6 mb-8">
                <span className="text-brand-yellow font-black text-[11px] uppercase tracking-[0.5em]">Héritage &amp; Institution</span>
                <div className="h-px flex-1 bg-brand-blue/10" />
             </div>
          </motion.div>

          {/* Left: Collective Image */}
          <motion.div variants={fadeInUp} className="lg:col-span-5 relative">
             <div className="relative aspect-[3/4] overflow-hidden border-[12px] border-white shadow-2xl">
                <Image 
                  src="/images/portfolio/IMG_6226.JPG" 
                  alt="L'équipe CoefRessources sur le terrain" 
                  fill 
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-brand-blue/10" />
             </div>
             <div className="absolute -bottom-10 -left-10 bg-brand-blue p-10 shadow-3xl max-w-[280px]">
                <p className="text-brand-yellow font-heading text-4xl font-black mb-2 leading-none">150+</p>
                <p className="text-white text-[10px] font-black uppercase tracking-widest leading-relaxed">Agents mobilisables sur l&apos;ensemble du territoire malgache.</p>
             </div>
          </motion.div>

          {/* Right: The Institutions Story */}
          <motion.div variants={fadeInUp} className="lg:col-span-7">
            <h2 className="font-heading text-5xl md:text-7xl font-black text-brand-blue mb-10 leading-[0.9] tracking-tighter">
              Une institution <br /> au service du <span className="serif-heading italic font-normal text-brand-green">développement.</span>
            </h2>
            <div className="space-y-8 text-xl text-brand-blue/70 leading-relaxed font-medium italic">
              <p>
                Depuis plus de <strong className="text-brand-blue font-black">24 ans</strong>, CoefRessources s&apos;est imposé comme le pilier stratégique du conseil à Madagascar. Notre force ne repose pas sur une individualité, mais sur une intelligence collective unique.
              </p>
              <p>
                Notre cabinet réunit aujourd&apos;hui plus de <strong className="text-brand-blue font-black">40 experts pluridisciplinaires</strong> et une force de frappe de <strong className="text-brand-blue font-black">150 enquêteurs chevronnés</strong>. C&apos;est cette armée de compétences qui nous permet d&apos;intervenir avec la même précision dans les hautes sphères de la stratégie que sur les terrains les plus reculés de la Grande Île.
              </p>
              <p>
                La rigueur académique internationale couplée à une maîtrise chirurgicale des réalités locales constitue l&apos;ADN de notre signature. Un gage de confiance pour les plus grandes institutions mondiales.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-12">
               <div className="border-t-2 border-brand-yellow pt-6">
                  <p className="text-brand-blue font-heading text-4xl font-black mb-1">2000</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue/40">Année de Fondation</p>
               </div>
               <div className="border-t-2 border-brand-green pt-6">
                  <p className="text-brand-blue font-heading text-4xl font-black mb-1">22</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue/40">Zones d&apos;intervention</p>
               </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2b. COLLECTIVE EXPERTISE HUBS */}
      <section className="py-24 px-6 bg-brand-blue/5 border-y border-brand-blue/5">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-16"
          >
            {[
              { 
                title: "Excellence Académique", 
                desc: "Une équipe issue des meilleures formations internationales, garantissant une méthodologie infaillible.",
                icon: Award 
              },
              { 
                title: "Maîtrise du Terrain", 
                desc: "Une présence physique dans les 22 régions de Madagascar pour une collecte de données authentique.",
                icon: Target 
              },
              { 
                title: "Vision Multi-secteurs", 
                desc: "De l'industrie minière au secteur humanitaire, notre expertise traverse toutes les strates de l'économie.",
                icon: Sparkles 
              }
            ].map((item, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="relative group">
                <item.icon size={48} strokeWidth={1} className="text-brand-blue/20 group-hover:text-brand-yellow transition-colors duration-500 mb-8" />
                <h4 className="font-heading text-2xl font-black text-brand-blue mb-4 tracking-tighter uppercase">{item.title}</h4>
                <p className="text-brand-blue/60 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. ANIMATED TIMELINE - Colored Years */}
      <section className="bg-brand-blue py-28 px-6 relative mt-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-yellow/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 relative z-20">
            <div className="inline-flex items-center gap-4 mb-8">
               <span className="h-px w-8 bg-brand-yellow/30" />
               <p className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-yellow">Chronologie Statutaire</p>
               <span className="h-px w-8 bg-brand-yellow/30" />
             </div>
            <h2 className="font-heading text-5xl md:text-[70px] font-black text-white leading-[0.9] tracking-tighter">Notre Trajectoire.</h2>
          </div>

          <div className="max-w-4xl mx-auto relative" ref={timelineRef}>
            <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-px bg-white/10 rounded-full -translate-x-1/2" />
            <motion.div 
              style={{ height: lineHeight }} 
              className="absolute top-0 left-[27px] md:left-1/2 w-0.5 bg-brand-yellow rounded-full -translate-x-1/2 shadow-[0_0_20px_#DDD334]" 
            />
            
            {TIMELINE.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: EASING }}
                className={cn("relative z-10 flex flex-col md:flex-row items-center gap-10 mb-20 last:mb-0", 
                  idx % 2 === 0 ? "md:flex-row-reverse" : ""
                )}
              >
                <div className="absolute left-[27px] md:left-1/2 w-4 h-4 bg-brand-blue border-2 border-brand-yellow rounded-full -translate-x-1/2 shadow-[0_0_15px_#DDD334]" />
                
                <div className={cn("w-full md:w-1/2 pl-20 md:pl-0", idx % 2 === 0 ? "md:pl-16 text-left" : "md:pr-16 md:text-right")}>
                  <div className={cn("font-heading text-6xl font-black mb-4 leading-none", step.color)}>{step.year}</div>
                  <h3 className="font-heading text-2xl font-black text-white mb-4 tracking-tighter uppercase">{step.title}</h3>
                  <p className="text-white/50 text-lg leading-relaxed italic border-l-4 border-brand-yellow/30 pl-6">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CORE VALUES - Minimalist Grid */}
      <section className="py-24 px-6 bg-brand-sand/20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
            <div className="mb-16">
               <div className="inline-flex items-center gap-4 mb-6">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-yellow">Nos Fondations</p>
                 <div className="h-px w-20 bg-brand-yellow/30" />
               </div>
               <h2 className="font-heading text-5xl md:text-7xl font-black text-brand-blue tracking-tighter">L&apos;ADN de <br /> <span className="serif-heading italic font-normal text-brand-yellow">l&apos;Excellence.</span></h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-0 border border-brand-blue/10 overflow-hidden shadow-2xl">
              {[
                { icon: Sparkles, title: "Innovation", desc: "Adapter perpétuellement nos outils aux nouveaux défis structurels du marché et de la donnée mondiale." },
                { icon: Users, title: "Impact Social", desc: "Chaque projet mené doit agir comme un levier direct contribuant au bien commun de l'Océan Indien." },
                { icon: History, title: "Expérience", desc: "Capitaliser sur 24 ans de recul stratégique pour anticiper et désamorcer les enjeux complexes." }
              ].map((val, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeInUp}
                  className="p-12 bg-white border-r last:border-r-0 border-brand-blue/10 flex flex-col items-start hover:bg-brand-blue hover:text-white transition-all duration-700 group"
                >
                  <div className="h-14 w-14 bg-brand-blue/5 flex items-center justify-center text-brand-blue mb-8 group-hover:bg-brand-yellow group-hover:text-white transition-all duration-500">
                    <val.icon size={28} strokeWidth={1} />
                  </div>
                  <h3 className="font-heading text-2xl font-black mb-4 tracking-tighter group-hover:text-white">{val.title}</h3>
                  <p className="text-brand-blue/50 text-base leading-relaxed font-medium group-hover:text-white/60">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. OUR MISSION STATEMENT */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="text-brand-green font-black text-[11px] uppercase tracking-[0.6em]">Notre Mission</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="font-heading text-4xl md:text-6xl font-black text-brand-blue mb-8 tracking-tighter leading-tight">
              Élever le standard <br /> <span className="serif-heading italic font-normal text-brand-green">du conseil à Madagascar.</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-brand-blue/60 leading-relaxed max-w-3xl mx-auto font-medium">
              Notre mission est de fournir un accompagnement stratégique de classe mondiale aux organisations qui façonnent l&apos;avenir de Madagascar et de l&apos;Océan Indien. Nous croyons que l&apos;investissement dans le capital humain est le levier le plus puissant de transformation durable.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-10 flex justify-center gap-8 flex-wrap">
              {["Intégrité", "Excellence", "Innovation", "Impact"].map((val) => (
                <span key={val} className="px-6 py-3 bg-brand-blue/5 text-brand-blue font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-blue hover:text-white transition-all duration-500 cursor-default">
                  {val}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="pb-24 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASING }} className="max-w-7xl mx-auto rounded-none bg-brand-blue p-16 md:p-24 text-center relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-heading text-4xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-[0.9]">
              Rédigeons la prochaine <span className="serif-heading italic font-normal text-brand-yellow">page de votre histoire.</span>
            </h2>
            <Link href="/contact">
              <MagneticButton className="bg-brand-yellow text-brand-blue px-16 py-8 rounded-none font-bold text-[12px] tracking-widest uppercase hover:bg-white transition-all duration-500 shadow-2xl flex items-center gap-8 mx-auto">
                Lancer la discussion <ArrowRight size={20} />
              </MagneticButton>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
