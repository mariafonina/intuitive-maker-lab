import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OfferCard } from "./OfferCard";

interface OfferShortcodeProps {
  offerId: string;
  compact?: boolean;
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

export const OfferShortcode = ({ offerId, compact = false }: OfferShortcodeProps) => {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const { data, error } = await supabase
          .from("offers")
          .select("*")
          .eq("id", offerId)
          .single();

        if (error) throw error;
        setOffer(data);
      } catch (error) {
        console.error("Error fetching offer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offerId]);

  if (loading) {
    return <div className="text-center py-8">Загрузка предложения...</div>;
  }

  if (!offer) {
    return (
      <div className="border border-dashed border-muted-foreground/30 p-6 rounded-lg text-center text-muted-foreground">
        Предложение не найдено
      </div>
    );
  }

  return <OfferCard offer={offer} compact={compact} />;
};