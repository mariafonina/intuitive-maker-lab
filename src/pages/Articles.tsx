import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { MainNavigation } from "@/components/MainNavigation";
import { usePageView } from "@/hooks/useAnalytics";
import { Article } from "@/types/article";
import { createExcerpt, formatDate, calculateReadingTime } from "@/lib/formatters";
import articleImage from "@/assets/article-lovable-services.png";
import { sanitizeArticleHtml } from "@/lib/sanitize";

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  usePageView(); // Трекинг просмотра страницы

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const { data, error } = await supabase
      .from("articles_public")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setArticles(data);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Статьи и гайды Мари Афониной | Вайбкодинг, Масштаб, ИИ</title>
        <meta name="description" content="Полезные статьи, гайды и инструкции от Мари Афониной (Мария Галантер). Вайбкодинг, курс Масштаб, применение искусственного интеллекта в бизнесе, запуски и продюсирование." />
        <meta name="keywords" content="Мари Афонина статьи, Мария Галантер, вайбкодинг гайд, обучение Мари Афониной, ЛАБС, Масштаб, статьи про ИИ" />
        <link rel="canonical" href="https://mariafonina.com/articles" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mariafonina.com/articles" />
        <meta property="og:title" content="Статьи и гайды Мари Афониной | Вайбкодинг, Масштаб" />
        <meta property="og:description" content="Полезные статьи и гайды от Мари Афониной: вайбкодинг, искусственный интеллект, запуски." />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Статьи Мари Афониной | Вайбкодинг" />
        <meta name="twitter:description" content="Гайды по вайбкодингу, ИИ и запускам от Мари Афониной." />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Статьи и гайды Мари Афониной (Мария Галантер)",
            "description": "Образовательные статьи, гайды и инструкции от Мари Афониной по вайбкодингу, искусственному интеллекту, запускам и продюсированию",
            "url": "https://mariafonina.com/articles",
            "author": {
              "@type": "Person",
              "name": "Мари Афонина",
              "alternateName": "Мария Галантер",
              "url": "https://mariafonina.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "ЛАБС",
              "founder": {
                "@type": "Person",
                "name": "Мари Афонина"
              }
            },
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": [
                {
                  "@type": "Article",
                  "position": 1,
                  "name": "Что такое вайбкодинг и с чем его едят",
                  "description": "Подробный гайд о вайбкодинге — новом способе создания приложений с помощью искусственного интеллекта",
                  "url": "https://mariafonina.com/articles/vibecoding-guide",
                  "author": {
                    "@type": "Person",
                    "name": "Мари Афонина",
                    "alternateName": "Мария Галантер"
                  }
                }
              ]
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Главная",
                "item": "https://mariafonina.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Статьи",
                "item": "https://mariafonina.com/articles"
              }
            ]
          })}
        </script>
      </Helmet>
      <ProgressBar topOffset="top-16" />
      <MainNavigation />
      
      <main className="pt-32 px-6 max-w-6xl mx-auto pb-24">
        <header className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Полезности
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Статьи, гайды, инструкции и все на свете — создано с любовью ❤️
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Специальная карточка для гайда по вайбкодингу */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-3xl bg-card overflow-hidden"
            onClick={() => navigate('/articles/vibecoding-guide')}
          >
            <div className="w-full h-48 overflow-hidden">
              <img 
                src={articleImage} 
                alt="Что такое вайбкодинг и с чем его едят"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </div>
            <CardHeader>
              <CardDescription className="text-primary font-semibold mb-2 text-sm uppercase tracking-wider">
                Гайд Мари Афониной
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                Что такое вайбкодинг и с чем его едят
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3 mb-6 text-lg leading-relaxed">
                Подробный гайд о вайбкодинге, новом способе создания приложений с помощью искусственного интеллекта.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>~9 мин. чтения</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Остальные статьи из базы данных */}
          {articles.map((article) => {
            const readingTime = calculateReadingTime(article.content);
            const excerpt = createExcerpt(article.content);
            const articleSlug = article.slug || article.id;
            
            return (
              <Card 
                key={article.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-3xl bg-card overflow-hidden"
                onClick={() => navigate(`/articles/${articleSlug}`)}
              >
                {article.og_image && (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={article.og_image} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                )}
                <CardHeader>
                  {article.subtitle && (
                    <CardDescription className="text-primary font-semibold mb-2 text-sm uppercase tracking-wider">
                      {article.subtitle}
                    </CardDescription>
                  )}
                  <CardTitle 
                    className="text-2xl line-clamp-2 font-bold"
                    dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.title) }}
                  />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-6 text-lg leading-relaxed">
                    {excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>~{readingTime} мин. чтения</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Articles;
