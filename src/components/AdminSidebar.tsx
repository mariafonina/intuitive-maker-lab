import { FileText, Plus, LogOut, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export const AdminSidebar = ({ currentSection, onSectionChange, onLogout }: AdminSidebarProps) => {
  const menuItems = [
    { id: "new-article", label: "Новая статья", icon: Plus },
    { id: "articles", label: "Статьи", icon: FileText },
    { id: "offers", label: "Предложения", icon: FileText },
    { id: "images", label: "Галерея изображений", icon: FileText },
    { id: "admins", label: "Администраторы", icon: Users },
    { id: "analytics", label: "Аналитика", icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-muted/30 min-h-screen flex flex-col">
      <div className="p-6">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-lg text-foreground hover:text-primary transition-colors"
        >
          @mariafonina
        </a>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          const isNewArticle = item.id === "new-article";
          
          return (
            <Button
              key={item.id}
              variant={isNewArticle ? "default" : (isActive ? "secondary" : "ghost")}
              className={`w-full justify-start ${isNewArticle ? "transition-all duration-200 hover:scale-105 hover:shadow-lg" : ""}`}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4">
        <Button variant="ghost" className="w-full" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  );
};
