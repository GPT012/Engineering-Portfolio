'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { 
  Users, Briefcase, ClipboardCheck, BarChart3, ArrowRight,
  Droplets, GraduationCap, Leaf, Users2, Plane, 
  ShieldCheck, CheckCircle2, Globe2, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- PREMIUM ANIMATION SETTINGS ---
const EASING: [number, number, number, number] = [0.85, 0, 0.15, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASING } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

// --- DATA ---
const EXPERTISES = [
  {
    title: "Ressources Humaines",
    desc: "Optimisation du capital humain, recrutement stratégique et gestion des talents.",
    icon: Users,
    image: "/images/portfolio/IMG-20241014-WA0027.jpg",
    span: "col-span-1 md:col-span-2 row-span-2"
  },
  {
    title: "Organisation",
    desc: "Transformation organisationnelle, audit structurel et accompagnement.",
    icon: Briefcase,
    image: "/images/portfolio/IMG-20241015-WA0008.jpg",
    span: "col-span-1 md:col-span-1 row-span-1"
  },
  {
    title: "Gestion de Projets",
    desc: "Pilotage d'études d'impact et suivi-évaluation.",
    icon: ClipboardCheck,
    image: "/images/portfolio/IMG_6337.JPG",
    span: "col-span-1 md:col-span-1 row-span-1"
  },
  {
    title: "Sondages d'Opinion",
    desc: "Etudes quantitatives et qualitatives ciblées.",
    icon: BarChart3,
    image: "/images/portfolio/AFR_4902.JPG",
    span: "col-span-1 md:col-span-2 row-span-1"
  }
];

const SECTEURS = [
  { name: "Eau & Hygiène", icon: Droplets },
  { name: "Éducation", icon: GraduationCap },
  { name: "Environnement", icon: Leaf },
  { name: "Genre", icon: Users2 },
  { name: "Migration", icon: Plane },
  { name: "Droits de l'enfant", icon: ShieldCheck }
];

const STATS = [
  { label: "Années d'expérience", value: 24, suffix: "+" },
  { label: "Projets réalisés", value: 150, suffix: "+" },
  { label: "Experts mobilisés", value: 40, suffix: "+" },
  { label: "Partenaires", value: 15, suffix: "+" }
];

// --- COMPONENTS ---

// Animated Number Component
function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const spring = useSpring(0, { bounce: 0, duration: 2500 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [isInView, spring, value]);

  useEffect(() => {
    return spring.on("change", (latest) => setDisplay(Math.round(latest)));
  }, [spring]);

  return <span ref={ref}>{display}</span>;
}

