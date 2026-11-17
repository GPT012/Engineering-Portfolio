# CoefRessources | CMS & Portfolio

[![Deployment](https://img.shields.io/badge/Status-Live-success?style=flat-square)](https://coef-modern.vercel.app)
[![Tech](https://img.shields.io/badge/Architecture-Next.js_16-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

> Application de gestion de contenu, de galerie et de prospects pour un cabinet de conseil à Madagascar.

---

## 🎨 L'Essence du Projet
L'application permet à l'équipe de gérer ses actualités, sa galerie et ses prospects depuis une interface d'administration.

### ✨ Caractéristiques Majeures

- **Interface d'administration** : Gestion des articles et de la galerie photos.
- **Suivi des prospects** : Formulaire de prise de contact et tableau de suivi.
- **Interface** : Mise en page éditoriale, animations Framer Motion et typographies Playfair Display.

## Authentification

Le projet utilise Supabase Auth pour l'accès à l'administration. Ce README ne constitue pas un audit de sécurité.

---

## 🚀 Stack Technique

- **Frontend** : Next.js 16 (App Router), React 19, Tailwind CSS.
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

### Built by [GPT012](https://github.com/GPT012)
