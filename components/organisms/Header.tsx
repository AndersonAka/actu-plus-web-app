'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Button, Avatar } from '@/components/atoms';
import { SearchBar, NavLink } from '@/components/molecules';
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
  Sparkles,
} from 'lucide-react';

const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isVeilleur, isModerateur, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/proxy/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { href: '/', label: 'Accueil', icon: Home, exact: true },
    { href: '/articles', label: 'Articles', icon: Newspaper },
    { href: '/favorites', label: 'Favoris', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-actu-plus.webp"
              alt="Actu Plus"
              width={140}
              height={45}
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                exact={link.exact}
                className="text-sm flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Search + Actions Desktop */}
          <div className="hidden items-center gap-4 md:flex">
            <SearchBar
              placeholder="Rechercher..."
              size="sm"
              className="w-64"
            />

            {isLoading ? (
              <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-200" />
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100"
                >
                  <Avatar
                    src={user.avatar}
                    name={`${user.firstName || ''} ${user.lastName || ''}`}
                    size="sm"
                  />
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                      <div className="border-b border-gray-100 px-4 pb-2">
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Mon profil
                        </Link>
                      </div>

                      {isVeilleur() && (
                        <div className="border-t border-gray-100 py-1">
                          <Link
                            href="/veilleur"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <FileText className="h-4 w-4" />
                            Espace Veilleur
                          </Link>
                        </div>
                      )}

                      {isModerateur() && (
                        <div className="border-t border-gray-100 py-1">
                          <Link
                            href="/moderateur"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Espace Modérateur
                          </Link>
                        </div>
                      )}

                      {isAdmin() && (
                        <div className="border-t border-gray-100 py-1">
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Administration
                          </Link>
                        </div>
                      )}

                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  Connexion
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/register')}
                >
                  Inscription
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            <SearchBar
              placeholder="Rechercher..."
              size="sm"
              className="mb-3"
            />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && user ? (
              <>
                <div className="my-2 border-t border-gray-200" />
                <Link
                  href="/profile"
                  className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mon profil
                </Link>
                {isVeilleur() && (
                  <Link
                    href="/veilleur"
                    className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Espace Veilleur
                  </Link>
                )}
                {isModerateur() && (
                  <Link
                    href="/moderateur"
                    className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Espace Modérateur
                  </Link>
                )}
                {isAdmin() && (
                  <Link
                    href="/admin"
                    className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-error-600 hover:bg-error-50"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <div className="my-2 border-t border-gray-200" />
                <div className="flex gap-2 px-3 py-2">
                  <Button
                    variant="outline"
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
                    variant="primary"
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
