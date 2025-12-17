import React from 'react';
import Layout from '../components/Layout';
import GoogleMapSection from '../components/GoogleMapSection';
import { getAllArticles } from '../services/articleService';

const ExplorePage: React.FC = () => {
    const articles = getAllArticles();

    return (
        <Layout>
            <div className="mb-8">
                <h2 className="font-serif text-3xl font-bold mb-4">Utforska Staden</h2>
                <p className="text-gray-600 max-w-2xl mb-8">
                    Här kan du se var våra artiklar utspelar sig. Klicka på en markör för att läsa mer.
                </p>
                <GoogleMapSection articles={articles} />
            </div>
        </Layout>
    );
};

export default ExplorePage;
