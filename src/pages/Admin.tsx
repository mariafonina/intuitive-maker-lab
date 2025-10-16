import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, LogOut } from "lucide-react";

interface Article {
  id: string;
  title: string;
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
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
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
          .update({ title, content, published })
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
    setContent(article.content);
    setPublished(article.published);
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
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Админ-панель</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingArticle ? "Редактировать статью" : "Создать статью"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Содержание</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={10}
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

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Статьи</h2>
            {articles.length === 0 ? (
              <p className="text-muted-foreground">Нет статей</p>
            ) : (
              articles.map((article) => (
                <Card key={article.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{article.title}</h3>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(article)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {article.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded ${
                          article.published
                            ? "bg-green-500/20 text-green-600"
                            : "bg-gray-500/20 text-gray-600"
                        }`}
                      >
                        {article.published ? "Опубликовано" : "Черновик"}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(article.created_at).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