// Magnetic Button Wrapper
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

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Section Header
const SectionHeader = ({ title, subtitle, light = false }: { title: string, subtitle?: string, light?: boolean }) => (
  <motion.div variants={fadeInUp} className="mb-12">
    <h2 className={cn("font-heading text-4xl font-bold md:text-5xl", light ? "text-white" : "text-brand-blue")}>
      {title}
    </h2>
    {subtitle && (
      <p className={cn("mt-4 text-lg", light ? "text-white/60" : "text-brand-blue/60")}>
        {subtitle}
      </p>
    )}
    <div className="mt-6 h-1 w-20 bg-brand-green rounded-full" />
  </motion.div>
);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroImageScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  return (
    <div ref={containerRef} className="relative min-h-screen selection:bg-brand-green selection:text-brand-blue">
      
      {/* 1. HERO SECTION - Deep Forest Inversion */}
      <section className="relative flex min-h-[95vh] items-center pt-52 pb-24 overflow-hidden bg-brand-blue">
        {/* Subtle Background Pattern - Prestige Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="prestige-grid-dark" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#F8F5F1" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#prestige-grid-dark)" />
          </svg>
        </div>
        
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-15deg] translate-x-1/3" />
        
        <div className="mx-auto grid max-w-7xl px-6 grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 w-full">
          <motion.div 
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="lg:col-span-7"
          >
            <motion.div variants={fadeInUp} className="mb-10 flex items-center gap-6">
              <span className="h-px w-16 bg-brand-gold animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-gold">
                Heritage • Performance • Human
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp} 
              className="font-heading text-6xl md:text-[90px] font-black leading-[0.95] text-white tracking-tighter mb-12"
            >
              Le Conseil <br />
              <span className="italic font-normal serif-heading text-brand-gold">Haute-Couture</span> <br />
              en Capital Humain.
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="max-w-xl text-xl text-white/70 leading-relaxed font-medium mb-16"
            >
              Expertises multidisciplinaires au service de la gouvernance et de la stratégie RH à Madagascar. 
              Une signature d&apos;excellence forgée depuis plus de <span className="text-white font-black underline decoration-brand-gold/30 decoration-4 underline-offset-4">24 ans</span>.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-8">
              <Link href="/expertises" className="group">
                <MagneticButton className="bg-brand-gold text-brand-forest px-12 py-6 rounded-none font-bold text-xs tracking-widest uppercase hover:bg-white transition-colors duration-500 shadow-2xl flex items-center gap-4">
                  Explorer nos solutions
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </MagneticButton>
              </Link>
              <Link href="/a-propos" className="inline-flex items-center gap-4 text-white font-black text-xs tracking-widest uppercase py-6 px-4 hover:text-brand-gold transition-colors group">
                Notre Identité
                <ChevronRight size={20} className="text-brand-gold group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* PARALLAX HERO IMAGE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.5, ease: EASING }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden shadow-[40px_40px_100px_rgba(0,0,0,0.3)] group rounded-sm border-white/10 border-8">
              <motion.div 
                style={{ y: heroImageY, scale: heroImageScale }}
                className="absolute inset-0 h-[120%] -top-[10%]"
              >
                <Image 
                  src="/images/portfolio/IMG_6226.JPG" 
                  alt="Cabinet CoefRessources" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-all duration-[2000ms] brightness-90 group-hover:brightness-100"
                  priority
                />
              </motion.div>
              <div className="absolute inset-0 bg-brand-blue/20 opacity-60 group-hover:opacity-0 transition-opacity duration-1000" />
            </div>
            
            {/* Floating Achievement Badge - Minimalist Inverted */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
              className="absolute -bottom-10 -left-10 bg-brand-blue p-10 shadow-2xl border-l-[6px] border-brand-yellow"
            >
              <div className="relative z-10">
                <p className="text-4xl font-heading font-black text-white mb-2 tracking-tight">Afrobarometer</p>
                <div className="h-px w-20 bg-brand-gold/30 mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Partenariat • Madagascar</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS BAR (Sand Version for Contrast) */}
      <section className="relative z-20 bg-brand-sand py-12 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {STATS.map((stat, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                className="group relative text-center md:text-left"
              >
                <p className="font-heading text-5xl font-black text-brand-blue md:text-6xl">
                  <AnimatedNumber value={stat.value} />{stat.suffix}
                </p>
                <div className="h-px w-12 bg-brand-blue/10 mt-3 mb-3 mx-auto md:mx-0 group-hover:bg-brand-yellow transition-colors" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue/40 group-hover:text-brand-blue transition-colors">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. TRUST BAR (Sand & Dark) */}
      <section className="bg-white py-12 border-b border-brand-sand overflow-hidden">
        <div className="relative flex select-none overflow-hidden items-center group">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="flex min-w-max shrink-0 items-center justify-around gap-16 px-8"
          >
            {[...Array(2)].fill([
              "Banque Mondiale", "AFD", "UNICEF", "PNUD", "Union Européenne", "AfroBarometer", 
              "Orange", "Star", "Vivo Energy", "Telma"
            ]).flat().map((partner, i) => (
              <div key={i} className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-all duration-300">
                <div className="h-10 flex items-center text-2xl font-heading font-black tracking-tighter text-brand-blue">
                  {partner}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. EXPERTISES GRID (Bento-Grid - Light & Sharp) */}
      <section id="expertises" className="py-20 px-6 bg-brand-sand/30 relative">
        <div className="mx-auto max-w-7xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <SectionHeader 
              title="Notre Expertise 360°" 
              subtitle="Des solutions intégrées pour répondre aux enjeux complexes des organisations malgaches." 
            />
            
            <div className="grid gap-6 md:grid-cols-3 auto-rows-[220px] md:auto-rows-[300px]">
              {EXPERTISES.map((exp, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className={cn(
                    "group relative flex flex-col rounded-sm bg-white p-8 border border-brand-blue/5 overflow-hidden hover:shadow-2xl hover:border-brand-yellow/30 transition-all duration-700",
                    exp.span
                  )}
                >
                  {/* BACKGROUND AUTHENTIC PHOTO */}
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image 
                      src={exp.image}
                      alt={exp.title}
                      fill
                      className="object-cover opacity-[0.12] grayscale transition-all duration-[3s] group-hover:opacity-[0.25] group-hover:scale-105 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/50 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-auto">
                      <div className={cn("text-brand-blue transition-transform group-hover:scale-110 duration-700 ease-[cubic-bezier(0.85,0,0.15,1)]")}>
                        <exp.icon size={28} strokeWidth={1.5} />
                      </div>
                      <div className="h-8 w-8 flex items-center justify-center rounded-full border border-brand-blue/10 text-brand-blue/20 group-hover:border-brand-yellow group-hover:text-brand-yellow transition-all duration-300">
                        <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>

                    <div className="mt-8">
                      <p className="text-[9px] font-black tracking-[.4em] text-brand-yellow uppercase mb-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                        Expertise • 24y
                      </p>
                      <h3 className="mb-3 font-heading text-2xl font-black text-brand-blue leading-tight">
                        {exp.title}
                      </h3>
                      <p className="text-[14px] leading-relaxed text-brand-blue/50 max-w-md group-hover:text-brand-blue/80 transition-colors">
                        {exp.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTEURS D'INTERVENTION (Refined Inversion) */}
      <section className="py-24 px-6 bg-white border-t border-brand-sand overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <SectionHeader 
            title="Secteurs d'Intervention" 
            subtitle="Une expertise multisectorielle éprouvée sur l'ensemble du territoire." 
          />
          
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 mt-16">
            {SECTEURS.map((secteur, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-40 flex flex-col items-center justify-center border border-brand-blue/5 rounded-sm p-6 overflow-hidden bg-brand-sand/10 hover:bg-white hover:shadow-xl transition-all duration-700"
              >
                {/* LOW OPACITY BACKGROUND PHOTO */}
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={[
                      "/images/portfolio/20230520_100240.jpg",
                      "/images/portfolio/IMG_5938.JPG",
                      "/images/portfolio/IMG_6226.JPG",
                      "/images/portfolio/IMG_5840.JPG",
                      "/images/portfolio/20230519_134123.jpg",
                      "/images/portfolio/PXL_20230521_120841109.PORTRAIT.jpg"
                    ][i]} 
                    alt={secteur.name}
                    fill
                    className="object-cover opacity-[0.04] grayscale group-hover:opacity-[0.2] transition-opacity duration-1000"
                  />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <secteur.icon size={32} className="text-brand-blue mb-4 group-hover:scale-110 group-hover:text-brand-green transition-all" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue/60 group-hover:text-brand-blue">{secteur.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SOCIAL PROOF (Deep Forest Contrast) */}
      <section className="py-20 bg-brand-blue relative overflow-hidden border-t border-white/5">
        {/* BACKGROUND FIELD PHOTO */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/portfolio/20230519_134123.jpg"
            alt="Field mission group"
            fill
            className="object-cover opacity-[0.08] grayscale mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-transparent to-brand-blue" />
        </div>

        <div className="mx-auto max-w-7xl px-6 relative z-10 mb-12">
          <SectionHeader 
            title="Preuve par l'Impact." 
            subtitle="Ils ont choisi la rigueur et l'excellence locale."
            light 
          />
        </div>

        <div className="relative w-full overflow-hidden flex pb-12">
          <motion.div 
            drag="x"
            dragConstraints={{ right: 600, left: -1500 }}
            whileTap={{ cursor: "grabbing" }}
            className="flex gap-8 px-6 cursor-grab active:cursor-grabbing"
          >
            {[
              {
                source: "Banque Mondiale",
                text: "L'expertise locale de CoefRessources a été déterminante dans le succès de notre programme. Une rigueur méthodologique exemplaire.",
                author: "Directeur de Programme",
              },
              {
                source: "AFD Madagascar",
                text: "Un partenaire fiable, capable de fournir des analyses sociologiques profondes pour nos projets de développement.",
                author: "Responsable de Pôle",
              },
              {
                source: "AfroBarometer",
                text: "Une collaboration sans faille. La qualité de la donnée collectée sur le terrain est le pilier de nos rapports.",
                author: "Coordinateur National",
              },
              {
                source: "UNICEF",
                text: "Une capacité exceptionnelle à s'adapter aux terrains les plus complexes tout en maintenant un standard d'excellence.",
                author: "Chef de Projet",
              }
            ].map((t, idx) => (
              <motion.div 
                key={idx}
                className="w-[300px] md:w-[400px] shrink-0 bg-white/5 p-8 rounded-sm border border-white/10 hover:border-brand-gold/30 transition-all duration-700 flex flex-col justify-between"
              >
                <div>
                  <div className="h-px w-10 bg-brand-gold mb-8" />
                  <p className="text-white/80 text-xl font-medium serif-heading leading-relaxed italic mb-8">"{t.text}"</p>
                </div>
                <div className="pt-6 border-t border-white/5">
                  <p className="text-brand-gold font-black text-[10px] uppercase tracking-[0.3em] mb-1">{t.source}</p>
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">{t.author}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. CTA FINAL */}
      <section className="py-16 px-6 bg-brand-sand">
        <div className="mx-auto max-w-5xl rounded-[40px] bg-brand-blue p-10 md:p-16 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/portfolio/IMG-20241015-WA0008.jpg"
              alt="COEF Team"
              fill
              className="object-cover opacity-20 grayscale transition-transform duration-[10s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-green/90 via-brand-green/40 to-transparent" />
          </div>
          
          <div className="relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-4xl font-black text-brand-blue md:text-6xl mb-6 leading-tight"
            >
              Prêt à transformer <br /> votre organisation ?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mx-auto mb-10 max-w-lg text-lg font-medium text-brand-blue/80"
            >
              Parlons de vos défis et construisons ensemble des solutions durables.
            </motion.p>
            <Link href="/contact">
              <MagneticButton className="rounded-full bg-brand-blue px-14 py-6 font-black text-white shadow-xl transition-all hover:bg-white hover:text-brand-blue text-lg">
                Démarrer un projet
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
