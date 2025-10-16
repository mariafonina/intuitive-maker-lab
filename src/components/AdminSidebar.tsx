import { FileText, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export const AdminSidebar = ({ currentSection, onSectionChange, onLogout }: AdminSidebarProps) => {
  const menuItems = [
    { id: "articles", label: "Статьи", icon: FileText },
    { id: "new-article", label: "Новая статья", icon: Plus },
  ];

  return (
    <div className="w-64 bg-muted/30 border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <a
          href="https://t.me/mari_zapuski"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-lg text-foreground hover:text-primary transition-colors"
        >
          @mari_zapuski
        </a>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  );
};
