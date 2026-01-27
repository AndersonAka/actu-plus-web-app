// Configuration de l'API
export const apiConfig = {
  baseUrl: process.env.BACKEND_API_URL || 'http://localhost:3001',
  publicUrl: process.env.NEXT_PUBLIC_API_URL || '/api/proxy',
  timeout: 30000,
} as const;
