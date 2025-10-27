import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
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
    <div className="my-16 text-center animate-fade-in">
      {(mode === "open" || mode === "started") && (
        <p className="text-sm sm:text-base font-semibold text-primary mb-4 uppercase tracking-wider">
          СЕЙЧАС В ПРОДАЖЕ
        </p>
      )}

      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
        {offer.title}
      </h2>

      {!compact && offer.description && (
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          {offer.description}
        </p>
      )}

      <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
        Стоимость: {formatPrice(offer.price)}
      </div>
      <div className="text-base sm:text-lg text-muted-foreground mb-12">
        Пройдет: {format(new Date(offer.start_date), "d MMMM", { locale: ru })} - {format(new Date(offer.end_date), "d MMMM yyyy", { locale: ru })}
      </div>

        {mode === "presale" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-muted/50 p-8 rounded-2xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2">
                <Clock className="h-6 w-6" />
                Продажи откроются через:
              </h3>
              <div className="flex justify-center gap-6 mb-8">
                <div className="text-center">
                  <span className="block text-4xl md:text-5xl font-light tracking-wider text-foreground">
                    {timeLeft.days}
                  </span>
                  <span className="block text-xs text-muted-foreground uppercase tracking-widest mt-2">
                    дней
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-4xl md:text-5xl font-light tracking-wider text-foreground">
                    {timeLeft.hours}
                  </span>
                  <span className="block text-xs text-muted-foreground uppercase tracking-widest mt-2">
                    часов
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-4xl md:text-5xl font-light tracking-wider text-foreground">
                    {timeLeft.minutes}
                  </span>
                  <span className="block text-xs text-muted-foreground uppercase tracking-widest mt-2">
                    минут
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-4xl md:text-5xl font-light tracking-wider text-foreground">
                    {timeLeft.seconds}
                  </span>
                  <span className="block text-xs text-muted-foreground uppercase tracking-widest mt-2">
                    секунд
                  </span>
                </div>
              </div>
            </div>
            
            {!submitted ? (
              <form onSubmit={handlePreorder} className="space-y-4 max-w-md mx-auto">
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
                <div className="flex justify-center pt-4">
                  <Button type="submit" size="lg" variant="gradient" className="px-12">
                    Записаться в предзапись
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl max-w-md mx-auto">
                <p className="text-green-600 font-medium text-lg">
                  Спасибо! Мы свяжемся с вами, когда откроются продажи.
                </p>
              </div>
            )}
          </div>
        )}

        {mode === "open" && (
          <div className="animate-fade-in">
            <Button 
              onClick={handlePurchase} 
              size="lg" 
              variant="gradient"
              className="px-12 py-6 text-lg font-semibold transform hover:scale-105 transition-all duration-300"
            >
              Занять место
            </Button>
          </div>
        )}

        {mode === "started" && (
          <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl max-w-2xl mx-auto">
              <p className="text-primary font-medium text-lg">
                🎉 Мы только начали, вы ещё можете присоединиться!
              </p>
            </div>
            <div className="animate-fade-in">
              <Button 
                onClick={handlePurchase} 
                size="lg" 
                variant="gradient"
                className="px-12 py-6 text-lg font-semibold transform hover:scale-105 transition-all duration-300"
              >
                Занять место
              </Button>
            </div>
          </div>
        )}

        {mode === "soldout" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-muted p-8 rounded-2xl text-center space-y-3">
              <div className="text-4xl font-bold text-muted-foreground">SOLDOUT</div>
              <p className="text-base text-muted-foreground">
                Все места проданы, записаться в проект уже нельзя.
              </p>
              <p className="text-base">
                Но вы можете оставить свои данные, и мы свяжемся с вами, когда будет следующая продажа.
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handlePreorder} className="space-y-4 max-w-md mx-auto">
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
                <div className="flex justify-center pt-4">
                  <Button type="submit" size="lg" variant="secondary" className="px-12">
                    Записаться в предзапись
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl max-w-md mx-auto">
                <p className="text-green-600 font-medium text-lg">
                  Спасибо! Мы свяжемся с вами для следующей продажи.
                </p>
              </div>
            )}
          </div>
        )}
    </div>
  );
};