import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Offer {
  id: string;
  title: string;
}

export const OffersList = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("id, title")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const copyShortcode = (offerId: string, compact: boolean = false) => {
    const shortcode = compact 
      ? `[offer id="${offerId}" compact]`
      : `[offer id="${offerId}"]`;
    
    navigator.clipboard.writeText(shortcode);
    setCopiedId(offerId);
    
    toast({
      title: "Скопировано",
      description: "Шорткод скопирован в буфер обмена",
    });

    setTimeout(() => setCopiedId(null), 2000);
  };

  if (offers.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          Нет доступных предложений
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Вставка предложений в статьи</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Скопируйте шорткод и вставьте его в содержание статьи, где хотите показать предложение:
        </p>
        
        <div className="space-y-3">
          {offers.map((offer) => (
            <div 
              key={offer.id} 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{offer.title}</p>
                <code className="text-xs text-muted-foreground">
                  [offer id="{offer.id}"]
                </code>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyShortcode(offer.id, false)}
                  className="shrink-0"
                >
                  {copiedId === offer.id ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-2">Полный</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyShortcode(offer.id, true)}
                  className="shrink-0"
                >
                  {copiedId === offer.id + "-compact" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-2">Компакт</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
          <p className="font-medium mb-2">Инструкция:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Скопируйте нужный шорткод</li>
            <li>Откройте редактор статьи</li>
            <li>Вставьте шорткод в нужное место контента</li>
            <li>Сохраните статью</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};