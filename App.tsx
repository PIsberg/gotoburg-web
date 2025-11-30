import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import { ADSENSE_CONFIG } from './src/constants';

// Using HashRouter as permitted in instructions to simulate static page navigation 
// without needing server-side URL rewriting configuration.
const App: React.FC = () => {
  useEffect(() => {
    const scriptId = 'adsense-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.PUBLISHER_ID}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* The :slug param captures the article identifier from the URL */}
        <Route path="/:slug" element={<ArticlePage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;