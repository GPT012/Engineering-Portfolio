'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
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

const SOCIALS = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/coefressources/', icon: LinkedInIcon },
  { name: 'Facebook', href: 'https://www.facebook.com/people/COEF-Ressources/100063747631842/', icon: FacebookIcon },
  { name: 'Instagram', href: 'https://www.instagram.com/coef_ressources', icon: InstagramIcon },
];

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
      className="bg-brand-green h-12 w-12 rounded-full flex items-center justify-center text-brand-blue hover:bg-white transition-colors duration-500 shadow-xl shrink-0 group"
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
    <footer ref={containerRef} className="bg-brand-blue text-brand-sand relative overflow-hidden">
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
                <Link href="/expertises" className="group flex items-center gap-2 hover:text-white transition-colors">
                  <span className="w-0 h-px bg-brand-green transition-all duration-300 group-hover:w-3" />
                  Ressources Humaines
                </Link>
              </li>
              <li>
                <Link href="/expertises" className="group flex items-center gap-2 hover:text-white transition-colors">
                  <span className="w-0 h-px bg-brand-green transition-all duration-300 group-hover:w-3" />
                  Études &amp; Sondages
                </Link>
              </li>
              <li>
                <Link href="/expertises" className="group flex items-center gap-2 hover:text-white transition-colors">
                  <span className="w-0 h-px bg-brand-green transition-all duration-300 group-hover:w-3" />
                  Audit &amp; Organisation
                </Link>
              </li>
              <li>
                <Link href="/expertises" className="group flex items-center gap-2 hover:text-white transition-colors">
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
              <li className="flex items-start gap-3">
                <MapPin size={14} className="mt-1 text-brand-green shrink-0" />
                <span>Ambaranjana<br />Antananarivo 101, Madagascar</span>
              </li>
              <li>
                <a href="tel:+261321911423" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Phone size={14} className="text-brand-green" />
                  +261 32 19 114 23
                </a>
              </li>
              <li>
                <a href="mailto:coef-re@moov.mg" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Mail size={14} className="text-brand-green" />
                  coef-re@moov.mg
                </a>
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
              {SOCIALS.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 text-sm font-bold text-brand-sand/60 hover:text-white transition-colors"
                >
                  <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-brand-green group-hover:border-brand-green group-hover:text-white transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)]">
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

// Social Icon Components
function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}
