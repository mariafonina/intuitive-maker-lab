import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { ProgressBar } from "@/components/ProgressBar";

interface Article {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setArticles(data);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const calculateReadingTime = (content: string) => {
    const div = document.createElement("div");
    div.innerHTML = content;
    const text = div.innerText;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const wordsPerMinute = 230;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ProgressBar />
      
      <main className="pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8">
        {articles.length === 0 ? (
          <p className="text-muted-foreground text-center">Статей пока нет</p>
        ) : (
          <div className="space-y-32">
            {articles.map((article) => {
              const readingTime = calculateReadingTime(article.content);
              
              return (
                <article key={article.id} className="max-w-4xl mx-auto">
                  {/* Header */}
                  <header className="text-center mb-12 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
                      {article.title}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {readingTime > 0 && `Время на чтение: ~${readingTime} мин.`}
                    </p>
                  </header>

                  {/* Content */}
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Articles;
