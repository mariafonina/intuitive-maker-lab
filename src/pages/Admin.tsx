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
import { ImageUpload } from "@/components/ImageUpload";
import { OffersManager } from "@/components/OffersManager";
import { OffersList } from "@/components/OffersList";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminArticles, type Article } from "@/hooks/useAdminArticles";
import { ArticleImageUpload } from "@/components/ArticleImageUpload";
import { formatDate } from "@/lib/formatters";
import { TOAST_MESSAGES } from "@/lib/messages";

const Admin = () => {
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const { articles, isLoading: articlesLoading, createArticle, updateArticle, deleteArticle } = useAdminArticles();
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [currentSection, setCurrentSection] = useState("articles");
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Таймаут на загрузку админа
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAdminLoading) {
        setLoadingTimeout(true);
      }
    }, 10000); // 10 секунд

    return () => clearTimeout(timer);
  }, [isAdminLoading]);

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, isAdminLoading, navigate]);

  // Отслеживаем изменения auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (editingArticle) {
        await updateArticle.mutateAsync({
          id: editingArticle.id,
          title,
          subtitle,
          description,
          og_image: ogImage,
          slug: slug || undefined,
          content,
          published,
        });

        toast(TOAST_MESSAGES.SUCCESS.ARTICLE_UPDATED);
      } else {
        await createArticle.mutateAsync({
          title,
          subtitle,
          description,
          og_image: ogImage,
          slug: slug || undefined,
          content,
          published,
          author_id: session.user.id,
        });

        toast(TOAST_MESSAGES.SUCCESS.ARTICLE_CREATED);
      }

      resetForm();
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
    setDescription(article.description || "");
    setOgImage(article.og_image || "");
    setSlug(article.slug || "");
    setContent(article.content);
    setPublished(article.published);
    setCurrentSection("new-article");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить эту статью?")) return;

    try {
      await deleteArticle.mutateAsync(id);
      toast(TOAST_MESSAGES.SUCCESS.ARTICLE_DELETED);
    } catch (error) {
      toast(TOAST_MESSAGES.ERROR.ARTICLE_DELETE_FAILED);
    }
  };

  const resetForm = () => {
    setEditingArticle(null);
    setTitle("");
    setSubtitle("");
    setDescription("");
    setOgImage("");
    setSlug("");
    setContent("");
    setPublished(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        {loadingTimeout && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Загрузка занимает больше времени чем обычно...
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Обновить страницу
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        currentSection={currentSection}
        onSectionChange={(section) => {
          if (section === 'analytics') {
            navigate('/admin/analytics');
          } else {
            setCurrentSection(section);
          }
        }}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 p-8">
        {currentSection === "new-article" && (
          <div className="max-w-4xl space-y-6">
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
                    <Label htmlFor="description">Описание (для соцсетей и поисковиков)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Краткое описание статьи"
                    />
                  </div>
                  <ArticleImageUpload
                    value={ogImage}
                    onChange={setOgImage}
                    label="Изображение для соцсетей (можно загрузить GIF)"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (для URL: /articles/ваш-slug)</Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="moi-super-gaid"
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

            <OffersList />
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
                          {formatDate(article.created_at)} • {article.published ? "Опубликовано" : "Черновик"}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {article.published && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => window.open(`/articles/${article.slug || article.id}`, "_blank")}
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

        {currentSection === "offers" && (
          <div className="max-w-4xl">
            <OffersManager />
          </div>
        )}

        {currentSection === "images" && (
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">Галерея изображений</h2>
            <ImageUpload />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
