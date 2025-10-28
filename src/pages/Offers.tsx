import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { MainNavigation } from "@/components/MainNavigation";
import { usePageView } from "@/hooks/useAnalytics";
import { OfferCard } from "@/components/OfferCard";

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

const Offers = () => {
  usePageView();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from("offers")
          .select("*")
          .order("sales_start_date", { ascending: false });

        if (error) throw error;
        setOffers(data || []);
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Предложения от Мари Афониной | Курсы Масштаб, ЛАБС</title>
        <meta name="description" content="Актуальные предложения и курсы от Мари Афониной (Мария Галантер). Обучение вайбкодингу в ЛАБС, курс Масштаб по запускам и продюсированию, антикризисная книга для предпринимателей." />
        <meta name="keywords" content="курс Мари Афониной, Масштаб курс, ЛАБС вайбкодинг, обучение Мари Афониной, купить курс Масштаб, запуски Мари Афонина" />
        <link rel="canonical" href="https://mariafonina.com/offers" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mariafonina.com/offers" />
        <meta property="og:title" content="Предложения от Мари Афониной | Курсы и обучение" />
        <meta property="og:description" content="Курс Масштаб, ЛАБС, обучение вайбкодингу и запускам от Мари Афониной." />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Предложения Мари Афониной" />
        <meta name="twitter:description" content="Курсы и обучение от Мари Афониной." />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            "name": "Образовательные курсы и продукты от Мари Афониной (Мария Галантер)",
            "description": "Актуальные образовательные предложения: курс Масштаб по запускам и продюсированию, ЛАБС по вайбкодингу и искусственному интеллекту, антикризисная книга",
            "url": "https://mariafonina.com/offers",
            "provider": {
              "@type": "Person",
              "name": "Мари Афонина",
              "alternateName": "Мария Галантер",
              "url": "https://mariafonina.com",
              "description": "Создатель курса Масштаб, эксперт по вайбкодингу и запускам"
            },
            "itemListElement": [
              {
                "@type": "Course",
                "name": "ЛАБС — обучение вайбкодингу",
                "description": "Проект по обучению искусственному интеллекту и вайбкодингу от Мари Афониной. Научитесь создавать приложения с помощью ИИ.",
                "provider": {
                  "@type": "Person",
                  "name": "Мари Афонина"
                },
                "educationalLevel": "Начинающий и продвинутый",
                "teaches": ["Вайбкодинг", "Искусственный интеллект", "Создание приложений с ИИ"]
              },
              {
                "@type": "Course",
                "name": "Курс Масштаб",
                "description": "Образовательный курс по запускам и продюсированию инфопродуктов от Мари Афониной",
                "provider": {
                  "@type": "Person",
                  "name": "Мари Афонина",
                  "alternateName": "Мария Галантер"
                },
                "teaches": ["Запуски инфопродуктов", "Продюсирование", "Масштабирование бизнеса"]
              }
            ]
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
                "name": "Предложения",
                "item": "https://mariafonina.com/offers"
              }
            ]
          })}
        </script>
      </Helmet>
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">Загрузка...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Пока нет активных предложений
            </div>
          ) : (
            <div className="space-y-16">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Offers;