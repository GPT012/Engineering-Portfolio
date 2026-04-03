'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Users, Briefcase, ClipboardCheck, BarChart3, 
  ArrowRight, Plus, Minus,
  Droplets, GraduationCap, Leaf, Users2, Plane, ShieldCheck,
  Search, Lightbulb, Zap, Rocket
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const EASING: [number, number, number, number] = [0.85, 0, 0.15, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASING } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const SERVICES = [
  {
    id: "rh",
    title: "Ressources Humaines",
    desc: "Optimisation de la performance par le capital humain et gestion stratégique des talents.",
    icon: Users,
    color: "bg-brand-blue/5 text-brand-blue",
    accent: "bg-brand-yellow",
    stat: { label: "Taux de rétention", value: "98%" },
    features: ["Audit & Ingénierie RH", "Recrutement de dirigeants", "Développement des compétences", "Accompagnement de carrière"],
    caseStudy: "Recrutement du Top Management pour une institution financière de premier plan."
  },
  {
    id: "organisation",
    title: "Organisation & Conseil",
    desc: "Transformation structurelle et excellence opérationnelle pour les institutions.",
    icon: Briefcase,
    color: "bg-brand-blue/5 text-brand-blue",
    accent: "bg-brand-yellow",
    stat: { label: "Missions d'audit", value: "150+" },
    features: ["Schémas directeurs", "Manuel de procédures", "Gouvernance & Stratégie", "Conduite du changement"],
    caseStudy: "Redéfinition du manuel de procédures pour un organisme international (WASH)."
  },
  {
    id: "projets",
    title: "Études & Impact",
    desc: "Analyses de précision et évaluation rigoureuse de vos impacts sociaux.",
    icon: ClipboardCheck,
    color: "bg-brand-blue/5 text-brand-blue",
    accent: "bg-brand-yellow",
    stat: { label: "Experts mobilisés", value: "120+" },
    features: ["Études socio-économiques", "Suivi & Évaluation (MSE)", "Études d'impact environnemental", "Capitalisation d'expériences"],
    caseStudy: "Étude d'impact socio-économique d'un grand projet d'infrastructure à Madagascar."
  },
  {
    id: "sondages",
    title: "Données & Opinion",
    desc: "La voix de la donnée pour éclairer les décisions stratégiques à Madagascar.",
    icon: BarChart3,
    color: "bg-brand-blue/5 text-brand-blue",
    accent: "bg-brand-yellow",
    stat: { label: "Fiabilité statistique", value: "95%" },
    features: ["Baromètres d'opinion", "Collecte API (Afrobarometer)", "Analyses de satisfaction", "Veille stratégique"],
    caseStudy: "Coordination nationale de l'enquête Afrobarometer Round 10 à Madagascar."
  }
];

const SECTEURS = [
  { name: "Eau & Hygiène", icon: Droplets, desc: "Accès à l'eau, assainissement et hygiène communautaire." },
  { name: "Éducation", icon: GraduationCap, desc: "Alphabétisation, formation technique et insertion." },
  { name: "Environnement", icon: Leaf, desc: "Conservation, gestion durable et biodiversité." },
  { name: "Genre", icon: Users2, desc: "Inclusion, lutte contre les violences et autonomisation." },
  { name: "Migration", icon: Plane, desc: "Mobilité humaine, diaspora et développement rural." },
  { name: "Droits de l'enfant", icon: ShieldCheck, desc: "Protection, nutrition et accompagnement social." }
];

const METHODE = [
  {
    step: "01",
    title: "Diagnostic Phare",
    desc: "Immersion totale dans votre écosystème pour identifier les leviers de performance réels.",
    icon: Search
  },
  {
    step: "02",
    title: "Solution Stratégique",
    desc: "Conception d'une architecture sur-mesure combinant expertise locale et standards internationaux.",
    icon: Lightbulb
  },
  {
    step: "03",
    title: "Impulsion Terrain",
    desc: "Déploiement opérationnel agile avec nos 150 enquêteurs et experts mobilisables.",
    icon: Zap
  },
  {
    step: "04",
    title: "Impact Durable",
    desc: "Mesure de la performance et transfert de compétences pour une autonomie totale.",
    icon: Rocket
  }
];

