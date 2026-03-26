'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { name: 'Expertises', href: '/expertises' },
  { name: 'À propos', href: '/a-propos' },
  { name: 'Actualités', href: '/actualites' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = usePathname();

  // Pages with a dark hero background
  const isDarkHeroPage = pathname === '/' || pathname === '/a-propos' || pathname === '/actualites';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transparent mode on dark hero pages when NOT scrolled
  const isTransparentMode = isDarkHeroPage && !isScrolled;

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] px-6",
          isScrolled 
            ? "py-4 md:py-5 bg-white/95 backdrop-blur-xl border-b border-brand-blue/10 shadow-sm" 
            : "py-8 md:py-12 bg-[#0C1222]/30 backdrop-blur-md border-b border-white/5"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LOGO — switches between white (dark bg) and color (light bg) */}
          <Link href="/" className="group flex items-center relative">
             <Image
               src="/images/logo-coef.png"
               alt="COEF-Ressources"
               width={110}
               height={75}
               className={cn(
                 "object-contain transition-all duration-500 h-[60px] md:h-[80px] w-auto",
                 isScrolled && "h-[45px] md:h-[55px]"
               )}
               priority
               unoptimized
             />
          </Link>

          {/* DESKTOP NAV - Pill with proper contrast */}
          <motion.nav 
            layout
            className={cn(
              "hidden md:flex items-center gap-1 p-1 transition-all duration-500 rounded-full",
              isScrolled 
                ? "bg-brand-sand/80 backdrop-blur-md border border-brand-blue/10 px-2" 
                : "bg-transparent px-2"
            )}
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
                      ? (isTransparentMode ? "text-brand-yellow font-black" : "text-brand-blue")
                      : hoveredLink === link.name
                        ? "text-brand-green"
                        : (isTransparentMode ? "text-white" : "text-brand-blue/70")
                  )} style={{ fontWeight: 600 }}>
                    {link.name}
                  </span>
                  {(hoveredLink === link.name || isActive) && (
                    <motion.div
                      layoutId="navUnderline"
                      className={cn(
                        "absolute bottom-0 left-5 right-5 h-[2px] z-10 rounded-full",
                        isActive
                          ? (isTransparentMode ? "bg-brand-yellow" : "bg-brand-blue")
                          : "bg-brand-green"
                      )}
                      transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
            
            {/* Scrolled CTA */}
            <div className={cn(
              "ml-2 pl-2 border-l border-brand-blue/10 transition-all duration-500",
              isScrolled ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden pointer-events-none"
            )}>
              <Link 
                href="/contact"
                className="bg-brand-green text-white px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-brand-blue transition-colors whitespace-nowrap"
              >
                Parlons-nous
              </Link>
            </div>
          </motion.nav>

          {/* CONTACT BUTTON - Right Side (before scroll) */}
          <div className={cn(
            "hidden md:block transition-all duration-500",
            isScrolled ? "opacity-0 invisible translate-x-4" : "opacity-100 visible translate-x-0"
          )}>
            <Link 
              href="/contact"
              className={cn(
                "group relative overflow-hidden flex items-center gap-2 px-8 py-3.5 border font-black text-[11px] uppercase tracking-[.3em] transition-all duration-500",
                isTransparentMode 
                  ? "border-white/30 text-white hover:border-brand-yellow" 
                  : "border-brand-blue/20 text-brand-blue hover:border-brand-green"
              )}
            >
              <div className={cn(
                "absolute inset-0 w-0 transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] group-hover:w-full",
                isTransparentMode ? "bg-white" : "bg-brand-blue"
              )} />
              <span className={cn("relative z-10 transition-colors", isTransparentMode ? "group-hover:text-brand-blue" : "group-hover:text-white")}>Consultation</span>
              <ChevronRight size={14} className="relative z-10 text-brand-green group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <button 
            className={cn(
              "md:hidden p-3 shadow-lg rounded-full transition-colors border",
              isTransparentMode 
                ? "bg-white/10 text-white border-white/20" 
                : "bg-white text-brand-blue border-brand-blue/10"
            )}
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12 pt-12 border-t border-white/10"
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

// Icon helper
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
