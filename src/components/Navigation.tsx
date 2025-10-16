export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-background/90 backdrop-blur-sm shadow-sm h-16 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-8">
        <a href="/" className="font-bold text-xl text-foreground">
          VibeCoding
        </a>
        <div className="hidden md:flex items-center gap-6">
          <a href="/" className="text-foreground hover:text-primary transition-colors">
            Главная
          </a>
          <a href="/articles" className="text-foreground hover:text-primary transition-colors">
            Статьи
          </a>
          <a href="#features" className="text-foreground hover:text-primary transition-colors">
            Возможности
          </a>
          <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
            Цены
          </a>
        </div>
      </div>
      <a
        href="/auth"
        className="text-foreground hover:text-primary transition-colors font-semibold"
      >
        Админ
      </a>
    </nav>
  );
};