const FAQS = [
  {
    q: "Pourquoi externaliser mon recrutement à COEF Ressources ?",
    a: "Grâce à notre vivier exclusif et à nos 24 ans de présence locale, nous réduisons vos coûts tout en garantissant des profils rares parfaitement alignés avec votre culture d'entreprise."
  },
  {
    q: "Comment se déroule un premier échange ?",
    a: "Nous commençons par un diagnostic flash de 30 minutes. Cela nous permet de cerner vos douleurs organisationnelles avant de vous soumettre une proposition sur-mesure sous 24h."
  },
  {
    q: "Accompagnez-vous aussi les petites structures ?",
    a: "Absolument. Nos solutions sont modulables : de l'audit express pour une PME en croissance, à la transformation pluriannuelle pour des institutions internationales."
  },
  {
    q: "Comment garantissez-vous la confidentialité absolue ?",
    a: "La discrétion est l'essence de notre métier. Tous nos consultants sont sous accord de confidentialité strict (NDA), un protocole inviolable appliqué depuis l'an 2000."
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

function AccordionItem({ faq, isOpen, onClick }: { faq: any, isOpen: boolean, onClick: () => void }) {
  return (
    <div className={cn("border-b border-brand-blue/10 transition-colors duration-700", isOpen ? "bg-white/40" : "hover:bg-white/20")}>
      <button onClick={onClick} className="w-full flex items-center justify-between py-10 px-8 text-left focus:outline-none group">
        <h4 className={cn("text-xl md:text-2xl font-black font-heading transition-colors duration-500", isOpen ? "text-brand-blue" : "text-brand-blue/40 group-hover:text-brand-blue")}>
          {faq.q}
        </h4>
        <div className={cn("shrink-0 h-8 w-8 rounded-full border border-brand-blue/10 flex items-center justify-center transition-all duration-500", isOpen ? "bg-brand-yellow border-brand-yellow text-white rotate-180 shadow-lg" : "bg-transparent text-brand-blue group-hover:border-brand-blue")}>
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASING }}>
            <div className="px-10 pb-12 text-brand-blue/70 font-medium leading-relaxed max-w-3xl">
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Services() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="pt-52 pb-24 min-h-screen bg-brand-sand/30">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HERO - Statutory & Minimalist */}
        <motion.div initial="hidden" animate="show" variants={staggerContainer} className="mb-24 mt-8 text-center max-w-5xl mx-auto">
          <motion.div variants={fadeInUp} className="mb-12 flex items-center justify-center gap-6">
            <span className="h-px w-12 bg-brand-yellow" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-yellow">Solutions Statutaires</span>
            <span className="h-px w-12 bg-brand-yellow" />
          </motion.div>
          <motion.h1 variants={fadeInUp} className="font-heading text-6xl md:text-[100px] font-black text-brand-blue leading-[0.9] mb-12 tracking-tighter">
            Architectes du <br /> <span className="serif-heading italic font-normal text-brand-yellow">Capital Humain.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-brand-blue/60 leading-relaxed font-medium mx-auto max-w-2xl px-4">
            Depuis 24 ans, nous transformons les organisations par l&apos;excellence méthodologique. Un accompagnement sur-mesure pour les acteurs leaders à Madagascar.
          </motion.p>
        </motion.div>

        {/* STICKY SERVICES - Prestige Style */}
        <div className="relative space-y-8 pb-16">
          {SERVICES.map((service, idx) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: EASING }}
              className="sticky top-32 bg-white rounded-none border-l-[10px] border-brand-yellow p-10 md:p-20 shadow-[40px_40px_100px_rgba(10,46,42,0.05)] border-y border-r border-brand-blue/5 flex flex-col lg:flex-row gap-20 items-center overflow-hidden group"
              style={{ zIndex: idx }}
            >
              {/* AUTHENTIC BG IMAGE */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <Image 
                  src={[
                    "/images/portfolio/IMG-20241014-WA0027.jpg",
                    "/images/portfolio/20230520_100240.jpg",
                    "/images/portfolio/IMG_5938.JPG",
                    "/images/portfolio/AFR_4902.JPG"
                  ][idx]}
                  alt="Background"
                  fill
                  className="object-cover opacity-[0.03] grayscale transition-all duration-[3s] group-hover:opacity-[0.07] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent" />
              </div>

              <div className="relative shrink-0 flex flex-col items-center z-10">
                <div className={cn("h-48 w-48 rounded-sm bg-brand-blue flex items-center justify-center text-brand-yellow shadow-2xl")}>
                  <service.icon size={80} strokeWidth={1} />
                </div>
                <div className="mt-10 border-t border-brand-blue/10 pt-6 w-full text-center">
                  <p className="text-[9px] font-black uppercase text-brand-yellow tracking-[0.4em] mb-2">{service.stat.label}</p>
                  <p className="text-4xl font-heading font-black text-brand-blue">{service.stat.value}</p>
                </div>
              </div>
              
              <div className="flex-1 relative z-10">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-yellow mb-6">Pôle d&apos;expertise {idx + 1}</p>
                <h3 className="font-heading text-4xl md:text-6xl font-black text-brand-blue mb-8 tracking-tighter leading-tight">{service.title}</h3>
                <p className="text-brand-blue/60 text-xl font-medium mb-12 max-w-2xl leading-relaxed">{service.desc}</p>
                
                <div className="grid md:grid-cols-2 gap-y-8 gap-x-12 mb-12">
                  {service.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-6 group/item">
                      <div className="h-px w-6 bg-brand-yellow group-hover/item:w-10 transition-all duration-500" />
                      <span className="text-brand-blue font-bold text-sm tracking-wide uppercase italic">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CASE STUDY MINI-CALLOUT */}
                <div className="bg-brand-sand/50 p-6 border-l-4 border-brand-blue mb-12 flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0 mt-1">
                    <span className="text-[10px] font-black italic">!</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue/40 mb-1">Impact Marquant</p>
                    <p className="text-brand-blue font-bold text-sm italic">"{service.caseStudy}"</p>
                  </div>
                </div>

                <Link href={`/contact?service=${service.id}`}>
                  <MagneticButton className="bg-brand-blue text-white px-10 py-5 rounded-none font-bold text-[11px] tracking-widest uppercase hover:bg-brand-yellow transition-colors duration-500 shadow-2xl flex items-center gap-6">
                    Lancer la mission <ArrowRight size={18} />
                  </MagneticButton>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MÉTHODE COEF Section */}
        <section className="py-24 border-y border-brand-blue/5 mt-20 bg-brand-blue text-white overflow-hidden relative rounded-sm">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%">
              <pattern id="prestige-white-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#prestige-white-grid)" />
            </svg>
          </div>

          <div className="max-w-5xl mx-auto px-10 relative z-10 text-center mb-20">
            <div className="inline-flex items-center gap-4 mb-10">
              <span className="h-px w-8 bg-brand-gold" />
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-gold">Rigueur Méthodologique</p>
              <span className="h-px w-8 bg-brand-gold" />
            </div>
            <h2 className="font-heading text-5xl md:text-7xl font-black mb-6 tracking-tighter">La Méthode <span className="serif-heading italic font-normal text-brand-gold">COEF.</span></h2>
            <p className="text-white/60 text-lg font-medium max-w-2xl mx-auto">Un protocole rigoureux en 4 étapes pour garantir l&apos;excellence opérationnelle et l&apos;impact durable de chaque intervention.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 px-10 max-w-7xl mx-auto relative z-10">
            {METHODE.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group p-10 border border-white/10 hover:bg-white/5 transition-all duration-700 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-6xl group-hover:opacity-10 transition-opacity italic">{m.step}</div>
                <m.icon size={40} className="text-brand-gold mb-8 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-black font-heading mb-4 text-white uppercase tracking-tighter">{m.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed font-normal">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* EXPERTISE PAR SECTEUR Section */}
        <section className="py-24 bg-white mt-12 rounded-sm border border-brand-blue/5 overflow-hidden">
          <div className="max-w-5xl mx-auto px-10 text-center mb-20">
             <p className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-blue/40 mb-6 italic">Agilité Multisectorielle</p>
             <h2 className="font-heading text-5xl md:text-7xl font-black text-brand-blue tracking-tighter">Où nous <span className="serif-heading italic font-normal text-brand-green">agissons.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 px-10 max-w-7xl mx-auto">
            {SECTEURS.map((s, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="group bg-brand-sand/20 border border-brand-sand p-10 hover:bg-white hover:shadow-2xl transition-all duration-700"
              >
                <div className="h-16 w-16 bg-brand-blue text-brand-gold flex items-center justify-center rounded-sm mb-8 group-hover:bg-brand-green group-hover:text-white transition-colors duration-500">
                  <s.icon size={30} />
                </div>
                <h4 className="text-2xl font-black font-heading text-brand-blue mb-4 tracking-tighter uppercase">{s.name}</h4>
                <p className="text-brand-blue/50 text-sm leading-relaxed font-medium mb-8">{s.desc}</p>
                <div className="h-px w-10 bg-brand-blue/10 group-hover:w-full transition-all duration-700" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION SECTION - Statutory & Minimalist */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mt-20 max-w-5xl mx-auto overflow-hidden"
        >
          <div className="mb-20 text-center relative overflow-hidden">
             <div className="inline-flex items-center gap-4 mb-10">
               <span className="h-px w-8 bg-brand-yellow/30" />
               <p className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-yellow">Renseignements</p>
               <span className="h-px w-8 bg-brand-yellow/30" />
             </div>
             <h2 className="font-heading text-5xl md:text-7xl font-black text-brand-blue tracking-tighter">Votre stratégie, <br /> <span className="serif-heading italic font-normal">nos réponses.</span></h2>
          </div>
          
          <div className="flex flex-col bg-white border-t border-brand-blue/10">
            {FAQS.map((faq, idx) => (
              <AccordionItem 
                key={idx} 
                faq={faq} 
                isOpen={openFaq === idx} 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
              />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
