import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import AdSense from '../components/AdSense';
import { getAllArticles } from '../services/articleService';

const HomePage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryFilter = searchParams.get('category');

  // Removed useMemo to ensure fresh data is pulled on every render/hot-update
  const allArticles = getAllArticles();
  
  const articles = categoryFilter 
    ? allArticles.filter(article => article.category === categoryFilter)
    : allArticles;
  const featuredArticle = articles[0];
  const secondaryArticles = articles.slice(1, 3);
  const remainingArticles = articles.slice(3);

  return (
    <Layout>
      {/* Featured Section */}
      <section className="mb-12 border-b border-gray-200 pb-12">
        {featuredArticle && <ArticleCard article={featuredArticle} featured={true} />}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column / Main Feed */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {secondaryArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <AdSense slot="feed-middle-56789" format="fluid" className="mb-12" />

          <h3 className="font-bold text-lg uppercase tracking-wider border-t-2 border-black pt-4 mb-6">Senaste nytt</h3>
          <div className="space-y-8">
            {remainingArticles.map((article) => (
              <div key={article.id} className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-100 last:border-0">
                 <div className="md:w-1/3">
                    <img src={article.imageUrl} className="w-full h-32 object-cover rounded-sm" alt={article.title} />
                 </div>
                 <div className="md:w-2/3">
                    <div className="text-xs font-bold text-blue-600 uppercase mb-1">{article.category}</div>
                    <a href={`#/${article.slug}`} className="block hover:text-blue-700">
                      <h4 className="text-xl font-serif font-bold mb-2">{article.title}</h4>
                    </a>
                    <p className="text-sm text-gray-600 font-serif leading-relaxed line-clamp-2">{article.excerpt}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
           {/* Sidebar Ad */}
           <div className="sticky top-24">
             <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
               <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Just nu</h4>
               <ol className="list-decimal pl-4 space-y-4 font-serif">
                 <li className="pl-2 hover:text-blue-600 cursor-pointer"><strong>Mat:</strong> Nya foodtrucks intar torget.</li>
                 <li className="pl-2 hover:text-blue-600 cursor-pointer"><strong>Natur:</strong> Bästa platserna för svampplockning.</li>
                 <li className="pl-2 hover:text-blue-600 cursor-pointer"><strong>Debatt:</strong> Ska vi ha bilfria zoner i centrum?</li>
                 <li className="pl-2 hover:text-blue-600 cursor-pointer"><strong>Bostad:</strong> Priserna planar ut i förorterna.</li>
               </ol>
             </div>
             
             <AdSense slot="sidebar-right-99887" format="rectangle" label="Sponsor" />
           </div>
        </aside>
      </div>
    </Layout>
  );
};

export default HomePage;