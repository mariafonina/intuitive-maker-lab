import { useEffect, useState } from "react";
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