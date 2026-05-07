import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdSense from './AdSense';
import { ADSENSE_CONFIG } from '../src/constants';

interface LayoutProps {
  children: React.ReactNode;
}

export const NAV_CATEGORIES = ['Mat & Dryck', 'Natur', 'Arbete', 'Aktiviteter', 'Kultur', 'Sport', 'Vad är på gång', 'Event'];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dateStr = new Date().toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Top Bar */}
      <div className="bg-gray-900 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="capitalize text-gray-300">{dateStr}</span>
          <div className="flex items-center space-x-1 text-gray-400">
            <span className="hidden sm:inline px-3 py-0.5 hover:text-white cursor-pointer transition-colors">Prenumerera</span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="hidden sm:inline px-3 py-0.5 hover:text-white cursor-pointer transition-colors">Logga in</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white z-50 shadow-sm">
        {/* Masthead accent line */}
        <div className="h-1 bg-gray-900" />
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-gray-700 hover:text-black transition-colors p-1 -ml-1"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Meny"
            >
              {mobileMenuOpen
                ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>

            {/* Logo */}
            <Link to="/" className="mx-auto md:mx-0 flex items-baseline gap-3 md:gap-5">
              <h1 className="font-serif text-3xl md:text-5xl font-black tracking-tight text-gray-900 leading-none">
                GotoBurg
              </h1>
              <span className="hidden sm:block font-serif text-xs md:text-sm text-gray-400 italic leading-none">
                Det senaste från wetcoasten
              </span>
            </Link>

            {/* Search Icon */}
            <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex justify-center mt-5 gap-1 text-xs font-bold uppercase tracking-widest border-t border-gray-100 pt-4">
            <Link
              to="/explore"
              className="px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors duration-150"
            >
              Utforska Staden
            </Link>
            {NAV_CATEGORIES.map(item => (
              <Link
                key={item}
                to={`/?category=${item}`}
                className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-150"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t border-gray-100 mt-4 pt-4 pb-2 grid grid-cols-2 gap-1">
              <Link
                to="/explore"
                className="col-span-2 px-3 py-2.5 text-sm font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-50 rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Utforska Staden
              </Link>
              {NAV_CATEGORIES.map(item => (
                <Link
                  key={item}
                  to={`/?category=${item}`}
                  className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Top Banner Ad */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <AdSense slot={ADSENSE_CONFIG.HEADER_BANNER} className="hidden md:flex" />
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 pt-12 pb-8 mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand */}
            <div>
              <h3 className="font-serif font-black text-2xl text-white mb-3">GotoBurg</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Din lokala guide till det bästa Göteborg har att erbjuda. Nyheter, tips och inspiration för en levande vardag i Västsverige.
              </p>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-4 pb-2 border-b border-gray-800">Kategorier</h4>
              <ul className="space-y-2 text-sm columns-2">
                {NAV_CATEGORIES.map(cat => (
                  <li key={cat}>
                    <Link to={`/?category=${cat}`} className="text-gray-500 hover:text-white transition-colors">{cat}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Om oss */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-4 pb-2 border-b border-gray-800">Om oss</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:peter@gotoburg.se" className="text-gray-500 hover:text-white transition-colors">Kontakta oss</a></li>
                <li><a href="mailto:peter@gotoburg.se" className="text-gray-500 hover:text-white transition-colors">Annonsera</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
            <p>&copy; {currentYear} GotoBurg. Alla rättigheter förbehållna.</p>
            <div className="flex items-center gap-4">
              <span>Integritet</span>
              <span>Villkor</span>
              <a href="mailto:peter@gotoburg.se" className="hover:text-gray-400 transition-colors">Kontakt</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
