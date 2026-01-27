// Définition des endpoints de l'API
export const apiEndpoints = {
  // Auth
  auth: {
    login: '/api/proxy/auth/login',
    register: '/api/proxy/auth/register',
    logout: '/api/proxy/auth/logout',
    refresh: '/api/proxy/auth/refresh',
    me: '/api/proxy/auth/me',
    forgotPassword: '/api/proxy/auth/forgot-password',
    resetPassword: '/api/proxy/auth/reset-password',
    verifyOtp: '/api/proxy/auth/verify-otp',
  },
  
  // Articles
  articles: {
    list: '/api/proxy/articles',
    detail: (id: string) => `/api/proxy/articles/${id}`,
    create: '/api/proxy/articles',
    update: (id: string) => `/api/proxy/articles/${id}`,
    delete: (id: string) => `/api/proxy/articles/${id}`,
    // Workflow Veilleur → Modérateur
    submit: (id: string) => `/api/proxy/articles/${id}/submit`,      // Veilleur soumet pour validation
    validate: (id: string) => `/api/proxy/articles/${id}/validate`,  // Modérateur valide/rejette
    publish: (id: string) => `/api/proxy/articles/${id}/publish`,    // Modérateur publie
    unpublish: (id: string) => `/api/proxy/articles/${id}/unpublish`, // Modérateur dépublie
    // Filtres par statut
    pending: '/api/proxy/articles?status=PENDING',      // Articles en attente de validation
    approved: '/api/proxy/articles?status=APPROVED',    // Articles validés (prêts à publier)
    rejected: '/api/proxy/articles?status=REJECTED',    // Articles rejetés
    published: '/api/proxy/articles?status=PUBLISHED',  // Articles publiés
    myArticles: '/api/proxy/articles/my',               // Articles du veilleur connecté
  },
  
  // Categories
  categories: {
    list: '/api/proxy/categories',
    detail: (id: string) => `/api/proxy/categories/${id}`,
  },
  
  // Countries
  countries: {
    list: '/api/proxy/countries',
    detail: (code: string) => `/api/proxy/countries/${code}`,
  },
  
  // Users
  users: {
    list: '/api/proxy/users',
    detail: (id: string) => `/api/proxy/users/${id}`,
    update: (id: string) => `/api/proxy/users/${id}`,
  },
  
  // Subscriptions
  subscriptions: {
    plans: '/api/proxy/subscriptions/plans',
    list: '/api/proxy/subscriptions',
    detail: (id: string) => `/api/proxy/subscriptions/${id}`,
    subscribe: '/api/proxy/subscriptions/subscribe',
  },
  
  // Payments
  payments: {
    initiate: '/api/proxy/payments/initiate',
    verify: '/api/proxy/payments/verify',
    list: '/api/proxy/payments',
  },
  
  // Favorites
  favorites: {
    list: '/api/proxy/favorites',
    add: '/api/proxy/favorites',
    remove: (id: string) => `/api/proxy/favorites/${id}`,
  },
  
  // Archives
  archives: {
    list: '/api/proxy/archives',
    add: '/api/proxy/archives',
    remove: (id: string) => `/api/proxy/archives/${id}`,
  },
} as const;
