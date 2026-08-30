import React from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';

interface State {
  hasError: boolean;
}

/**
 * Last line of defence against a white screen.
 *
 * React unmounts the entire tree when a render or effect throws and nothing
 * catches it, leaving `<div id="root">` empty. That is not a hypothetical: on
 * 2026-08-28 production served /explore, the first link in the main nav, as a
 * blank white page because the Google Maps loader threw
 * `google.maps.Map is not a constructor` out of an effect. The prerendered HTML
 * was correct, so nothing that inspects only the served markup could see it,
 * which is why the SEO suite stayed green throughout.
 *
 * That loader is gone entirely; the map is Leaflet now, in
 * components/MapSection.tsx. This exists so
 * the next one costs a degraded panel instead of the whole site, which is the
 * difference between a page a reviewer can use and one they cannot.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <h1 className="font-serif text-3xl font-black text-gray-900 mb-4">
            Något gick fel
          </h1>
          <p className="font-serif text-gray-600 leading-relaxed mb-8">
            Sidan kunde inte visas. Felet är loggat. Under tiden når du allt innehåll
            från startsidan eller via kategorierna i menyn.
          </p>
          <Link
            to="/"
            className="inline-block bg-gray-900 text-white font-sans text-sm font-bold uppercase tracking-widest px-6 py-3 rounded hover:bg-gray-700 transition-colors"
          >
            Till startsidan
          </Link>
        </div>
      </Layout>
    );
  }
}

export default ErrorBoundary;
