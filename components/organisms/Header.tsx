'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, Avatar } from '@/components/atoms';
import { SearchBar } from '@/components/molecules';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Heart,
  Archive,
  FileText,
  ChevronDown,
  Newspaper,
  Home,
  Crown,
} from 'lucide-react';
import { NotificationDropdown } from '@/components/molecules';

const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isVeilleur, isModerateur, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  // Charger l'abonnement actif
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/proxy/subscriptions/active', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data.hasActiveSubscription && data.subscription) {
            setSubscription(data.subscription);
          }
        }
      } catch (err) {
        // Silently fail
      }
    };
    fetchSubscription();
  }, [isAuthenticated, isLoading]);

  const hasActiveSubscription = subscription?.status === 'active';

  const handleLogout = async () => {
    try {
      await fetch('/api/proxy/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/articles', label: 'Articles', icon: Newspaper },
    { href: '/archives', label: 'Archives', icon: Archive },
    { href: '/favorites', label: 'Favoris', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#201e1d]/40 bg-[#f3f2f2]">
      <div className="mx-auto max-w-360 px-5 sm:px-9">
        <div className="flex h-18 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/images/logo-actu-plus.webp"
              alt="Actu Plus"
              width={140}
              height={45}
              priority
              className="h-10 w-auto"
              unoptimized={true}
            />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden items-stretch md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#201e1d] transition-colors hover:bg-[#eae9e9]"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search + Actions Desktop */}
          <div className="hidden items-center gap-3 md:flex">
            <SearchBar placeholder="Rechercher..." size="sm" className="w-56" />

            {isLoading ? (
              <div className="h-9.5 w-20 animate-pulse bg-[#eae9e9]" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <NotificationDropdown variant="header" />
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 border border-transparent p-1.5 hover:border-[#d7d3d3]"
                  >
                    <div className="relative">
                      <Avatar
                        src={user.avatar}
                        name={`${user.firstName || ''} ${user.lastName || ''}`}
                        size="sm"
                      />
                      {hasActiveSubscription && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-[#ec3013] ring-2 ring-[#f3f2f2]" title={subscription?.plan?.name || 'Abonné'}>
                          <Crown className="h-2.5 w-2.5 text-white" />
                        </span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-[#605d5d]" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-2 w-56 border border-[#201e1d]/40 bg-[#f3f2f2] py-2 shadow-[0_4px_16px_rgba(32,30,29,0.15)]">
                        <div className="border-b border-[#d7d3d3] px-4 pb-2">
                          <p className="font-semibold text-[#201e1d]">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-[#605d5d]">{user.email}</p>
                          {hasActiveSubscription && (
                            <span className="mt-1 inline-flex items-center gap-1 bg-[#ffe0d9] px-2 py-0.5 text-xs font-semibold text-[#ae1800]">
                              <Crown className="h-3 w-3" />
                              {subscription?.plan?.name || 'Abonné'}
                            </span>
                          )}
                        </div>

                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-[#201e1d] hover:bg-[#eae9e9]"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            Mon profil
                          </Link>
                        </div>

                        {isVeilleur() && (
                          <div className="border-t border-[#d7d3d3] py-1">
                            <Link
                              href="/veilleur"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-[#201e1d] hover:bg-[#eae9e9]"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <FileText className="h-4 w-4" />
                              Espace Veilleur
                            </Link>
                          </div>
                        )}

                        {isModerateur() && (
                          <div className="border-t border-[#d7d3d3] py-1">
                            <Link
                              href="/moderateur"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-[#201e1d] hover:bg-[#eae9e9]"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Settings className="h-4 w-4" />
                              Espace Modérateur
                            </Link>
                          </div>
                        )}

                        {isAdmin() && (
                          <div className="border-t border-[#d7d3d3] py-1">
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-[#201e1d] hover:bg-[#eae9e9]"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Settings className="h-4 w-4" />
                              Administration
                            </Link>
                          </div>
                        )}

                        <div className="border-t border-[#d7d3d3] py-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#ae1800] hover:bg-[#ffe0d9]"
                          >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="modernist-outline" size="sm" onClick={() => router.push('/login')}>
                  Connexion
                </Button>
                <Button variant="modernist" size="sm" onClick={() => router.push('/register')}>
                  Inscription
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="border border-transparent p-2 hover:border-[#d7d3d3] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-[#201e1d]" />
            ) : (
              <Menu className="h-6 w-6 text-[#201e1d]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t-2 border-[#201e1d]/40 bg-[#f3f2f2] md:hidden">
          <div className="space-y-1 px-4 py-3">
            <SearchBar placeholder="Rechercher..." size="sm" className="mb-3" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-[#201e1d] hover:bg-[#eae9e9]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && user ? (
              <>
                <div className="my-2 border-t border-[#d7d3d3]" />
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-[#201e1d] hover:bg-[#eae9e9]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mon profil
                  {hasActiveSubscription && (
                    <span className="inline-flex items-center gap-1 bg-[#ffe0d9] px-2 py-0.5 text-xs font-semibold text-[#ae1800]">
                      <Crown className="h-3 w-3" />
                      {subscription?.plan?.name || 'Abonné'}
                    </span>
                  )}
                </Link>
                {isVeilleur() && (
                  <Link
                    href="/veilleur"
                    className="block px-3 py-2 text-[#201e1d] hover:bg-[#eae9e9]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Espace Veilleur
                  </Link>
                )}
                {isModerateur() && (
                  <Link
                    href="/moderateur"
                    className="block px-3 py-2 text-[#201e1d] hover:bg-[#eae9e9]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Espace Modérateur
                  </Link>
                )}
                {isAdmin() && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-[#201e1d] hover:bg-[#eae9e9]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full px-3 py-2 text-left text-[#ae1800] hover:bg-[#ffe0d9]"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <div className="my-2 border-t border-[#d7d3d3]" />
                <div className="flex gap-2 px-3 py-2">
                  <Button
                    variant="modernist-outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      router.push('/login');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Connexion
                  </Button>
                  <Button
                    variant="modernist"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      router.push('/register');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Inscription
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export { Header };
