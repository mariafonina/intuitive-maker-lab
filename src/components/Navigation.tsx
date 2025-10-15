interface NavigationProps {
  onOpenModal: () => void;
}

export const Navigation = ({ onOpenModal }: NavigationProps) => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-background/90 backdrop-blur-sm shadow-sm h-16 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <a
        href="https://www.instagram.com/mariafonina/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-foreground hover:text-primary transition-colors"
      >
        @mariafonina
      </a>
      <button
        onClick={onOpenModal}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-5 rounded-full transition-all text-sm shadow-lg hover:shadow-xl"
      >
        В предзапись
      </button>
    </nav>
  );
};
