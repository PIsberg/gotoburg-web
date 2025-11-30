import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';

// Using HashRouter as permitted in instructions to simulate static page navigation 
// without needing server-side URL rewriting configuration.
const App: React.FC = () => {
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