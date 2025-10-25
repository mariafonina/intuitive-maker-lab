import { Button } from "@/components/ui/button";

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
        className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all duration-500 rounded-full font-semibold px-6 shadow-lg hover:shadow-xl"
      >
        <a
          href="https://labs.mashtab.io/?utm_source=gide&utm_medium=gide&utm_campaign=%D1%81%D1%82%D0%B0%D1%82%D1%8C%D1%8F"
          target="_blank"
          rel="noopener noreferrer"
        >
          Научиться<span className="hidden sm:inline"> вайбкодить</span>
        </a>
      </Button>
    </nav>
  );
};
