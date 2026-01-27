import { RegisterForm } from '@/components/organisms';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Inscription - Actu Plus',
  description: 'Créez votre compte Actu Plus',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8 flex justify-center">
            <Link href="/">
              <Image
                src="/images/logo-actu-plus.webp"
                alt="Actu Plus"
                width={150}
                height={50}
                priority
                className="h-12 w-auto"
              />
            </Link>
          </div>
          <RegisterForm />
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1920&auto=format&fit=crop"
          alt="Actualités"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/80 to-primary-900/90">
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <h2 className="mb-4 text-4xl font-bold">Rejoignez Actu Plus</h2>
            <p className="max-w-md text-center text-lg text-primary-100">
              Créez un compte pour accéder à toutes les fonctionnalités.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
