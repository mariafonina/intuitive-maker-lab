import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { MainNavigation } from "@/components/MainNavigation";
import { usePageView } from "@/hooks/useAnalytics";

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  slug?: string;
  content: string;
  created_at: string;
}

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

  const calculateReadingTime = (content: string) => {
    const div = document.createElement("div");
    div.innerHTML = content;
    const text = div.innerText;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const wordsPerMinute = 230;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const getExcerpt = (content: string, maxLength = 150) => {
    const div = document.createElement("div");
    div.innerHTML = content;
    const text = div.innerText;
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
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
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-3xl bg-card border-2 border-primary/20"
            onClick={() => navigate('/articles/vibecoding-guide')}
          >
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
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>~9 мин. чтения</span>
              </div>
            </CardContent>
          </Card>

          {/* Остальные статьи из базы данных */}
          {articles.map((article) => {
            const readingTime = calculateReadingTime(article.content);
            const excerpt = getExcerpt(article.content);
            
            return (
              <Card 
                key={article.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-3xl bg-card"
                onClick={() => navigate(`/articles/${article.slug || article.id}`)}
              >
                <CardHeader>
                  {article.subtitle && (
                    <CardDescription className="text-primary font-semibold mb-2 text-sm uppercase tracking-wider">
                      {article.subtitle}
                    </CardDescription>
                  )}
                  <CardTitle 
                    className="text-2xl line-clamp-2 font-bold"
                    dangerouslySetInnerHTML={{ __html: article.title }}
                  />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-6 text-lg leading-relaxed">
                    {excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>~{readingTime} мин. чтения</span>
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
