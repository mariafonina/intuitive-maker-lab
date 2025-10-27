import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { MainNavigation } from "@/components/MainNavigation";
import { usePageView } from "@/hooks/useAnalytics";

interface Offer {
  id: string;
  title: string;
  description: string;
  price: string;
  sales_start_date: string;
  start_date: string;
  end_date: string;
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
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Предложения</h1>
          <p className="text-muted-foreground mb-8">
            Актуальные программы и проекты
          </p>

          {loading ? (
            <div className="text-center py-12">Загрузка...</div>
          ) : offers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Пока нет активных предложений
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {offers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-2xl">{offer.title}</CardTitle>
                    <CardDescription className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      {offer.price}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-foreground whitespace-pre-wrap">
                      {offer.description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Старт продаж: {format(new Date(offer.sales_start_date), "d MMMM yyyy", { locale: ru })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Период: {format(new Date(offer.start_date), "d MMMM yyyy", { locale: ru })} - {format(new Date(offer.end_date), "d MMMM yyyy", { locale: ru })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Offers;