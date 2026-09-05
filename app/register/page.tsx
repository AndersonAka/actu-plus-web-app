import { Archivo } from 'next/font/google';
import { RegisterForm } from '@/components/organisms';
import Link from 'next/link';
import Image from 'next/image';

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '500', '600', '800'] });

export const metadata = {
  title: 'Inscription - Actu Plus',
  description: 'Créez votre compte Actu Plus',
};

export default function RegisterPage() {
  return (
    <div className={`${archivo.className} flex min-h-screen bg-[#f3f2f2] text-[#201e1d]`}>
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
                unoptimized={true}
              />
            </Link>
          </div>
          <RegisterForm />
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 border-l-2 border-[#201e1d] lg:block">
        <Image
          src="https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1920&auto=format&fit=crop"
          alt="Actualités"
          fill
          className="object-cover"
          style={{ filter: 'grayscale(1) contrast(1.08)' }}
          priority
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-[#201e1d]/75">
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <h2 className="mb-4 text-4xl font-extrabold">Rejoignez Actu Plus</h2>
            <p className="max-w-md text-center text-lg text-[#bab6b6]">
              Créez un compte pour accéder à toutes les fonctionnalités.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
