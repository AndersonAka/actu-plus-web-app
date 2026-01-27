// Constantes de routes de l'application
export const Routes = {
  // Public
  home: '/',
  articles: '/articles',
  article: (id: string) => `/articles/${id}`,
  category: (id: string) => `/category/${id}`,
  country: (code: string) => `/country/${code}`,
  search: '/search',
  
  // Auth
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  otpVerification: '/otp-verification',
  
  // Protected
  profile: '/profile',
  favorites: '/favorites',
  archives: '/archives',
  subscriptions: '/subscriptions',
  notifications: '/notifications',
  
  // Manager
  managerDashboard: '/manager/dashboard',
  managerContent: '/manager/content',
  managerContentCreate: '/manager/content/create',
  managerContentEdit: (id: string) => `/manager/content/edit/${id}`,
  managerContentList: '/manager/content/list',
  
  // Admin
  adminDashboard: '/admin/dashboard',
  adminUsers: '/admin/users',
  adminUser: (id: string) => `/admin/users/${id}`,
  adminSubscriptions: '/admin/subscriptions',
  adminPayments: '/admin/payments',
  adminCategories: '/admin/categories',
  adminCountries: '/admin/countries',
  adminSettings: '/admin/settings',
} as const;
