'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: '홈', href: '/' },
  { name: 'AI 레시피 분석', href: '/analyze' },
  { name: '공장 매칭', href: '/factory' },
  { name: '수익 시뮬레이션', href: '/simulation' },
  { name: '성공사례', href: '/cases' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === '/';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || !isHome
            ? 'bg-white shadow-md'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white font-bold text-lg">
                요
              </div>
              <span
                className={`font-bold text-xl transition-colors ${
                  isScrolled || !isHome ? 'text-gray-900' : 'text-white'
                }`}
              >
                요리반상회
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-primary'
                      : isScrolled || !isHome
                      ? 'text-gray-600 hover:text-gray-900'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.name}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/consultation"
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  isScrolled || !isHome
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-white text-primary hover:bg-gray-100'
                }`}
              >
                무료 상담
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span
                  className={`block h-0.5 rounded transition-all ${
                    isMobileMenuOpen
                      ? 'rotate-45 translate-y-2 bg-gray-900'
                      : isScrolled || !isHome
                      ? 'bg-gray-900'
                      : 'bg-white'
                  }`}
                />
                <span
                  className={`block h-0.5 rounded transition-all ${
                    isMobileMenuOpen
                      ? 'opacity-0'
                      : isScrolled || !isHome
                      ? 'bg-gray-900'
                      : 'bg-white'
                  }`}
                />
                <span
                  className={`block h-0.5 rounded transition-all ${
                    isMobileMenuOpen
                      ? '-rotate-45 -translate-y-2 bg-gray-900'
                      : isScrolled || !isHome
                      ? 'bg-gray-900'
                      : 'bg-white'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 lg:hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-900"
                  >
                    ✕
                  </button>
                </div>
                <nav className="space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block py-3 px-4 rounded-xl font-medium transition-colors ${
                        pathname === item.href
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="mt-8 pt-8 border-t">
                  <Link
                    href="/consultation"
                    className="block w-full py-3 bg-primary text-white text-center rounded-xl font-medium hover:bg-primary-dark transition-all"
                  >
                    무료 상담 신청
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
