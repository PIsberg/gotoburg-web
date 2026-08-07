import React from 'react';
import Layout from './Layout';

interface StaticPageProps {
    title: string;
    intro?: string;
    updatedAt?: string;
    children: React.ReactNode;
}

/**
 * Shell for the non-article pages (om oss, kontakt, integritetspolicy, villkor).
 * Keeps the editorial typography of ArticlePage without the article metadata.
 */
const StaticPage: React.FC<StaticPageProps> = ({ title, intro, updatedAt, children }) => (
    <Layout>
        <article className="max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-4">
                {title}
            </h1>
            {intro && (
                <p className="font-serif text-lg text-gray-600 leading-relaxed mb-6">{intro}</p>
            )}
            {updatedAt && (
                <p className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-4 mb-8">
                    Senast uppdaterad {updatedAt}
                </p>
            )}
            <div className="prose-gotoburg text-gray-700 leading-relaxed space-y-4">
                {children}
            </div>
        </article>
    </Layout>
);

export const Section: React.FC<{ heading: string; children: React.ReactNode }> = ({ heading, children }) => (
    <section className="pt-6">
        <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">{heading}</h2>
        <div className="space-y-3">{children}</div>
    </section>
);

export default StaticPage;
