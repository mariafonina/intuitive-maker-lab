import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { ProgressBar } from "@/components/ProgressBar";

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  created_at: string;
}

interface TocItem {
  id: string;
  text: string;
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

  const extractTableOfContents = (content: string): TocItem[] => {
    const div = document.createElement("div");
    div.innerHTML = content;
    const h2Elements = div.querySelectorAll("h2");
    
    return Array.from(h2Elements).map((h2, index) => {
      let id = h2.id || `heading-${index}`;
      // If h2 doesn't have an id, we'll add it later
      if (!h2.id) {
        h2.id = id;
      }
      return {
        id,
        text: h2.textContent || ""
      };
    });
  };

  const addIdsToH2Elements = (content: string, toc: TocItem[]): string => {
    const div = document.createElement("div");
    div.innerHTML = content;
    const h2Elements = div.querySelectorAll("h2");
    
    h2Elements.forEach((h2, index) => {
      if (!h2.id && toc[index]) {
        h2.id = toc[index].id;
        h2.classList.add("scroll-mt-20");
      }
    });
    
    return div.innerHTML;
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
              const toc = extractTableOfContents(article.content);
              const contentWithIds = addIdsToH2Elements(article.content, toc);
              
              return (
                <article key={article.id} className="max-w-4xl mx-auto">
                  {/* Header */}
                  <header className="text-center mb-12 sm:mb-16">
                    {article.subtitle && (
                      <p className="text-sm sm:text-base font-semibold text-primary mb-2 sm:mb-4">
                        {article.subtitle}
                      </p>
                    )}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
                      {article.title}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {readingTime > 0 && `Время на чтение: ~${readingTime} мин.`}
                    </p>
                  </header>

                  {/* Table of Contents */}
                  {toc.length > 0 && (
                    <div className="my-8 sm:my-12 p-4 sm:p-6 bg-muted/50 rounded-2xl">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Содержание</h3>
                      <ul className="space-y-2 text-left list-none">
                        {toc.map((item) => (
                          <li key={item.id}>
                            <a 
                              href={`#${item.id}`} 
                              className="text-sm text-primary hover:underline font-medium transition-colors"
                            >
                              {item.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Content */}
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: contentWithIds }}
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
