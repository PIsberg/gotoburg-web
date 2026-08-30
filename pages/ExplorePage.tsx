import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MapSection, { mappedArticles } from '../components/MapSection';
import { getAllArticles } from '../services/articleService';
import { formatDate } from '../src/utils/dateUtils';
import { getCategoryText } from '../src/utils/categoryColors';

/**
 * The map is an enhancement, not the page. It draws nothing for a crawler, and
 * under Google Maps it drew nothing for visitors either: the Cloud project had
 * no billing, so the API answered BillingNotEnabledMapError and /explore, the
 * first item in the nav, sat at 97 words of prerendered content on a site whose
 * AdSense rejection was about thin content. The map is Leaflet + OpenStreetMap
 * now, which needs no key and no billing, but the shape of the page stays:
 *
 * the places are rendered as real markup, from the same parsed coordinates
 * the markers use. The map layers on top when it works.
 */
const ExplorePage: React.FC = () => {
    const articles = getAllArticles();
    const places = mappedArticles(articles);

    return (
        <Layout>
            <div className="mb-8">
                <h2 className="font-serif text-3xl font-bold mb-4">Utforska Staden</h2>
                <p className="text-gray-600 max-w-2xl mb-8">
                    Här kan du se var våra artiklar utspelar sig. Klicka på en markör för att läsa mer,
                    eller bläddra i listan under kartan.
                </p>
                <MapSection articles={articles} />

                <section>
                    <h3 className="font-serif text-2xl font-bold mb-2">
                        Platser vi har skrivit om
                    </h3>
                    <p className="text-gray-600 max-w-2xl mb-6">
                        {places.length} platser i och runt Göteborg, från Masthugget och Linnégatan till
                        Hisings Backa och Marks kommun. Varje plats leder till artikeln om den.
                    </p>

                    <ul className="space-y-6">
                        {places.map(article => (
                            <li key={article.id} className="border-b border-gray-100 pb-5 last:border-0">
                                <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${getCategoryText(article.category)}`}>
                                    {article.category} · {formatDate(article.publishedAt)}
                                </span>
                                <Link
                                    to={`/${article.slug}`}
                                    className="font-serif font-bold text-lg leading-snug hover:text-blue-700 transition-colors"
                                >
                                    {article.title}
                                </Link>
                                <p className="text-sm text-gray-600 font-serif mt-1">{article.excerpt}</p>
                                <a
                                    href={article.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block text-sm text-blue-600 hover:underline mt-2"
                                >
                                    Visa på Google Maps
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </Layout>
    );
};

export default ExplorePage;
