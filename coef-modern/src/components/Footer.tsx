'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Facebook, Linkedin, Twitter, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const EASING: [number, number, number, number] = [0.85, 0, 0.15, 1];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASING } }
};

// Subtle Magnetic Button for the Newsletter
function MagneticCircle({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
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
      className="bg-brand-green h-12 w-12 rounded-full flex items-center justify-center text-brand-forest hover:bg-white transition-colors duration-500 shadow-xl shrink-0 group"
    >
      <div className="relative flex items-center justify-center">
        <ArrowRight size={20} strokeWidth={2.5} className="transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] group-hover:translate-x-1" />
      </div>
    </motion.button>
  );
}

export default function Footer() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <footer ref={containerRef} className="bg-brand-forest text-brand-sand relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-green/30 to-transparent" />
      <div className="absolute -bottom-64 -left-64 h-96 w-96 rounded-full bg-brand-green/10 blur-[150px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 relative z-10">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid gap-16 md:gap-12 md:grid-cols-12"
        >
          {/* Brand & Newsletter Column */}
          <motion.div variants={fadeUp} className="md:col-span-5 flex flex-col justify-between">
            <div>
              <Link href="/" className="group inline-flex mb-8">
                <Image
                  src="/images/logo-coef.png"
                  alt="COEF-Ressources"
                  width={220}
                  height={150}
                  className="object-contain brightness-0 invert opacity-95 h-[100px] md:h-[120px] w-auto"
                  priority
                />
              </Link>
              <p className="max-w-sm text-base leading-relaxed text-brand-sand/60 font-medium">
                Cabinet multidisciplinaire expert en Capital Humain, 
                Organisation et Conseil Stratégique à Madagascar depuis plus de 20 ans.
              </p>
            </div>
            
            <form className="mt-12 bg-white/5 p-2 rounded-full border border-white/10 focus-within:border-brand-green/40 focus-within:bg-white/10 transition-all duration-500 flex items-center max-w-sm" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Votre adresse email..." 
                className="flex-1 bg-transparent px-6 py-3 text-sm text-white font-medium outline-none placeholder:text-white/30" 
              />
              <MagneticCircle>
                <ArrowRight size={20} />
              </MagneticCircle>
            </form>
          </motion.div>
          
          <div className="md:col-span-1" /> {/* Spacer */}

          {/* Connect Column */}
          <motion.div variants={fadeUp} className="md:col-span-2">
            <h4 className="mb-8 font-heading font-black text-white/40 uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
              <span className="w-4 h-px bg-brand-green/50" />
              Expertise
            </h4>
            <ul className="space-y-5 text-sm font-medium text-brand-sand/70">
              <li>
                <Link href="/expertises/rh" className="group flex items-center gap-2 hover:text-white transition-colors">
                  <span className="w-0 h-px bg-brand-green transition-all duration-300 group-hover:w-3" />
                  Ressources Humaines
                </Link>
              </li>
              <li>
                <Link href="/expertises/etudes" className="group flex items-center gap-2 hover:text-white transition-colors">
                  <span className="w-0 h-px bg-brand-green transition-all duration-300 group-hover:w-3" />
                  Études & Sondages
                </Link>
              </li>
              <li>
                <Link href="/expertises/audit" className="group flex items-center gap-2 hover:text-white transition-colors">
                  <span className="w-0 h-px bg-brand-green transition-all duration-300 group-hover:w-3" />
                  Audit & Organisation
                </Link>
              </li>
              <li>
                <Link href="/expertises/projets" className="group flex items-center gap-2 hover:text-white transition-colors">
                  <span className="w-0 h-px bg-brand-green transition-all duration-300 group-hover:w-3" />
                  Gestion de Projets
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Column */}
          <motion.div variants={fadeUp} className="md:col-span-2">
            <h4 className="mb-8 font-heading font-black text-white/40 uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
              <span className="w-4 h-px bg-brand-green/50" />
              Contact
            </h4>
            <ul className="space-y-5 text-sm font-medium text-brand-sand/70">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-green/50 shrink-0" />
                <span>Ambaranjana<br />Antananarivo 101, Madagascar</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green/50" />
                +261 20 22 234 40
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green/50" />
                contact@coefressources.mg
              </li>
            </ul>
          </motion.div>

          {/* Social Column */}
          <motion.div variants={fadeUp} className="md:col-span-2">
            <h4 className="mb-8 font-heading font-black text-white/40 uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
              <span className="w-4 h-px bg-brand-green/50" />
              Réseaux
            </h4>
            <div className="flex flex-col gap-4">
              {[
                { icon: Linkedin, name: "LinkedIn", href: "#" },
                { icon: Facebook, name: "Facebook", href: "#" },
                { icon: Twitter, name: "Twitter", href: "#" }
              ].map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  className="group flex items-center gap-4 text-sm font-bold text-brand-sand/60 hover:text-white transition-colors"
                >
                  <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-brand-green group-hover:border-brand-green group-hover:text-brand-forest transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)]">
                    <social.icon size={16} />
                  </div>
                  {social.name}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
        
        {/* Bottom Bar */}
        <motion.div 
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-sand/30">
            © {new Date().getFullYear()} CoefRessources. Tous droits réservés.
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="text-brand-sand/30 hover:text-brand-green transition-colors">Mentions Légales</a>
            <a href="#" className="text-brand-sand/30 hover:text-brand-green transition-colors">Confidentialité</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
