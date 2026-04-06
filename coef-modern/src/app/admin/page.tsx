'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Article } from '@/lib/articles';
import { 
  Plus, Edit, Trash2, Save, X, Image as ImageIcon, 
  CheckCircle2, AlertCircle, Loader2, LogIn, ChevronRight,
  Newspaper, LayoutGrid, MessageSquare, Mail, User, Building, Clock, LogOut
} from 'lucide-react';
import Image from 'next/image';

type AdminTab = 'news' | 'portfolio' | 'leads';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('news');
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsCheckingSession(false);
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      if (activeTab === 'news') fetchArticles();
      else if (activeTab === 'portfolio') fetchPortfolio();
      else fetchLeads();
    }
  }, [session, activeTab]);

  async function fetchArticles() {
    setLoading(true);
    const { data } = await supabase.from('articles').select('*').order('published_at', { ascending: false });
    if (data) setArticles(data.map((item: any) => ({ ...item, date: item.published_at.split('T')[0], image: item.image_url })));
    setLoading(false);
  }

  async function fetchPortfolio() {
    setLoading(true);
    const { data } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
    if (data) setPortfolio(data);
    setLoading(false);
  }

  async function fetchLeads() {
    setLoading(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error.message);
    }
    setIsAuthenticating(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('news-images').upload(fileName, file);
    if (uploadError) return null;
    const { data } = supabase.storage.from('news-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    let imageUrl = formData.image_url || formData.image;
    if (imageFile) {
      const uploadedUrl = await handleImageUpload(imageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    if (activeTab === 'news') {
      const slug = formData.slug || formData.title?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const { error } = await supabase.from('articles').upsert({ ...formData, slug, image_url: imageUrl, published_at: new Date().toISOString() });
      if (!error) { setMessage({ type: 'success', text: 'Article publié !' }); fetchArticles(); }
    } else if (activeTab === 'portfolio') {
      const { error } = await supabase.from('portfolio').upsert({ ...formData, image_url: imageUrl });
      if (!error) { setMessage({ type: 'success', text: 'Portfolio à jour !' }); fetchPortfolio(); }
    }
    setIsEditing(false); setUploading(false); setImageFile(null);
  };

  // State: Initial Loading (Verifying session)
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-brand-blue flex flex-col items-center justify-center p-6 text-white">
        <div className="relative">
          <Loader2 className="animate-spin text-brand-yellow/30" size={80} strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-brand-yellow rounded-full animate-ping" />
          </div>
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-brand-yellow/60 animate-pulse">
          Vérification de l'accès sécurisé...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-brand-sand/10 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 shadow-2xl border border-brand-blue/5">
          <h1 className="font-heading text-3xl font-black text-brand-blue mb-10 text-center uppercase tracking-tighter">Accès Sécurisé</h1>
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-brand-blue/40 px-1">Email Administrateur</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-brand-sand/20 border-b-2 border-brand-blue/10 px-4 py-3 focus:border-brand-blue outline-none transition-all font-medium" placeholder="admin@coef.mg" required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-brand-blue/40 px-1">Mot De Passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-brand-sand/20 border-b-2 border-brand-blue/10 px-4 py-3 focus:border-brand-blue outline-none transition-all font-medium" placeholder="••••••••" required />
            </div>
            {authError && <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-sm text-[10px] font-bold uppercase tracking-tight"><AlertCircle size={14} /> {authError}</div>}
            <button type="submit" disabled={isAuthenticating} className="w-full bg-brand-blue text-white py-4 font-black text-[11px] uppercase tracking-widest hover:bg-brand-green transition-all shadow-lg flex items-center justify-center gap-3">
              {isAuthenticating ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />} 
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-sand/10 pt-52 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* NAV TABS & LOGOUT */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-2 bg-white/50 p-2 border border-brand-blue/5 w-fit">
            <button onClick={() => { setActiveTab('news'); setIsEditing(false); }} className={cn("tab-btn", activeTab === 'news' && "active")}><Newspaper size={16} /> News</button>
            <button onClick={() => { setActiveTab('portfolio'); setIsEditing(false); }} className={cn("tab-btn", activeTab === 'portfolio' && "active")}><LayoutGrid size={16} /> Portfolio</button>
            <button onClick={() => { setActiveTab('leads'); setIsEditing(false); }} className={cn("tab-btn", activeTab === 'leads' && "active")}><MessageSquare size={16} /> Messages</button>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-brand-blue/40 hover:text-red-500 transition-colors">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <h1 className="font-heading text-6xl font-black text-brand-blue leading-[0.9] tracking-tighter uppercase">
            {activeTab === 'news' ? 'Actualités' : activeTab === 'portfolio' ? 'Portfolio' : 'Messages'}.
          </h1>
          {activeTab !== 'leads' && !isEditing && (
            <button onClick={() => { setIsEditing(true); setFormData(activeTab === 'news' ? { title: '', category: 'Actualité', summary: '', content: '', is_featured: false, read_time: '3 min' } : { title: '', category: 'Terrain', location: '', description: '', span: '' }); }} className="bg-brand-blue text-white px-8 py-5 font-black text-[11px] uppercase tracking-widest hover:bg-brand-yellow hover:text-brand-blue transition-all shadow-xl flex items-center gap-3">
              <Plus size={18} /> {activeTab === 'news' ? 'Nouvel Article' : 'Nouvelle Photo'}
            </button>
          )}
        </div>

        {message && <div className="mb-8 p-6 bg-white border-l-4 border-brand-green shadow-lg flex justify-between"><span>{message.text}</span><button onClick={() => setMessage(null)} className="opacity-30">X</button></div>}

        {/* TAB CONTENT */}
        {!isEditing ? (
          <div className="grid gap-4">
            {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-brand-blue/20" size={40} /></div> : (
              activeTab === 'leads' ? (
                leads.length === 0 ? <p className="text-center py-20 opacity-30 italic">Aucun message pour le moment.</p> :
                leads.map(lead => (
                  <div key={lead.id} className="bg-white p-8 border border-brand-blue/5 shadow-sm group hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <span className={cn("px-4 py-1 text-[9px] font-black uppercase tracking-widest", lead.status === 'Nouveau' ? "bg-brand-yellow text-brand-blue" : "bg-brand-sand text-brand-blue/40")}>{lead.status}</span>
                        <span className="text-brand-blue/20 text-[9px] font-bold"><Clock size={10} className="inline mr-1" /> {new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={async () => { await supabase.from('leads').update({ status: 'Traité' }).eq('id', lead.id); fetchLeads(); }} className="text-brand-blue/20 hover:text-brand-green transition-colors"><CheckCircle2 size={16} /></button>
                         <button onClick={async () => { if(confirm('Supprimer ?')) { await supabase.from('leads').delete().eq('id', lead.id); fetchLeads(); }}} className="text-red-200 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                       <div className="space-y-3">
                          <p className="flex items-center gap-3 text-brand-blue font-black text-[11px] uppercase tracking-widest truncate"><User size={14} className="text-brand-green" /> {lead.name}</p>
                          <p className="flex items-center gap-3 text-brand-blue/60 text-xs truncate"><Mail size={14} className="text-brand-green" /> {lead.email}</p>
                          <p className="flex items-center gap-3 text-brand-blue/60 text-xs truncate"><Building size={14} className="text-brand-green" /> {lead.company || 'Individuel'}</p>
                       </div>
                       <div className="md:col-span-2 bg-brand-sand/10 p-6 italic text-brand-blue/80 text-sm border-l-2 border-brand-blue/10">
                          <p className="font-bold text-[10px] uppercase text-brand-blue/30 mb-2 mt-[-4px]">Sujet : {lead.service}</p>
                          "{lead.message}"
                       </div>
                    </div>
                  </div>
                ))
              ) : (activeTab === 'news' ? articles : portfolio).map((item: any) => (
                <div key={item.slug || item.id} className="bg-white p-6 flex items-center gap-6 border border-brand-blue/5 shadow-sm hover:shadow-md transition-all">
                  <div className="h-20 w-20 bg-brand-sand/10 relative overflow-hidden shrink-0"><Image src={item.image || item.image_url || '/images/about-office.png'} alt="P" fill className="object-cover" /></div>
                  <div className="flex-1 truncate"><span className="text-[9px] font-black text-brand-yellow uppercase">{item.category}</span><h3 className="font-heading text-lg font-black text-brand-blue">{item.title}</h3></div>
                  <div className="flex gap-2"><button onClick={() => { setFormData(item); setIsEditing(true); }} className="p-3 text-brand-blue/40 hover:text-brand-blue"><Edit size={18} /></button><button onClick={async () => { if(confirm('S?')) { await supabase.from(activeTab === 'news' ? 'articles' : 'portfolio').delete().eq(activeTab === 'news' ? 'slug' : 'id', item.slug || item.id); activeTab === 'news' ? fetchArticles() : fetchPortfolio(); }}} className="p-3 text-red-200 hover:text-red-500"><Trash2 size={18} /></button></div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div><label className="label-admin">Titre</label><input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-admin" /></div>
                  <div><label className="label-admin">Catégorie</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-admin">{activeTab === 'news' ? (<><option>Actualité</option><option>Gouvernance</option><option>Sociologie</option></>) : (<><option>Terrain</option><option>Formation</option><option>Afrobarometer</option><option>Social</option></>)}</select></div>
                </div>
                <div><label className="label-admin">Image</label>
                  <div className="aspect-video bg-brand-sand/10 border-2 border-dashed border-brand-blue/10 flex items-center justify-center relative overflow-hidden">
                    {imageFile || formData.image_url || formData.image ? (<Image src={imageFile ? URL.createObjectURL(imageFile) : (formData.image_url || formData.image)} alt="P" fill className="object-cover" />) : <ImageIcon className="text-brand-blue/10" size={40} />}
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
              <div><label className="label-admin">{activeTab === 'news' ? 'Contenu (HTML)' : 'Description'}</label><textarea rows={activeTab === 'news' ? 12 : 4} required value={formData.content || formData.description} onChange={e => setFormData({...formData, [activeTab === 'news' ? 'content' : 'description']: e.target.value})} className="input-admin p-4" /></div>
              <div className="flex justify-end gap-4"><button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 font-black text-[10px] uppercase text-brand-blue/40 tracking-widest">Annuler</button><button type="submit" disabled={uploading} className="bg-brand-blue text-white px-12 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-brand-yellow hover:text-brand-blue transition-all disabled:opacity-50">{uploading ? <Loader2 className="animate-spin" /> : <Save size={16} />} {formData.id || formData.slug ? 'Mettre à jour' : 'Publier'}</button></div>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        .tab-btn { display: flex; align-items: center; gap: 12px; padding: 12px 24px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(1, 15, 30, 0.4); transition: all 0.3s; }
        .tab-btn:hover { color: #010F1E; }
        .tab-btn.active { background: #010F1E; color: #FFFFFF; }
        .label-admin { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(1, 15, 30, 0.4); margin-bottom: 8px; }
        .input-admin { width: 100%; background: rgba(245, 240, 230, 0.5); border: none; border-bottom: 2px solid rgba(1, 15, 30, 0.1); padding: 12px 0; outline: none; transition: all 0.3s; font-weight: 700; color: #010F1E; }
        .input-admin:focus { border-color: #010F1E; }
        select.input-admin { padding: 12px 16px; border: 1px solid rgba(1, 15, 30, 0.1); }
      `}</style>
    </div>
  );
}

function cn(...classes: any[]) { return classes.filter(Boolean).join(' '); }
