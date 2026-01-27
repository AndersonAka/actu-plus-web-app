# 🌐 Actu Plus Web App

Plateforme web Next.js pour Actu Plus - Version stable et sécurisée

## 🚀 Technologies

- **Next.js 16.1.3** (Version LTS Active - Stable et Sécurisée)
- **TypeScript** (mode strict)
- **Tailwind CSS 4** (avec palette de couleurs identique au mobile)
- **React 19.2.3**
- **NextAuth.js v5** (Auth.js) pour l'authentification
- **React Query** pour la gestion de l'état serveur
- **Zustand** pour l'état global minimal
- **React Hook Form + Zod** pour les formulaires

## 📁 Structure du Projet

```
actu-plus-web-app/
├── app/                    # Next.js App Router
├── components/             # Atomic Design
│   ├── atoms/             # Composants de base
│   ├── molecules/         # Composants composés
│   ├── organisms/         # Sections complexes
│   ├── templates/         # Layouts
│   └── ui/                # Composants UI (Shadcn)
├── lib/                   # Utilitaires
│   ├── api/               # Client API
│   ├── auth/              # Configuration NextAuth
│   ├── hooks/             # Hooks personnalisés
│   └── utils/             # Utilitaires
├── config/                # Configurations
├── constants/             # Constantes (couleurs, routes)
├── types/                 # Types TypeScript
└── public/                # Assets statiques
```

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier .env.example vers .env.local
cp .env.example .env.local

# Configurer les variables d'environnement dans .env.local
```

## 🚀 Démarrage

```bash
# Mode développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start
```

## 🔐 Configuration des Variables d'Environnement

Créez un fichier `.env.local` avec les variables suivantes :

```env
# Backend API
BACKEND_API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=/api/proxy

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# CinetPay
CINETPAY_API_KEY=your-cinetpay-api-key
CINETPAY_SITE_ID=your-cinetpay-site-id

# Environment
NODE_ENV=development
```

## 📚 Documentation

Voir les documents dans `../docs/` :
- `RESUME_PLATEFORME_WEB.md` - Résumé exécutif
- `ANALYSE_PLATEFORME_WEB.md` - Analyse complète

## 🔒 Sécurité

- ✅ Next.js 16.1.3 (inclut tous les correctifs de sécurité récents)
- ✅ Protection contre les vulnérabilités RCE (CVE-2025-66478)
- ✅ Version Active LTS avec support jusqu'en octobre 2026

## 🎨 Design System

Palette de couleurs identique à l'application mobile :
- **Primary :** `#0A7EA4`
- **Secondary :** `#0EA5E9`
- **Success :** `#22C55E`
- **Error :** `#EF4444`
- **Warning :** `#F59E0B`

Les couleurs sont configurées dans `constants/colors.ts` et disponibles via Tailwind CSS.

## 📝 Licence

Private - Actu Plus
