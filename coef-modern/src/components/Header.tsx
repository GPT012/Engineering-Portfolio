'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { name: 'Expertises', href: '/expertises' },
  { name: 'Notre Action', href: '/notre-action' },
  { name: 'À propos', href: '/a-propos' },
  { name: 'Actualités', href: '/actualites' },
];

const SOCIALS = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/coefressources/', icon: LinkedInIcon },
  { name: 'Facebook', href: 'https://www.facebook.com/people/COEF-Ressources/100063747631842/', icon: FacebookIcon },
  { name: 'Instagram', href: 'https://www.instagram.com/coef_ressources', icon: InstagramIcon },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* TOP CONTACT BAR */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-[60] bg-brand-blue transition-all duration-500 overflow-hidden",
        isScrolled ? "h-0 opacity-0" : "h-10 opacity-100"
      )}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 text-white/90">
          <div className="flex items-center gap-6">
            <a href="tel:+261321911423" className="flex items-center gap-2 text-[10px] font-bold tracking-wider hover:text-brand-yellow transition-colors">
              <Phone size={12} />
              +261 32 19 114 23
            </a>
            <span className="h-3 w-px bg-white/20" />
            <a href="mailto:coef-re@moov.mg" className="flex items-center gap-2 text-[10px] font-bold tracking-wider hover:text-brand-yellow transition-colors">
              <Mail size={12} />
              coef-re@moov.mg
            </a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-yellow hover:text-brand-blue transition-all duration-300" title={s.name}>
                <s.icon size={12} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <header 
        className={cn(
          "fixed left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] px-6",
          isScrolled 
            ? "top-0 py-3 md:py-4 bg-white/98 backdrop-blur-xl border-b border-brand-blue/10 shadow-[0_4px_30px_rgba(60,80,139,0.08)]" 
            : "top-10 py-5 md:py-6 bg-white/95 backdrop-blur-xl border-b border-brand-blue/8 shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LOGO — Always colored on white bg */}
          <Link href="/" className="group flex items-center relative">
             <Image
               src="/images/logo-coef.png"
               alt="COEF-Ressources"
               width={110}
               height={75}
               className={cn(
                 "object-contain transition-all duration-500 h-[50px] md:h-[65px] w-auto",
                 isScrolled && "h-[40px] md:h-[50px]"
               )}
               priority
               unoptimized
             />
          </Link>

          {/* DESKTOP NAV */}
          <motion.nav 
            layout
            className="hidden md:flex items-center gap-1 p-1 transition-all duration-500 rounded-full bg-brand-blue/5 px-2"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="relative px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] transition-colors duration-500 z-10"
                >
                  <span className={cn(
                    "relative z-20 transition-colors duration-500",
                    isActive
                      ? "text-brand-blue font-black"
                      : hoveredLink === link.name
                        ? "text-brand-green"
                        : "text-brand-blue/70"
                  )} style={{ fontWeight: 600 }}>
                    {link.name}
                  </span>
                  {(hoveredLink === link.name || isActive) && (
                    <motion.div
                      layoutId="navUnderline"
                      className={cn(
                        "absolute bottom-0 left-5 right-5 h-[2px] z-10 rounded-full",
                        isActive ? "bg-brand-blue" : "bg-brand-green"
                      )}
                      transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
            
            {/* CTA */}
            <div className="ml-2 pl-2 border-l border-brand-blue/10">
              <Link 
                href="/contact"
                className="bg-brand-green text-white px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-brand-blue transition-colors whitespace-nowrap"
              >
                Parlons-nous
              </Link>
            </div>
          </motion.nav>

          {/* CONTACT BUTTON - Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+261321911423" className="text-brand-blue/50 hover:text-brand-blue text-[10px] font-bold tracking-wider transition-colors flex items-center gap-1.5">
              <Phone size={13} />
              <span className="hidden lg:inline">+261 32 19 114 23</span>
            </a>
          </div>

          {/* MOBILE TOGGLE */}
          <button 
            className="md:hidden p-3 shadow-lg rounded-full transition-colors border bg-white text-brand-blue border-brand-blue/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>


      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-brand-blue/95 backdrop-blur-xl md:hidden overflow-hidden flex flex-col justify-center p-12"
          >
            <div className="flex flex-col gap-6">
              {NAV_LINKS.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-4xl font-heading font-black text-white hover:text-brand-yellow transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              {/* Mobile Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-8 pt-8 border-t border-white/10 space-y-4"
              >
                <a href="tel:+261321911423" className="flex items-center gap-3 text-white/70 hover:text-brand-yellow transition-colors">
                  <Phone size={16} />
                  <span className="text-sm font-bold">+261 32 19 114 23</span>
                </a>
                <a href="mailto:coef-re@moov.mg" className="flex items-center gap-3 text-white/70 hover:text-brand-yellow transition-colors">
                  <Mail size={16} />
                  <span className="text-sm font-bold">coef-re@moov.mg</span>
                </a>
              </motion.div>

              {/* Mobile Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 flex gap-3"
              >
                {SOCIALS.map((s) => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-brand-yellow hover:text-brand-blue transition-all" title={s.name}>
                    <s.icon size={16} />
                  </a>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 pt-8 border-t border-white/10"
              >
                <Link 
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex items-center justify-between text-[11px] font-black uppercase tracking-[.4em] text-brand-yellow"
                >
                  Démarrer un projet
                  <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Social Icon Components (inline SVGs for zero dependencies)
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

// Arrow icon helper
function ArrowRight({ size, className }: any) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}
