import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, Trash2, ExternalLink } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { TitleEditor } from "@/components/TitleEditor";
import { AdminSidebar } from "@/components/AdminSidebar";

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  published: boolean;
  created_at: string;
}

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [currentSection, setCurrentSection] = useState("articles");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoadArticles();
  }, []);

  const checkAdminAndLoadArticles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) {
        toast({
          title: "Доступ запрещён",
          description: "У вас нет прав администратора",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadArticles();
    } catch (error) {
      console.error("Error checking admin:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статьи",
        variant: "destructive",
      });
      return;
    }

    setArticles(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (editingArticle) {
        const { error } = await supabase
          .from("articles")
          .update({ title, subtitle, content, published })
          .eq("id", editingArticle.id);

        if (error) throw error;

        toast({
          title: "Успех",
          description: "Статья обновлена",
        });
      } else {
        const { error } = await supabase
          .from("articles")
          .insert({
            title,
            subtitle,
            content,
            published,
            author_id: session.user.id,
          });

        if (error) throw error;

        toast({
          title: "Успех",
          description: "Статья создана",
        });
      }

      resetForm();
      await loadArticles();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setSubtitle(article.subtitle || "");
    setContent(article.content);
    setPublished(article.published);
    setCurrentSection("new-article");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить эту статью?")) return;

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить статью",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Успех",
      description: "Статья удалена",
    });

    await loadArticles();
  };

  const resetForm = () => {
    setEditingArticle(null);
    setTitle("");
    setSubtitle("");
    setContent("");
    setPublished(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 p-8">
        {currentSection === "new-article" && (
          <div className="max-w-4xl">
            <Card className="border-none shadow-none">
              <CardHeader>
                <CardTitle>
                  {editingArticle ? "Редактировать статью" : "Создать статью"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Заголовок</Label>
                    <TitleEditor
                      content={title}
                      onChange={setTitle}
                      placeholder="Введите заголовок..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Подпись (например: "Гайд Мари Афониной")</Label>
                    <Input
                      id="subtitle"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Опционально"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Содержание</Label>
                    <RichTextEditor
                      content={content}
                      onChange={setContent}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={published}
                      onCheckedChange={setPublished}
                    />
                    <Label htmlFor="published">Опубликовать</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingArticle ? "Обновить" : "Создать"}
                    </Button>
                    {editingArticle && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Отмена
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {currentSection === "articles" && (
          <div className="max-w-4xl space-y-4">
            <h2 className="text-3xl font-bold mb-6">Все статьи</h2>
            {articles.length === 0 ? (
              <p className="text-muted-foreground">Нет статей</p>
            ) : (
              articles.map((article) => (
                <Card key={article.id} className="hover:bg-muted/50 transition-colors border-none shadow-none">
                  <CardContent className="py-4 px-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold text-lg mb-1"
                          dangerouslySetInnerHTML={{ __html: article.title }}
                        />
                        <p className="text-sm text-muted-foreground">
                          {new Date(article.created_at).toLocaleDateString("ru-RU")} • {article.published ? "Опубликовано" : "Черновик"}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {article.published && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => window.open(`/articles/${article.id}`, "_blank")}
                            title="Открыть на сайте"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(article)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
