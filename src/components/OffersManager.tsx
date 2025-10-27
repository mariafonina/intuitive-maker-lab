import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OfferForm } from "./OfferForm";
import { Trash2, Edit, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Offer {
  id: string;
  title: string;
  description: string;
  price: string;
  sales_start_date: string;
  start_date: string;
  end_date: string;
}

export const OffersManager = () => {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | undefined>();

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
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить предложения",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить это предложение?")) return;

    try {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Предложение удалено",
      });

      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить предложение",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingOffer(undefined);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingOffer(undefined);
    fetchOffers();
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление предложениями</h2>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Новое предложение
        </Button>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Нет предложений</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{offer.title}</CardTitle>
                    <CardDescription className="mt-2">{offer.price}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(offer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(offer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                  {offer.description}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Старт продаж: {format(new Date(offer.sales_start_date), "d MMMM yyyy", { locale: ru })}
                  </div>
                  <div>
                    Период: {format(new Date(offer.start_date), "d MMMM yyyy", { locale: ru })} - {format(new Date(offer.end_date), "d MMMM yyyy", { locale: ru })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOffer ? "Редактировать предложение" : "Новое предложение"}
            </DialogTitle>
          </DialogHeader>
          <OfferForm offer={editingOffer} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};