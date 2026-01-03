import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { MainNavigation } from "@/components/MainNavigation";
import { ProgressBar } from "@/components/ProgressBar";
import { usePageView } from "@/hooks/useAnalytics";
import { renderContentWithShortcodes } from "@/utils/renderContent";
import { Article } from "@/types/article";
import { isUUID } from "@/lib/validators";
import { stripHtmlTags } from "@/lib/formatters";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { OfferCard } from "@/components/OfferCard";

interface TocItem {
  id: string;
  text: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  price: string;
  sales_start_date: string;
  sales_end_date: string;
  start_date: string;
  end_date: string;
  offer_url: string;
}

const ArticleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  
  usePageView(); // Трекинг просмотра страницы

  useEffect(() => {
    loadArticle();
    loadActiveOffer();
  }, [id]);

  const loadArticle = async () => {
    if (!id) return;

    // Пытаемся найти статью по slug или по id
    let query = supabase.from("articles_public").select("*");
    
    // Если id выглядит как UUID, ищем по id, иначе по slug
    if (isUUID(id)) {
      query = query.eq("id", id);
    } else {
      query = query.eq("slug", id);
    }

    const { data, error } = await query.single();

    if (!error && data) {
      setArticle(data);
    }

    setLoading(false);
  };

  const loadActiveOffer = async () => {
    // Загружаем актуальное предложение (ЛАБС)
    const { data } = await supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      setActiveOffer(data);
    }
  };

  // Функция для ожидания загрузки всех медиа элементов
  useEffect(() => {
    if (!article || loading) return;

    const waitForContent = async () => {
      // Небольшая задержка для рендера DOM
      await new Promise(resolve => setTimeout(resolve, 100));

      // Находим все iframe и изображения в контенте
      const iframes = document.querySelectorAll('article iframe');
      const images = document.querySelectorAll('article img');
      
      const promises: Promise<void>[] = [];

      // Ждем загрузки всех iframe
      iframes.forEach((iframe) => {
        promises.push(
          new Promise<void>((resolve) => {
            iframe.addEventListener('load', () => resolve(), { once: true });
            // Таймаут на случай если iframe не загрузится
            setTimeout(() => resolve(), 3000);
          })
        );
      });

      // Ждем загрузки всех изображений
      images.forEach((img) => {
        promises.push(
          new Promise<void>((resolve) => {
            if ((img as HTMLImageElement).complete) {
              resolve();
            } else {
              img.addEventListener('load', () => resolve());
              img.addEventListener('error', () => resolve());
              // Таймаут на случай если изображение не загрузится
              setTimeout(() => resolve(), 3000);
            }
          })
        );
      });

      // Если нет медиа элементов, показываем сразу
      if (promises.length === 0) {
        setContentReady(true);
        return;
      }

      // Ждем все элементы
      await Promise.all(promises);
      setContentReady(true);
    };

    waitForContent();
  }, [article, loading]);

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

  if (loading || !contentReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <ProgressBar topOffset="top-16" />
        <main className="pt-32 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">Статья не найдена</p>
        </main>
      </div>
    );
  }

  const readingTime = calculateReadingTime(article.content);
  const toc = extractTableOfContents(article.content);
  const contentWithIds = addIdsToH2Elements(article.content, toc);

  // Убираем HTML теги из заголовка для meta tags
  const cleanTitle = stripHtmlTags(article.title);

  return (
    <>
      <Helmet>
        <title>{cleanTitle} | Мария Афонина</title>
        <meta name="description" content={article.description || `Статья: ${cleanTitle}`} />
        
        {/* Robots meta tag for noindex */}
        {article.noindex && <meta name="robots" content="noindex, nofollow" />}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={cleanTitle} />
        <meta property="og:description" content={article.description || `Статья: ${cleanTitle}`} />
        {article.og_image && <meta property="og:image" content={article.og_image} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={cleanTitle} />
        <meta name="twitter:description" content={article.description || `Статья: ${cleanTitle}`} />
        {article.og_image && <meta name="twitter:image" content={article.og_image} />}
      </Helmet>

      <div className="min-h-screen bg-background">
        <MainNavigation />
        <ProgressBar topOffset="top-16" />
        
        <main className="pt-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <article>
            {/* Header */}
            <header className="text-center mb-12 sm:mb-16">
              {article.subtitle && (
                <p className="text-sm sm:text-base font-semibold text-primary mb-2 sm:mb-4">
                  {article.subtitle}
                </p>
              )}
              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6"
                dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.title) }}
              />
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
            <div className="max-w-none">
              {renderContentWithShortcodes(contentWithIds)}
            </div>

            {/* Offer Card for vibecoding-guide */}
            {(id === "vibecoding-guide" || article.slug === "vibecoding-guide") && activeOffer && (
              <div className="mt-16 pt-8 border-t border-border">
                <OfferCard offer={activeOffer} />
              </div>
            )}
            </article>
          </div>
        </main>
      </div>
    </>
  );
};

export default ArticleView;
