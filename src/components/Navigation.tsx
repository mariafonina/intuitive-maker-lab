import { Button } from "@/components/ui/button";
import { trackButtonClick } from "@/hooks/useAnalytics";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-background/90 backdrop-blur-sm shadow-sm h-16 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <a
        href="/profile"
        className="font-semibold text-lg text-foreground hover:text-primary transition-colors"
      >
        @mari_zapuski
      </a>
      <Button 
        asChild
        className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] rounded-full font-semibold px-6 shadow-lg hover:shadow-xl hover:animate-gradient-shift transition-shadow duration-300"
        onClick={() => trackButtonClick('Научиться вайбкодить (навигация гайда)', 'purchase')}
      >
        <a
          href="https://zapusk-labs.mariafonina.ru/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Научиться<span className="hidden sm:inline"> вайбкодить</span>
        </a>
      </Button>
    </nav>
  );
};
