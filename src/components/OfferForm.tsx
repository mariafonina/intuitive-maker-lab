import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface OfferFormProps {
  offer?: {
    id: string;
    title: string;
    description: string;
    price: string;
    sales_start_date: string;
    sales_end_date: string;
    start_date: string;
    end_date: string;
    offer_url: string;
  };
  onSuccess: () => void;
}

export const OfferForm = ({ offer, onSuccess }: OfferFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(offer?.title || "");
  const [description, setDescription] = useState(offer?.description || "");
  const [price, setPrice] = useState(offer?.price || "");
  const [offerUrl, setOfferUrl] = useState(offer?.offer_url || "");
  const [salesStartDate, setSalesStartDate] = useState<Date | undefined>(
    offer?.sales_start_date ? new Date(offer.sales_start_date) : undefined
  );
  const [salesEndDate, setSalesEndDate] = useState<Date | undefined>(
    offer?.sales_end_date ? new Date(offer.sales_end_date) : undefined
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    offer?.start_date ? new Date(offer.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    offer?.end_date ? new Date(offer.end_date) : undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !price || !offerUrl || !salesStartDate || !salesEndDate || !startDate || !endDate) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const offerData = {
        title,
        description,
        price,
        offer_url: offerUrl,
        sales_start_date: salesStartDate.toISOString(),
        sales_end_date: salesEndDate.toISOString(),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      };

      if (offer) {
        const { error } = await supabase
          .from("offers")
          .update(offerData)
          .eq("id", offer.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("offers")
          .insert([offerData]);

        if (error) throw error;
      }

      toast({
        title: "Успешно",
        description: offer ? "Предложение обновлено" : "Предложение создано",
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving offer:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить предложение",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Название</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название предложения"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание предложения"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Стоимость</Label>
        <Input
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Например: 50 000 ₽"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="offer_url">Ссылка на предложение</Label>
        <Input
          id="offer_url"
          value={offerUrl}
          onChange={(e) => setOfferUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-2">
        <Label>Дата старта продаж</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !salesStartDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {salesStartDate ? format(salesStartDate, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={salesStartDate}
              onSelect={setSalesStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Дата закрытия продаж</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !salesEndDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {salesEndDate ? format(salesEndDate, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={salesEndDate}
              onSelect={setSalesEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Дата начала</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Дата окончания</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Сохранение..." : offer ? "Обновить" : "Создать"}
      </Button>
    </form>
  );
};