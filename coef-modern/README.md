# CoefRessources | Enterprise-Grade CMS & Prestige Portfolio 🏛️

[![Deployment](https://img.shields.io/badge/Status-Live-success?style=flat-square)](https://coef-modern.vercel.app)
[![Tech](https://img.shields.io/badge/Architecture-Next.js_15-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Security](https://img.shields.io/badge/Security-RLS_Lockdown-blue?style=flat-square)](https://postgresql.org)

> **Un écosystème digital complet conçu pour un cabinet de conseil leader à Madagascar. Alliant esthétique prestige, gestion de contenu autonome et sécurité industrielle.**

---

## 🎨 L'Essence du Projet
Ce projet n'est pas qu'un site vitrine, c'est une plateforme de gestion stratégique. L'objectif était de rendre une équipe non-technique totalement autonome dans la gestion de ses actualités, de son portfolio terrain et de ses prospects (leads).

### ✨ Caractéristiques Majeures

- **UI Haute-Couture** : Design "Journal" utilisant les codes du luxe et du prestige (Framer Motion, Glassmorphism, Typographies Playfair Display).
- **CMS Dynamique & Intuitif** : Gestionnaire d'articles et de galerie photos via une interface d'administration simplifiée.
- **Micro-CRM Intégré** : Système de capture de leads (projets) avec dashboard de suivi en temps réel.
- **Performance de Pointe** : Optimisation des images (Next/Image) et chargement hybride (SSR/ISR).

---

## 🛡️ Architecture & Sécurité (Expert-Level)

La sécurité a été au cœur de la conception, avec une approche **Zero Trust** sur les mutations de données.

- **Supabase Auth** : Authentification robuste par Email/Mot de passe pour l'administration.
- **Row Level Security (RLS)** : Politiques Postgres granulaires. Personne (même avec l'URL API) ne peut modifier le contenu sans être authentifié.
- **Sanitisation & Validation** : Validation de type stricte via TypeScript sur l'ensemble du flux de données.

---

## 🚀 Stack Technique

- **Frontend** : Next.js 15 (App Router), React 19, Tailwind CSS.
- **Animations** : Framer Motion (Parallaxe, Stagger effects).
- **Backend-as-a-Service** : Supabase (PostgreSQL, Storage, Auth).
- **Icons** : Lucide React.
- **Déploiement** : Vercel.

---

## 🛠️ Installation & Configuration local

### 1. Variables d'environnement
Créez un fichier `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_key
SUPABASE_SERVICE_ROLE_KEY=votre_secret
```

### 2. Démarrage
```bash
npm install
npm run dev
```

---

## 📄 Licence
Propriété de CoefRessources. Tous droits réservés.

---

### Architecturé par [0xbaw](https://github.com/0xbaw)
*Spécialiste Next.js & Solutions Backend-as-a-Service.*
