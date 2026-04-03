import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PortfolioGallery from '@/components/PortfolioGallery';
import Image from 'next/image';

export const metadata = {
  title: 'Notre Action sur le Terrain | CoefRessources',
  description: 'Découvrez la réalité des missions de CoefRessources à Madagascar : collecte de données, formation et impact social.',
};

export default function NotreActionPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-brand-blue/10">
      <Header />
      
      {/* HERO SECTION */}
      <section className="relative pt-52 pb-20 md:pt-60 md:pb-32 overflow-hidden bg-brand-blue">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/portfolio/IMG_6226.JPG" // boat photo
            alt="Terrain Madagascar"
            fill
            className="object-cover opacity-30 mix-blend-luminosity scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-blue via-transparent to-white" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center md:text-left">
           <div className="flex flex-col items-center md:items-start gap-4 mb-8">
            <span className="px-5 py-2 bg-brand-yellow/10 text-brand-yellow text-[11px] font-black uppercase tracking-[0.4em] rounded-full backdrop-blur-sm border border-brand-yellow/20 inline-block">
              Notre Impact
            </span>
            <h1 className="text-5xl md:text-8xl font-heading font-black text-white leading-[0.9] tracking-tight">
              L'Action par <br /> 
              <span className="text-brand-yellow">le Terrain.</span>
            </h1>
          </div>
          
          <div className="max-w-2xl">
            <p className="text-xl md:text-2xl text-white/80 font-medium leading-relaxed italic mb-8">
              "L'excellence méthodologique ne s'écrit pas dans des bureaux, elle se forge dans l'immensité du terrain malgache."
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-white/10 mt-6 md:mt-10">
              <div className="flex flex-col gap-1 px-10 py-6 bg-brand-blue/60 backdrop-blur-2xl rounded-3xl border border-white/10 flex-1 min-w-[180px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 duration-500">
                <span className="text-brand-yellow text-4xl md:text-5xl font-heading font-black drop-shadow-xl">22</span>
                <span className="text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] drop-shadow-md">Zones d'Action</span>
              </div>
              <div className="flex flex-col gap-1 px-10 py-6 bg-brand-blue/60 backdrop-blur-2xl rounded-3xl border border-white/10 flex-1 min-w-[180px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 duration-500">
                <span className="text-brand-yellow text-4xl md:text-5xl font-heading font-black drop-shadow-xl">150+</span>
                <span className="text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] drop-shadow-md">Enquêteurs</span>
              </div>
              <div className="flex flex-col gap-1 px-10 py-6 bg-brand-blue/60 backdrop-blur-2xl rounded-3xl border border-white/10 flex-1 min-w-[180px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 duration-500">
                <span className="text-brand-yellow text-4xl md:text-5xl font-heading font-black drop-shadow-xl">100%</span>
                <span className="text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] drop-shadow-md">Madagascar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 pb-12 border-b border-brand-blue/5">
            <div className="max-w-xl">
              <h2 className="text-brand-blue text-4xl md:text-5xl font-heading font-black leading-tight mb-4">
                Une signature forgée <br /> par l'expérience.
              </h2>
              <p className="text-brand-blue/60 text-lg">
                Explorez nos archives visuelles : des missions logistiques fluviales aux sessions de restitution Afrobarometer, chaque image témoigne de notre engagement pour la précision.
              </p>
            </div>
            <div className="hidden md:block h-px flex-1 mx-12 bg-gradient-to-r from-brand-blue/10 to-transparent" />
          </div>
        </div>
        
        <PortfolioGallery />
      </section>

      {/* CALL TO ACTION */}
      <section className="py-24 px-6 bg-brand-blue relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
             src="/images/portfolio/IMG_5840.JPG" // Panorama
             alt="Background"
             fill
             className="object-cover opacity-10"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-heading font-black text-white mb-8 leading-tight">
            Prêt à transformer <br /> votre organisation ?
          </h2>
          <p className="text-white/60 text-xl mb-12 max-w-2xl mx-auto">
            Mettez l'expertise terrain et les données de confiance au service de votre stratégie RH et gouvernance.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="/expertises" className="px-10 py-5 bg-brand-yellow text-brand-blue rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-2xl">
              Explorer nos expertises
            </a>
            <a href="/contact" className="px-10 py-5 border border-white/20 text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Démarrer un projet
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
