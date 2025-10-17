import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    // 21 октября 2025 в 12:00 MSK = 09:00 UTC
    const countDownDate = new Date(Date.UTC(2025, 9, 21, 9, 0, 0)).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      if (distance < 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <div className="my-16 text-center animate-fade-in">
      {/* Заголовок */}
      <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
        <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
          Вайбкодинг
        </span>{" "}
        от Мари
      </h2>

      {/* Подзаголовок */}
      <p className="text-lg md:text-xl text-muted-foreground mb-12 animate-fade-in">
        Старт продаж нового проекта в честь 33-летия Мари
      </p>

      {/* Таймер */}
      {timeLeft.expired ? (
        <div className="text-4xl md:text-6xl font-light tracking-wider text-primary animate-scale-in">
          Продажи открыты!
        </div>
      ) : (
        <>
          <div className="flex justify-center gap-4 md:gap-8 mb-8 animate-fade-in">
            <div className="text-center">
              <span className="block text-5xl md:text-7xl font-light tracking-wider text-foreground">
                {formatNumber(timeLeft.days)}
              </span>
              <span className="block text-xs md:text-sm text-muted-foreground uppercase tracking-widest mt-2">
                дней
              </span>
            </div>
            <div className="text-center">
              <span className="block text-5xl md:text-7xl font-light tracking-wider text-foreground">
                {formatNumber(timeLeft.hours)}
              </span>
              <span className="block text-xs md:text-sm text-muted-foreground uppercase tracking-widest mt-2">
                часов
              </span>
            </div>
            <div className="text-center">
              <span className="block text-5xl md:text-7xl font-light tracking-wider text-foreground">
                {formatNumber(timeLeft.minutes)}
              </span>
              <span className="block text-xs md:text-sm text-muted-foreground uppercase tracking-widest mt-2">
                минут
              </span>
            </div>
            <div className="text-center">
              <span className="block text-5xl md:text-7xl font-light tracking-wider text-foreground">
                {formatNumber(timeLeft.seconds)}
              </span>
              <span className="block text-xs md:text-sm text-muted-foreground uppercase tracking-widest mt-2">
                секунд
              </span>
            </div>
          </div>

          {/* Дата */}
          <p className="text-lg md:text-xl text-foreground tracking-wide mb-12 animate-fade-in">
            21 октября в 12:00 по московскому времени
          </p>

          {/* Кнопка */}
          <div className="animate-fade-in">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 transform hover:scale-105 text-white font-semibold px-10 py-6 text-lg"
            >
              <a
                href="https://www.google.com/calendar/render?action=TEMPLATE&text=Старт%20продаж%3A%20Вайбкодинг%20от%20Мари&dates=20251021T090000Z/20251021T100000Z&details=Не%20пропустите%20старт%20продаж%20нового%20потока!&location=Онлайн"
                target="_blank"
                rel="noopener noreferrer"
              >
                Получить напоминание
              </a>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CountdownTimer;