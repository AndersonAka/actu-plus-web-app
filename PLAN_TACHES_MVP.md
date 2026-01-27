# 📋 Plan de Tâches MVP - Actu Plus Web App

**Objectif :** Avoir une application web fonctionnelle à présenter au client  
**Durée estimée :** 2-3 semaines  
**Date de création :** Janvier 2026

---

## � Rôles Utilisateurs & Workflow

### Rôles Administration
| Rôle | Permissions | Description |
|------|-------------|-------------|
| **user** | Lecture seule | Utilisateur standard (lecteur) |
| **veilleur** | Créer articles | Crée les articles en brouillon |
| **manager** | Valider/Rejeter/Publier | Valide ou rejette les articles, publie |
| **admin** | Tout | Administration complète |

### Workflow de Publication
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   DRAFT     │────▶│   PENDING   │────▶│  APPROVED   │────▶│  PUBLISHED  │
│ (Veilleur)  │     │ (Soumis)    │     │ (Manager)   │     │ (Manager)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │
                           │ Rejet
                           ▼
                    ┌─────────────┐
                    │  REJECTED   │ ❌ Pas de publication possible
                    │ (Manager)   │
                    └─────────────┘
```

### Statuts des Articles
| Statut | Description | Qui peut modifier |
|--------|-------------|-------------------|
| `DRAFT` | Brouillon en cours | Veilleur (auteur) |
| `PENDING` | Soumis pour validation | - |
| `APPROVED` | Validé, prêt à publier | Manager |
| `REJECTED` | Rejeté (avec raison) | Veilleur peut recréer |
| `PUBLISHED` | Publié et visible | Manager/Admin |
| `ARCHIVED` | Archivé | Admin |

### Visibilité des Articles (Public vs Premium)
| Type | Visibilité | Notes |
|------|------------|------|
| **Public** | Accessible à tous (même non connecté) | Tous les rôles peuvent y accéder |
| **Premium** | Réservé aux utilisateurs connectés avec abonnement actif | **admin/manager/veilleur** ont toujours accès |

---

## �📊 État Actuel du Projet

### ✅ Déjà en place
| Élément | Statut | Fichier/Dossier |
|---------|--------|-----------------|
| Next.js 16.1.3 | ✅ Installé | `package.json` |
| TypeScript | ✅ Configuré | `tsconfig.json` |
| Tailwind CSS 4 | ✅ Configuré | `globals.css` |
| Structure Atomic Design | ✅ Créée | `components/` |
| Types TypeScript | ✅ Définis | `types/` |
| Client API | ✅ Configuré | `lib/api/client.ts` |
| Endpoints définis | ✅ Configuré | `lib/api/endpoints.ts` |
| Middleware (protection par rôles) | ✅ Implémenté | `middleware.ts` |
| Auth via cookies (access/refresh + user) | ✅ Implémenté | `app/api/proxy/auth/*` + `lib/hooks/useAuth.ts` |
| Favoris | ✅ Implémenté | `/favorites` + `lib/services/favorites.service.ts` |
| Archives | ✅ Implémenté | `/archives` + `lib/services/archives.service.ts` |
| Gestion Public/Premium | ✅ Implémenté | Modération + détail article |

### ❌ À implémenter
- Page Abonnements `/subscriptions` (si non finalisée)
- Endpoint backend `GET /api/subscriptions/active` (si non existant)
- Tests manuels et validation E2E des parcours critiques

---

## 🎯 PHASE 1 : Infrastructure API & Auth (Jour 1-2)

### 1.1 Routes API Proxy
Créer les routes proxy vers le backend NestJS.

| Tâche | Fichier | Priorité |
|-------|---------|----------|
| [x] Route proxy articles | `app/api/proxy/articles/route.ts` | 🔴 Haute |
| [x] Route proxy articles/[id] | `app/api/proxy/articles/[id]/route.ts` | 🔴 Haute |
| [x] Route proxy categories | `app/api/proxy/categories/route.ts` | 🔴 Haute |
| [x] Route proxy countries | `app/api/proxy/countries/route.ts` | 🟡 Moyenne |
| [x] Route proxy auth/login | `app/api/proxy/auth/login/route.ts` | 🔴 Haute |
| [x] Route proxy auth/register | `app/api/proxy/auth/register/route.ts` | 🔴 Haute |
| [x] Route proxy auth/me | `app/api/proxy/auth/me/route.ts` | 🔴 Haute |
| [x] Route proxy users | `app/api/proxy/users/route.ts` | 🟡 Moyenne |
| [x] Route proxy subscriptions | `app/api/proxy/subscriptions/route.ts` | 🟡 Moyenne |
| [x] Route proxy favorites | `app/api/proxy/favorites/route.ts` | 🟢 Basse |
| [x] Route proxy archives | `app/api/proxy/archives/route.ts` | 🟢 Basse |
| [x] Route proxy articles publish | `app/api/proxy/articles/[id]/publish/route.ts` | 🟡 Moyenne |
| [x] Route proxy subscriptions/active | `app/api/proxy/subscriptions/active/route.ts` | 🟡 Moyenne |
| [x] Route proxy subscriptions/stats | `app/api/proxy/subscriptions/stats/route.ts` | 🟡 Moyenne |

### 1.2 Configuration NextAuth.js
| Tâche | Fichier | Priorité |
|-------|---------|----------|
| [ ] Configuration NextAuth | `lib/auth/config.ts` | 🟡 Optionnel |
| [ ] Provider Credentials | `lib/auth/providers.ts` | 🟡 Optionnel |
| [ ] Route NextAuth | `app/api/auth/[...nextauth]/route.ts` | 🟡 Optionnel |
| [x] Hook useAuth | `lib/hooks/useAuth.ts` | 🔴 Haute |
| [x] Middleware protection | `middleware.ts` (mise à jour) | 🔴 Haute |
| [ ] Session Provider | `components/providers/SessionProvider.tsx` | 🟡 Optionnel |

### 1.3 Variables d'environnement
| Tâche | Fichier | Priorité |
|-------|---------|----------|
| [x] Créer .env.local | `.env.local` | 🔴 Haute |
| [ ] Documenter variables | `.env.example` (mise à jour) | 🟡 Moyenne |

---

## 🎨 PHASE 2 : Composants Atomiques (Jour 2-3)

### 2.1 Atoms - Boutons
| Composant | Fichier | Variantes |
|-----------|---------|-----------|
| [ ] Button | `components/atoms/Button.tsx` | primary, secondary, outline, ghost, danger |
| [ ] IconButton | `components/atoms/IconButton.tsx` | sizes: sm, md, lg |
| [ ] LoadingButton | `components/atoms/LoadingButton.tsx` | avec spinner |

### 2.2 Atoms - Inputs
| Composant | Fichier | Types |
|-----------|---------|-------|
| [ ] Input | `components/atoms/Input.tsx` | text, email, password, search |
| [ ] TextArea | `components/atoms/TextArea.tsx` | - |
| [ ] Select | `components/atoms/Select.tsx` | simple, avec recherche |
| [ ] Checkbox | `components/atoms/Checkbox.tsx` | - |

### 2.3 Atoms - Typographie
| Composant | Fichier | Variantes |
|-----------|---------|-----------|
| [ ] Heading | `components/atoms/Heading.tsx` | h1, h2, h3, h4, h5, h6 |
| [ ] Text | `components/atoms/Text.tsx` | body, caption, label |
| [ ] Link | `components/atoms/Link.tsx` | internal, external |

### 2.4 Atoms - Display
| Composant | Fichier | Description |
|-----------|---------|-------------|
| [ ] Avatar | `components/atoms/Avatar.tsx` | Image utilisateur |
| [ ] Badge | `components/atoms/Badge.tsx` | Étiquettes colorées |
| [ ] Skeleton | `components/atoms/Skeleton.tsx` | Placeholder chargement |
| [ ] Spinner | `components/atoms/Spinner.tsx` | Indicateur chargement |
| [ ] Divider | `components/atoms/Divider.tsx` | Séparateur |
| [ ] Image | `components/atoms/Image.tsx` | Wrapper Next/Image |

### 2.5 Index exports
| Tâche | Fichier |
|-------|---------|
| [ ] Export atoms | `components/atoms/index.ts` |

---

## 🧪 PHASE 3 : Composants Moléculaires (Jour 3-4)

### 3.1 Cards
| Composant | Fichier | Description |
|-----------|---------|-------------|
| [ ] ArticleCard | `components/molecules/ArticleCard.tsx` | Carte article (liste) |
| [ ] ArticleCardLarge | `components/molecules/ArticleCardLarge.tsx` | Carte article (featured) |
| [ ] CategoryCard | `components/molecules/CategoryCard.tsx` | Carte catégorie |
| [ ] SubscriptionCard | `components/molecules/SubscriptionCard.tsx` | Carte abonnement |

### 3.2 Formulaires
| Composant | Fichier | Description |
|-----------|---------|-------------|
| [ ] FormField | `components/molecules/FormField.tsx` | Input + Label + Error |
| [ ] SearchBar | `components/molecules/SearchBar.tsx` | Barre de recherche |

### 3.3 Navigation
| Composant | Fichier | Description |
|-----------|---------|-------------|
| [ ] Pagination | `components/molecules/Pagination.tsx` | Pagination |
| [ ] Breadcrumb | `components/molecules/Breadcrumb.tsx` | Fil d'Ariane |
| [ ] NavLink | `components/molecules/NavLink.tsx` | Lien navigation |

### 3.4 Feedback
| Composant | Fichier | Description |
|-----------|---------|-------------|
| [ ] Alert | `components/molecules/Alert.tsx` | Messages d'alerte |
| [ ] Toast | `components/molecules/Toast.tsx` | Notifications toast |
| [ ] EmptyState | `components/molecules/EmptyState.tsx` | État vide |

### 3.5 Index exports
| Tâche | Fichier |
|-------|---------|
| [ ] Export molecules | `components/molecules/index.ts` |

---

## 🦠 PHASE 4 : Composants Organismes (Jour 4-5)

### 4.1 Navigation
| Composant | Fichier | Description |
|-----------|---------|-------------|
| [ ] Header | `components/organisms/Header.tsx` | En-tête public |
| [ ] Footer | `components/organisms/Footer.tsx` | Pied de page |
| [ ] Sidebar | `components/organisms/Sidebar.tsx` | Sidebar admin |
| [ ] MobileMenu | `components/organisms/MobileMenu.tsx` | Menu mobile |

### 4.2 Contenu
| Composant | Fichier | Description |
|-----------|---------|-------------|
| [ ] ArticleList | `components/organisms/ArticleList.tsx` | Liste d'articles |
| [ ] ArticleDetail | `components/organisms/ArticleDetail.tsx` | Détail article |
| [ ] FeaturedArticles | `components/organisms/FeaturedArticles.tsx` | Articles en vedette |
| [ ] CategoryList | `components/organisms/CategoryList.tsx` | Liste catégories |

### 4.3 Authentification
| Composant | Fichier | Description |
|-----------|---------|-------------|
| [ ] LoginForm | `components/organisms/LoginForm.tsx` | Formulaire connexion |
| [ ] RegisterForm | `components/organisms/RegisterForm.tsx` | Formulaire inscription |

### 4.4 Index exports
| Tâche | Fichier |
|-------|---------|
| [ ] Export organisms | `components/organisms/index.ts` |

---

## 📐 PHASE 5 : Templates & Layouts (Jour 5-6)

### 5.1 Layouts
| Layout | Fichier | Description |
|--------|---------|-------------|
| [ ] PublicLayout | `components/templates/PublicLayout.tsx` | Layout pages publiques |
| [ ] AuthLayout | `components/templates/AuthLayout.tsx` | Layout authentification |
| [ ] AdminLayout | `components/templates/AdminLayout.tsx` | Layout administration |
| [ ] ManagerLayout | `components/templates/ManagerLayout.tsx` | Layout manager |

### 5.2 Structure App Router
| Tâche | Fichier |
|-------|---------|
| [ ] Layout public | `app/(public)/layout.tsx` |
| [ ] Layout auth | `app/(auth)/layout.tsx` |
| [ ] Layout admin | `app/(admin)/layout.tsx` |
| [ ] Layout manager | `app/(manager)/layout.tsx` |

---

## 🌐 PHASE 6 : Pages Publiques (Jour 6-8)

### 6.1 Pages principales
| Page | Route | Fichier | Priorité |
|------|-------|---------|----------|
| [x] Accueil | `/` | `app/page.tsx` | 🔴 Haute |
| [x] Liste articles | `/articles` | `app/articles/page.tsx` | 🔴 Haute |
| [x] Détail article (Public/Premium) | `/articles/[id]` | `app/articles/[id]/page.tsx` | 🔴 Haute |
| [ ] Catégories | `/categories` | `app/(public)/categories/page.tsx` | 🟡 Moyenne |
| [ ] Catégorie | `/categories/[id]` | `app/(public)/categories/[id]/page.tsx` | 🟡 Moyenne |
| [ ] Recherche | `/search` | `app/(public)/search/page.tsx` | 🟡 Moyenne |
| [ ] Pays | `/countries/[code]` | `app/(public)/countries/[code]/page.tsx` | 🟢 Basse |

### 6.2 Pages authentification
| Page | Route | Fichier | Priorité |
|------|-------|---------|----------|
| [x] Login | `/login` | `app/login/page.tsx` | 🔴 Haute |
| [x] Register | `/register` | `app/register/page.tsx` | 🔴 Haute |
| [ ] Forgot Password | `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | 🟡 Moyenne |

### 6.3 Pages utilisateur (protégées)
| Page | Route | Fichier | Priorité |
|------|-------|---------|----------|
| [ ] Profil | `/profile` | `app/(protected)/profile/page.tsx` | 🟡 Moyenne |
| [x] Favoris | `/favorites` | `app/favorites/page.tsx` | 🟡 Moyenne |
| [x] Archives | `/archives` | `app/archives/page.tsx` | 🟡 Moyenne |
| [ ] Abonnements | `/subscriptions` | `app/subscriptions/page.tsx` | 🟡 Moyenne |

---

## 🔧 PHASE 7 : Administration (Jour 9-12)

### 7.1 Dashboard
| Page | Route | Fichier | Priorité |
|------|-------|---------|----------|
| [x] Dashboard Admin | `/admin` | `app/admin/page.tsx` | 🔴 Haute |
| [ ] Dashboard Manager | `/manager` | `app/(manager)/page.tsx` | 🟡 Moyenne |

### 7.2 Espace Veilleur (Création d'articles)
| Page | Route | Fichier | Priorité |
|------|-------|---------|----------|
| [x] Mes articles | `/veilleur` | `app/veilleur/page.tsx` | 🔴 Haute |
| [x] Créer article (cover + éditeur riche) | `/veilleur/articles/create` | `app/veilleur/articles/create/page.tsx` | 🔴 Haute |
| [ ] Éditer brouillon | `/veilleur/articles/[id]/edit` | `app/(veilleur)/articles/[id]/edit/page.tsx` | 🔴 Haute |
| [ ] Soumettre article | Action sur page édition | - | 🔴 Haute |

### 7.3 Espace Modérateur (Validation & Publication)
| Page | Route | Fichier | Priorité |
|------|-------|---------|----------|
| [x] Dashboard modération | `/moderateur` | `app/moderateur/page.tsx` | 🔴 Haute |
| [x] Articles en attente | `/moderateur/pending` | `app/moderateur/pending/page.tsx` | 🔴 Haute |
| [x] Liste des articles | `/moderateur/articles` | `app/moderateur/articles/page.tsx` | 🟡 Moyenne |
| [x] Valider/Rejeter article | `/moderateur/articles/[id]` | `app/moderateur/articles/[id]/page.tsx` | 🔴 Haute |
| [ ] Publier article | Action sur page validation | - | 🔴 Haute |
| [x] Articles validés | `/moderateur/approved` | `app/moderateur/approved/page.tsx` | 🟡 Moyenne |
| [x] Articles rejetés | `/moderateur/rejected` | `app/moderateur/rejected/page.tsx` | 🟡 Moyenne |
| [x] Articles publiés | `/moderateur/published` | `app/moderateur/published/page.tsx` | 🟡 Moyenne |

### 7.4 Gestion Utilisateurs (Admin)
| Page | Route | Fichier | Priorité |
|------|-------|---------|----------|
| [x] Liste utilisateurs | `/admin/users` | `app/admin/users/page.tsx` | 🟡 Moyenne |
| [ ] Détail utilisateur | `/admin/users/[id]` | `app/(admin)/users/[id]/page.tsx` | 🟡 Moyenne |

### 7.5 Gestion Catégories/Pays (Admin)
| Page | Route | Fichier | Priorité |
|------|-------|---------|----------|
| [x] Catégories | `/admin/categories` | `app/admin/categories/page.tsx` | 🟡 Moyenne |
| [x] Pays | `/admin/countries` | `app/admin/countries/page.tsx` | 🟢 Basse |

### 7.6 Gestion Abonnements (Admin)
| Page | Route | Fichier | Priorité |
|------|-------|---------|----------|
| [x] Abonnements | `/admin/subscriptions` | `app/admin/subscriptions/page.tsx` | 🟡 Moyenne |
| [ ] Paiements | `/admin/payments` | `app/(admin)/payments/page.tsx` | 🟢 Basse |

### 7.7 Gestion Articles (Admin)
| Page | Route | Fichier | Priorité |
|------|-------|---------|----------|
| [x] Articles | `/admin/articles` | `app/admin/articles/page.tsx` | 🔴 Haute |

### 7.8 Notifications & Paramètres (Admin)
| Page | Route | Fichier | Priorité |
|------|-------|---------|----------|
| [x] Notifications | `/admin/notifications` | `app/admin/notifications/page.tsx` | 🟡 Moyenne |
| [x] Paramètres | `/admin/settings` | `app/admin/settings/page.tsx` | 🟡 Moyenne |

### 7.9 Système de Notifications Automatiques (À implémenter)

#### Événements déclencheurs
| Événement | Destinataire | Type |
|-----------|--------------|------|
| Article soumis (DRAFT → PENDING) | Manager, Admin | `article_submitted` |
| Article validé (PENDING → APPROVED) | Veilleur (auteur) | `article_approved` |
| Article rejeté (PENDING → REJECTED) | Veilleur (auteur) | `article_rejected` |
| Article publié (APPROVED → PUBLISHED) | Veilleur, Admin | `article_published` |
| Nouvel abonnement (PENDING) | Admin | `subscription_created` |
| Abonnement activé | User, Admin | `subscription_activated` |
| Abonnement expiré | User | `subscription_expired` |
| Paiement réussi | User, Admin | `payment_success` |
| Paiement échoué | User, Admin | `payment_failed` |
| Nouvel utilisateur inscrit | Admin | `user_registered` |
| Compte désactivé | User concerné | `user_deactivated` |

#### Tâches Backend
| Tâche | Fichier | Priorité |
|-------|---------|----------|
| [x] Service NotificationEmitter | `src/notifications/notification-emitter.service.ts` | 🔴 Haute |
| [x] Intégrer émission dans ArticlesService | `src/articles/articles.service.ts` | 🔴 Haute |
| [x] Intégrer émission dans SubscriptionsService | `src/subscriptions/subscriptions.service.ts` | 🟡 Moyenne |
| [x] Intégrer émission dans PaymentsService | `src/payments/payments.service.ts` | 🟡 Moyenne |
| [x] Intégrer émission dans UsersService | `src/users/users.service.ts` | 🟡 Moyenne |
| [x] Endpoint GET /notifications/all (Admin) | `src/notifications/notifications.controller.ts` | 🟡 Moyenne |

#### Tâches Frontend
| Tâche | Fichier | Priorité |
|-------|---------|----------|
| [x] Section "Mes notifications" | `app/admin/notifications/page.tsx` | 🔴 Haute |
| [x] Section "Toutes les notifications" (Admin) | `app/admin/notifications/page.tsx` | 🟡 Moyenne |
| [x] Filtres (type, date, statut lu/non lu) | `app/admin/notifications/page.tsx` | 🟡 Moyenne |
| [x] Badge compteur non lus (Sidebar) | `components/organisms/Sidebar.tsx` | 🟡 Moyenne |
| [x] Route proxy GET /notifications/all | `app/api/proxy/notifications/all/route.ts` | 🟡 Moyenne |

---

## ✨ PHASE 8 : Polish & Tests (Jour 13-14)

### 8.1 Optimisations
| Tâche | Description | Priorité |
|-------|-------------|----------|
| [ ] SEO | Métadonnées pour chaque page | 🟡 Moyenne |
| [ ] Images | Optimisation Next/Image | 🟡 Moyenne |
| [ ] Loading states | Skeletons sur toutes les pages | 🟡 Moyenne |
| [ ] Error handling | Pages d'erreur (404, 500) | 🟡 Moyenne |

### 8.2 Responsive
| Tâche | Description | Priorité |
|-------|-------------|----------|
| [ ] Mobile | Adaptation mobile | 🔴 Haute |
| [ ] Tablet | Adaptation tablette | 🟡 Moyenne |
| [ ] Desktop | Vérification desktop | 🟡 Moyenne |

### 8.3 Tests manuels
| Tâche | Description |
|-------|-------------|
| [ ] Navigation | Tester tous les liens |
| [ ] Formulaires | Tester login/register |
| [ ] CRUD | Tester création/édition articles |
| [ ] Responsive | Tester sur différentes tailles |

---

## 📅 Planning Résumé

| Phase | Durée | Jours | Livrables |
|-------|-------|-------|-----------|
| **Phase 1** | 2 jours | J1-J2 | API Proxy + NextAuth |
| **Phase 2** | 1.5 jours | J2-J3 | Composants atomiques |
| **Phase 3** | 1.5 jours | J3-J4 | Composants moléculaires |
| **Phase 4** | 1.5 jours | J4-J5 | Composants organismes |
| **Phase 5** | 1 jour | J5-J6 | Templates & Layouts |
| **Phase 6** | 2.5 jours | J6-J8 | Pages publiques |
| **Phase 7** | 4 jours | J9-J12 | Administration |
| **Phase 8** | 2 jours | J13-J14 | Polish & Tests |

**Total : ~14 jours ouvrés (3 semaines)**

---

## 🚀 Ordre d'Exécution Recommandé

### Semaine 1 : Fondations
1. ✅ Phase 1.1 : Routes API Proxy (articles, categories, auth, favoris, archives)
2. ✅ Auth (cookies + middleware + useAuth)
3. ✅ Phase 2 : Composants atomiques essentiels
4. ✅ Phase 3 : Composants moléculaires essentiels

### Semaine 2 : Pages Publiques
5. ✅ Phase 4 : Organismes (Header, Footer, ArticleList)
6. ✅ Phase 5 : Layouts
7. ✅ Phase 6.1 : Pages principales (Accueil, Articles)
8. ✅ Phase 6.2 : Pages authentification (Login, Register)

### Semaine 3 : Administration
9. ✅ Phase 7.1 : Dashboard Admin
10. ✅ Phase 7.2 : Gestion Articles
11. ✅ Phase 7.3-7.5 : Autres gestions
12. ✅ Phase 8 : Polish & Tests

---

## 📝 Notes Importantes

### Dépendances Backend
- Le backend NestJS doit être en cours d'exécution sur `http://localhost:3001`
- Les endpoints suivants doivent être fonctionnels :
  - `GET /api/articles` - Liste des articles
  - `GET /api/articles/:id` - Détail article
  - `GET /api/categories` - Liste des catégories
  - `POST /api/auth/login` - Connexion
  - `POST /api/auth/register` - Inscription
  - `POST /api/articles/:id/publish` - Publier un article (public/premium)
  - `GET /api/subscriptions/active` - Statut abonnement (pour contenu premium)

### Variables d'environnement requises
```env
BACKEND_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### Commandes utiles
```bash
# Démarrer le dev server
npm run dev

# Build production
npm run build

# Lancer les tests
npm run test
```

---

**Dernière mise à jour :** Janvier 2026  
**Prochaine action :** Finaliser la page `/subscriptions` + vérifier l’endpoint backend `GET /api/subscriptions/active`
