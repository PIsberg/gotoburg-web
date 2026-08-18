import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { AppRoutes } from '../App';
import { getAllArticles } from '../services/articleService';
import { allRoutes } from '../src/seo';

/**
 * Server half of the prerender. scripts/prerender.mjs calls render() once per
 * route and writes the result into the built index.html shell, so every URL the
 * site publishes exists as a real HTML file with its text already in it.
 */
export const render = (url: string): string =>
  renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>
  );

export const routes = () => allRoutes(getAllArticles());
