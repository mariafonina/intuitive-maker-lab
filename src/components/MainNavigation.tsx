import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

export const MainNavigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Блокировка скролла при открытом меню
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Закрываем меню при смене маршрута
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isProfilePage = location.pathname === '/profile' || location.pathname === '/';

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-lg h-20">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 h-full">
        <a href="/profile" className="text-lg font-bold">@mariafonina</a>

        {/* Десктоп навигация */}
        <div className="hidden items-center space-x-8 md:flex">
          <a href="/profile#projects" className="text-muted-foreground hover:text-primary transition-colors">Проекты</a>
          <a href="/articles" className="text-muted-foreground hover:text-primary transition-colors">Полезности</a>
          <a href="/profile#contacts" className="text-muted-foreground hover:text-primary transition-colors">Контакты</a>
          <Button asChild variant="gradient" size="sm">
            <a href="https://labs.mashtab.io?utm_source=main_site_mari" target="_blank" rel="noopener noreferrer">Научиться вайбкодить</a>
          </Button>
        </div>

        {/* Мобильное меню кнопка */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="z-50 block md:hidden"
        >
          {!mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </nav>

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="fixed top-0 left-0 h-screen w-full flex flex-col items-center justify-center space-y-8 bg-background text-2xl font-medium md:hidden">
          <a href="/profile#projects" className="text-foreground">Проекты</a>
          <a href="/articles" className="text-foreground">Полезности</a>
          <a href="/profile#contacts" className="text-foreground">Контакты</a>
          <Button asChild variant="gradient">
            <a href="https://labs.mashtab.io?utm_source=main_site_mari" target="_blank" rel="noopener noreferrer">Научиться вайбкодить</a>
          </Button>
        </div>
      )}
    </header>
  );
};
