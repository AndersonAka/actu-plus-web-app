import { Archivo } from 'next/font/google';
import { Header, Footer } from '@/components/organisms';

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '500', '600', '800'] });

/**
 * Habillage Modernist commun à toutes les pages publiques : police Archivo,
 * fond clair, nouveaux Header/Footer. Ne pas utiliser dans l'espace staff
 * (admin/moderateur/veilleur), qui garde son propre DashboardLayout.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${archivo.className} flex min-h-screen flex-col bg-[#f3f2f2] text-[#201e1d]`}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
