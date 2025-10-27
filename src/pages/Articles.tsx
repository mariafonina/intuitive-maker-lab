import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  created_at: string;
}

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      <ProgressBar />
      
      {/* НАВИГАЦИЯ */}
      <header className="fixed top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-lg h-20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 h-full">
          <a href="/profile" className="text-lg font-bold">@mariafonina</a>
          
          <Button variant="ghost" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </nav>
      </header>
      
      <main className="pt-32 px-6 max-w-6xl mx-auto pb-24">
        <header className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Полезности
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Статьи, гайды, инструкции и все на свете — создано с любовью ❤️
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="text-muted-foreground text-center text-lg">Статей пока нет</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              const readingTime = calculateReadingTime(article.content);
              const excerpt = getExcerpt(article.content);
              
              return (
                <Card 
                  key={article.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-3xl bg-card"
                  onClick={() => navigate(`/articles/${article.id}`)}
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
        )}
      </main>
    </div>
  );
};

export default Articles;
