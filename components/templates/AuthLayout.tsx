'use client';

import Link from 'next/link';

export interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/" className="text-3xl font-bold text-primary-500">
              Actu+
            </Link>
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700">
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <h2 className="mb-4 text-4xl font-bold">Bienvenue sur Actu Plus</h2>
            <p className="max-w-md text-center text-lg text-primary-100">
              Votre source d'actualités fiable et complète. Restez informé avec
              les dernières nouvelles du monde entier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AuthLayout };
