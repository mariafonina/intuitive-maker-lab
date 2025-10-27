import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { trackButtonClick } from "@/hooks/useAnalytics";
import { formatPrice } from "@/lib/formatters";

interface OfferCardProps {
  offer: {
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
  compact?: boolean;
}

type OfferMode = "presale" | "open" | "started" | "soldout";

export const OfferCard = ({ offer, compact = false }: OfferCardProps) => {
  const [mode, setMode] = useState<OfferMode>("presale");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const calculateMode = () => {
      const now = new Date();
      const salesStart = new Date(offer.sales_start_date);
      const salesEnd = new Date(offer.sales_end_date);
      const projectStart = new Date(offer.start_date);

      if (now < salesStart) {
        setMode("presale");
        updateCountdown(salesStart);
      } else if (now >= salesStart && now < salesEnd) {
        if (now >= projectStart) {
          setMode("started");
        } else {
          setMode("open");
        }
      } else {
        setMode("soldout");
      }
    };

    const updateCountdown = (targetDate: Date) => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };

    calculateMode();
    const interval = setInterval(calculateMode, 1000);
    return () => clearInterval(interval);
  }, [offer]);

  const handlePreorder = async (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь можно добавить логику сохранения в БД
    setSubmitted(true);
    trackButtonClick(`Предзапись: ${offer.title}`, "contact");
  };

  const handlePurchase = () => {
    trackButtonClick(`Занять место: ${offer.title}`, "purchase");
    window.open(offer.offer_url, "_blank");
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl sm:text-3xl mb-2">{offer.title}</CardTitle>
        <CardDescription className="text-xl sm:text-2xl font-bold text-primary">
          {formatPrice(offer.price)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 space-y-6">
        {!compact && offer.description && (
          <p className="text-center text-muted-foreground">{offer.description}</p>
        )}

        {mode === "presale" && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                Продажи откроются через:
              </h3>
              <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                <div className="bg-background p-3 rounded">
                  <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
                  <div className="text-xs text-muted-foreground">дней</div>
                </div>
                <div className="bg-background p-3 rounded">
                  <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
                  <div className="text-xs text-muted-foreground">часов</div>
                </div>
                <div className="bg-background p-3 rounded">
                  <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
                  <div className="text-xs text-muted-foreground">минут</div>
                </div>
                <div className="bg-background p-3 rounded">
                  <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
                  <div className="text-xs text-muted-foreground">секунд</div>
                </div>
              </div>
            </div>
            
            {!submitted ? (
              <form onSubmit={handlePreorder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ваш@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 999-99-99"
                    required
                  />
                </div>
                <div className="flex justify-center">
                  <Button type="submit" size="lg" className="px-12">
                    Записаться в предзапись
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
                <p className="text-green-600 font-medium">
                  Спасибо! Мы свяжемся с вами, когда откроются продажи.
                </p>
              </div>
            )}
          </div>
        )}

        {mode === "open" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Button onClick={handlePurchase} size="lg" className="px-12">
                Занять место
              </Button>
              <div className="text-sm text-muted-foreground text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Старт: {format(new Date(offer.start_date), "d MMMM yyyy", { locale: ru })}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Окончание: {format(new Date(offer.end_date), "d MMMM yyyy", { locale: ru })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === "started" && (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <p className="text-primary font-medium text-center">
                🎉 Мы только начали, вы ещё можете присоединиться!
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Button onClick={handlePurchase} size="lg" className="px-12">
                Занять место
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Окончание: {format(new Date(offer.end_date), "d MMMM yyyy", { locale: ru })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === "soldout" && (
          <div className="space-y-4">
            <div className="bg-muted p-6 rounded-lg text-center space-y-2">
              <div className="text-3xl font-bold text-muted-foreground">SOLDOUT</div>
              <p className="text-sm text-muted-foreground">
                Все места проданы, записаться в проект уже нельзя.
              </p>
              <p className="text-sm">
                Но вы можете оставить свои данные, и мы свяжемся с вами, когда будет следующая продажа.
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handlePreorder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ваш@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 999-99-99"
                    required
                  />
                </div>
                <div className="flex justify-center">
                  <Button type="submit" size="lg" variant="secondary" className="px-12">
                    Записаться в предзапись
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
                <p className="text-green-600 font-medium">
                  Спасибо! Мы свяжемся с вами для следующей продажи.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};