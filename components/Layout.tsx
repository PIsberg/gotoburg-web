import React from 'react';
import { Link } from 'react-router-dom';
import AdSense from './AdSense';
import { ADSENSE_CONFIG } from '../src/constants';



interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white text-xs py-2 px-4 text-center sm:text-left">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span>{new Date().toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <div className="hidden sm:flex space-x-4">
            <span className="cursor-pointer hover:text-gray-300">Prenumerera</span>
            <span className="cursor-pointer hover:text-gray-300">Logga in</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Icon (Placeholder) */}
            <button className="md:hidden text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            {/* Logo */}
            <Link to="/" className="mx-auto md:mx-0 flex items-baseline">
              <h1 className="font-serif text-3xl md:text-5xl font-black tracking-tight text-gray-900">
                GotoBurg
              </h1>
              <span className="ml-4 md:ml-6 font-serif text-xs md:text-sm text-gray-500 italic">
                Det senaste från wetcoasten
              </span>
            </Link>

            {/* Search Icon (Placeholder) */}
            <button className="hidden md:block text-gray-600 hover:text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex justify-center mt-6 space-x-8 text-sm font-bold uppercase tracking-widest text-gray-600 border-t border-gray-100 pt-4">
            <Link to="/explore" className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200">
              Utforska Staden
            </Link>
            {['Mat & Dryck', 'Natur', 'Arbete', 'Aktiviteter', 'Kultur', 'Sport', 'Vad är på gång', 'Event'].map((item) => (
              <Link key={item} to={`/?category=${item}`} className="hover:text-blue-600 cursor-pointer transition-colors duration-200">
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Top Banner Ad - Removed for Auto Ads */}
      <div className="max-w-6xl mx-auto px-4 w-full">
        <AdSense slot={ADSENSE_CONFIG.HEADER_BANNER} className="hidden md:flex" />
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <h3 className="font-serif font-bold text-lg mb-4">GotoBurg</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Din lokala guide till det bästa staden har att erbjuda. Nyheter, tips och inspiration för en levande vardag.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900 mb-4">Kategorier</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/?category=Mat & Dryck" className="hover:text-black cursor-pointer">Mat & Dryck</Link></li>
                <li><Link to="/?category=Natur" className="hover:text-black cursor-pointer">Natur</Link></li>
                <li><Link to="/?category=Aktiviteter" className="hover:text-black cursor-pointer">Aktiviteter</Link></li>
                <li><Link to="/?category=Kultur" className="hover:text-black cursor-pointer">Kultur</Link></li>
                <li><Link to="/?category=Sport" className="hover:text-black cursor-pointer">Sport</Link></li>
                <li><Link to="/?category=Vad är på gång" className="hover:text-black cursor-pointer">Vad är på gång</Link></li>
                <li><Link to="/?category=Event" className="hover:text-black cursor-pointer">Event</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900 mb-4">Om oss</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="mailto:peter@gotoburg.se" className="hover:text-black cursor-pointer">Kontakta oss</a></li>
              </ul>
            </div>


          </div>

          <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; {currentYear} GotoBurg. Alla rättigheter förbehållna.</p>
            <div className="mt-4 md:mt-0 space-x-4">
              <span>Integritet</span>
              <span>Villkor</span>
              <span>Webbplatskarta</span>
              <a href="mailto:peter@gotoburg.se" className="hover:text-gray-800 transition-colors">Kontakt</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;