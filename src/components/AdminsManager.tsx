import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Mail } from "lucide-react";

interface Admin {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
}

export const AdminsManager = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      // Получаем список админов из user_roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, created_at")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      setAdmins((roles || []).map(role => ({
        ...role,
        email: role.user_id, // Показываем user_id вместо email
      })));
    } catch (error: any) {
      console.error("Error fetching admins:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список администраторов",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите email пользователя",
        variant: "destructive",
      });
      return;
    }

    setAddingAdmin(true);

    try {
      // Проверяем, не является ли пользователь уже админом
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", newAdminEmail.trim())
        .eq("role", "admin")
        .maybeSingle();

      if (existingRole) {
        toast({
          title: "Уже админ",
          description: "Этот пользователь уже является администратором",
          variant: "destructive",
        });
        return;
      }

      // Добавляем роль админа по user_id
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({
          user_id: newAdminEmail.trim(),
          role: "admin",
        });

      if (insertError) {
        if (insertError.code === "23503") {
          toast({
            title: "Пользователь не найден",
            description: "Пользователь с таким ID не существует. Он должен сначала зарегистрироваться на сайте через /auth",
            variant: "destructive",
          });
        } else {
          throw insertError;
        }
        return;
      }

      toast({
        title: "Успешно",
        description: "Новый администратор добавлен",
      });

      setNewAdminEmail("");
      fetchAdmins();
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось добавить администратора",
        variant: "destructive",
      });
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, userId: string) => {
    if (!confirm(`Удалить права администратора у пользователя ${userId}?`)) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", adminId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Права администратора удалены",
      });

      fetchAdmins();
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить администратора",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Администраторы</h2>

      <Card>
        <CardHeader>
          <CardTitle>Добавить администратора</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">User ID пользователя</Label>
              <Input
                id="admin-email"
                type="text"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                disabled={addingAdmin}
              />
              <p className="text-sm text-muted-foreground">
                Найдите User ID в таблице auth.users в Backend. Пользователь должен быть зарегистрирован через /auth
              </p>
            </div>
            <Button type="submit" disabled={addingAdmin}>
              {addingAdmin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Добавление...
                </>
              ) : (
                "Добавить администратора"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список администраторов ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <p className="text-muted-foreground">Нет администраторов</p>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-xs">{admin.user_id}</p>
                      <p className="text-sm text-muted-foreground">
                        Добавлен: {new Date(admin.created_at).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteAdmin(admin.id, admin.user_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};