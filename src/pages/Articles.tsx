import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Статьи</h1>
        
        {articles.length === 0 ? (
          <p className="text-muted-foreground">Статей пока нет</p>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(article.created_at).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-gray dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
