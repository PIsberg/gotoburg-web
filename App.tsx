import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import CategoryPage from './pages/CategoryPage';
import ExplorePage from './pages/ExplorePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ImageCreditsPage from './pages/ImageCreditsPage';
import EditorialTeamPage from './pages/EditorialTeamPage';
import AuthorPage from './pages/AuthorPage';
import NotFoundPage from './pages/NotFoundPage';
import AnalyticsTracker from './components/AnalyticsTracker';
import CookieConsent from './components/CookieConsent';

/**
 * Routes without a router around them, so the browser entry can wrap them in
 * BrowserRouter and the prerenderer in StaticRouter. Both must see the same tree
 * or a prerendered page would not match what the visitor gets.
 */
export const AppRoutes: React.FC = () => (
  <>
    <AnalyticsTracker />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/kategori/:categorySlug" element={<CategoryPage />} />
      <Route path="/om-oss" element={<AboutPage />} />
      <Route path="/redaktionen" element={<EditorialTeamPage />} />
      <Route path="/redaktionen/:authorSlug" element={<AuthorPage />} />
      <Route path="/kontakt" element={<ContactPage />} />
      <Route path="/integritetspolicy" element={<PrivacyPage />} />
      <Route path="/villkor" element={<TermsPage />} />
      <Route path="/bildkredit" element={<ImageCreditsPage />} />
      {/* Article slugs are the catch-all; ArticlePage renders NotFoundPage for
          a slug that does not resolve. */}
      <Route path="/:slug" element={<ArticlePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <CookieConsent />
  </>
);

/**
 * BrowserRouter, not HashRouter. Under HashRouter every article lived at
 * /#/slug, and Google discards the fragment, so the whole site was a single
 * crawlable URL with an empty <div id="root"> in it. scripts/prerender.mjs
 * writes a real HTML file per route so those URLs resolve without a server.
 */
const App: React.FC = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
