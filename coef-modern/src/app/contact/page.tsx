'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Send, CheckCircle2, 
  Linkedin, Facebook, Instagram, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { supabase } from '@/lib/supabase';

const EASING: [number, number, number, number] = [0.85, 0, 0.15, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASING } }
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: 'Conseil en Stratégie RH',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: formData.name,
          email: formData.email,
          company: formData.company,
          service: formData.service,
          message: formData.message
        }]);

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setErrorMessage("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-sand/10 pt-52 pb-24 overflow-hidden selection:bg-brand-yellow/30">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* 1. HERO - Statutory Title */}
        <motion.div initial="hidden" animate="show" variants={fadeInUp} className="mb-24 text-center md:text-left max-w-5xl">
          <div className="inline-flex items-center gap-6 mb-10">
            <span className="h-px w-10 bg-brand-yellow" />
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-yellow">Canal Premium</span>
          </div>
          <h1 className="font-heading text-6xl md:text-[100px] font-black text-brand-blue leading-[0.9] tracking-tighter mb-10">
            Commençons une <br /> <span className="serif-heading italic font-normal text-brand-yellow">collaboration.</span>
          </h1>
          <p className="text-xl md:text-2xl text-brand-blue/60 max-w-2xl leading-relaxed font-medium italic">
            Une question stratégique, un besoin urgent de recrutement ou une étude d&apos;impact territoriale ? Nos experts vous répondent sous 24h.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-20">
          
          {/* 2. CONTACT INFO CARDS (Left) */}
          <motion.div initial="hidden" animate="show" variants={fadeInUp} className="lg:col-span-5 space-y-10 order-2 lg:order-1">
            
            <div className="grid gap-6">
              {[
                { icon: MapPin, label: "Siège Social", value: "Antananarivo, Madagascar", detail: "Immeuble COEF, Centre Ville" },
                { icon: Phone, label: "Ligne Directe", value: "+261 32 19 114 23", detail: "Disponible de 08:30 à 17:30" },
                { icon: Mail, label: "Email Stratégique", value: "coef-re@moov.mg", detail: "Réponse prioritaire aux projets" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-10 border border-brand-blue/5 shadow-xl group hover:border-brand-yellow transition-all duration-700">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="h-12 w-12 bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                      <item.icon size={20} strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue/40">{item.label}</span>
                  </div>
                  <p className="text-xl font-heading font-black text-brand-blue mb-2">{item.value}</p>
                  <p className="text-brand-blue/40 text-[10px] font-bold uppercase tracking-widest">{item.detail}</p>
                </div>
              ))}
            </div>

            {/* Socials Link */}
            <div className="pt-10 border-t border-brand-blue/5 flex items-center gap-8">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue/20">Nos réseaux</span>
               <div className="flex gap-4">
                  <a href="#" className="h-12 w-12 rounded-full bg-brand-blue/5 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all"><Linkedin size={16} /></a>
                  <a href="#" className="h-12 w-12 rounded-full bg-brand-blue/5 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all"><Facebook size={16} /></a>
                  <a href="#" className="h-12 w-12 rounded-full bg-brand-blue/5 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all"><Instagram size={16} /></a>
               </div>
            </div>
          </motion.div>

          {/* 3. FORM - Prestige Journal Look (Right) */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: EASING }}
            className="lg:col-span-7 order-1 lg:order-2"
          >
            {isSubmitted ? (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-brand-blue p-20 text-center shadow-3xl">
                  <CheckCircle2 size={80} className="text-brand-gold mx-auto mb-10" strokeWidth={1} />
                  <h2 className="font-heading text-4xl font-black text-white mb-6 uppercase tracking-tighter">Votre requête <br /> a été transmise.</h2>
                  <p className="text-white/60 text-lg leading-relaxed mb-10 italic">Un membre du cabinet CoefRessources <br /> vous contactera par email dans les prochaines heures.</p>
                  <button onClick={() => setIsSubmitted(false)} className="px-10 py-5 bg-brand-gold text-brand-blue font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all duration-500">Retour au formulaire</button>
               </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-12 md:p-20 shadow-[-40px_40px_100px_rgba(60,80,139,0.08)] border border-brand-blue/5">
                <div className="grid md:grid-cols-2 gap-10 mb-16">
                   <div className="space-y-10">
                      <div className="group relative">
                        <label className="label-style">Votre Nom complet</label>
                        <input 
                          type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                          className="input-style" placeholder="Nom et Prénom" 
                        />
                      </div>
                      <div className="group relative">
                        <label className="label-style">Adresse Email</label>
                        <input 
                          type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                          className="input-style" placeholder="email@entreprise.com" 
                        />
                      </div>
                   </div>
                   <div className="space-y-10">
                      <div className="group relative">
                        <label className="label-style">Société</label>
                        <input 
                          type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                          className="input-style" placeholder="Nom de l'organisation" 
                        />
                      </div>
                      <div className="group relative">
                        <label className="label-style">Type de Requête</label>
                        <select 
                          className="input-style bg-transparent cursor-pointer"
                          value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})}
                        >
                          <option>Conseil en Stratégie RH</option>
                          <option>Missions Terrains & Sondages</option>
                          <option>Formation & Capacité</option>
                          <option>Audit & Gouvernance</option>
                          <option>Autre</option>
                        </select>
                      </div>
                   </div>
                </div>

                <div className="mb-16 group relative">
                   <label className="label-style">Détails de votre projet</label>
                   <textarea 
                     rows={5} required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                     className="input-style p-4 !border-2" 
                     placeholder="Décrivez brièvement comment nous pouvons vous accompagner..."
                   />
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-brand-blue text-white py-8 font-black uppercase text-[11px] tracking-[0.4em] hover:bg-brand-green transition-all duration-700 flex items-center justify-center gap-6 shadow-2xl relative overflow-hidden"
                >
                  {loading ? (
                    <div className="flex items-center gap-4"><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Transmission en cours...</div>
                  ) : (
                    <>Envoyer la Requête <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>

      <style jsx>{`
        .label-style { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: rgba(1, 15, 30, 0.4); display: block; margin-bottom: 12px; }
        .input-style { width: 100%; border: none; border-bottom: 2px solid rgba(1, 15, 30, 0.1); padding: 12px 0; outline: none; transition: all 0.5s; font-size: 16px; font-weight: 600; color: #010F1E; }
        .input-style:focus { border-color: #010F1E; }
        .input-style::placeholder { color: rgba(1, 15, 30, 0.1); font-weight: 400; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; }
      `}</style>
    </div>
  );
}
