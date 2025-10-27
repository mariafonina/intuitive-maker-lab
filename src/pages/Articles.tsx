import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Clock, Eye } from "lucide-react";
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
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  
  usePageView(); // Трекинг просмотра страницы

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    // Загружаем статьи
    const { data, error } = await supabase
      .from("articles_public")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setArticles(data);
    }

    // Загружаем просмотры статей
    const { data: viewsData } = await supabase
      .from("page_views")
      .select("page_path");

    if (viewsData) {
      // Подсчитываем просмотры для каждой статьи
      const counts: Record<string, number> = {
        "vibecoding-guide": 0, // Для основного гайда
      };

      viewsData.forEach((view) => {
        const path = view.page_path;
        // Извлекаем slug из пути типа "/articles/slug"
        const match = path.match(/^\/articles\/([^/]+)$/);
        if (match) {
          const slug = match[1];
          counts[slug] = (counts[slug] || 0) + 1;
        }
        // Также считаем просмотры главной страницы как просмотры гайда
        if (path === "/" || path === "") {
          counts["vibecoding-guide"] = (counts["vibecoding-guide"] || 0) + 1;
        }
      });

      setViewCounts(counts);
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
                {viewCounts["vibecoding-guide"] > 0 && (
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    <span>{viewCounts["vibecoding-guide"]} просмотров</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Остальные статьи из базы данных */}
          {articles.map((article) => {
            const readingTime = calculateReadingTime(article.content);
            const excerpt = createExcerpt(article.content);
            const articleSlug = article.slug || article.id;
            const viewCount = viewCounts[articleSlug] || 0;
            
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
                    {viewCount > 0 && (
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-2" />
                        <span>{viewCount} просмотров</span>
                      </div>
                    )}
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
