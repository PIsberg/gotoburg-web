import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import ExplorePage from './pages/ExplorePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AnalyticsTracker from './components/AnalyticsTracker';
import CookieConsent from './components/CookieConsent';
// import { ADSENSE_CONFIG } from './src/constants';

// Using HashRouter as permitted in instructions to simulate static page navigation
// without needing server-side URL rewriting configuration.
const App: React.FC = () => {
  // AdSense script is loaded in index.html for Auto Ads

  return (
    <HashRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        {/* Static pages are declared before the catch-all; react-router ranks
            literal segments above the :slug param, so they win regardless. */}
        <Route path="/om-oss" element={<AboutPage />} />
        <Route path="/kontakt" element={<ContactPage />} />
        <Route path="/integritetspolicy" element={<PrivacyPage />} />
        <Route path="/villkor" element={<TermsPage />} />
        {/* The :slug param captures the article identifier from the URL */}
        <Route path="/:slug" element={<ArticlePage />} />
      </Routes>
      <CookieConsent />
    </HashRouter>
  );
};

export default App;
