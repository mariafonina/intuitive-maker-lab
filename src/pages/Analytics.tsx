import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, MousePointer, Smartphone, Monitor, Tablet } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";

interface AnalyticsData {
  totalPageViews: number;
  totalClicks: number;
  conversionRate: number;
  deviceBreakdown: { device_type: string; count: number }[];
  topPages: { page_path: string; count: number }[];
  purchaseClicks: number;
}

const Analytics = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    totalPageViews: 0,
    totalClicks: 0,
    conversionRate: 0,
    deviceBreakdown: [],
    topPages: [],
    purchaseClicks: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
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
      await loadAnalytics();
    } catch (error) {
      console.error("Error checking admin:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Получаем общее количество просмотров
      const { count: viewsCount } = await supabase
        .from("page_views")
        .select("*", { count: 'exact', head: true });

      // Получаем общее количество кликов
      const { count: clicksCount } = await supabase
        .from("button_clicks")
        .select("*", { count: 'exact', head: true });

      // Получаем клики по кнопкам покупки
      const { count: purchaseCount } = await supabase
        .from("button_clicks")
        .select("*", { count: 'exact', head: true })
        .eq("button_type", "purchase");

      // Распределение по устройствам
      const { data: devices } = await supabase
        .from("page_views")
        .select("device_type")
        .order("device_type");

      const deviceBreakdown = devices?.reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.device_type === curr.device_type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ device_type: curr.device_type || 'unknown', count: 1 });
        }
        return acc;
      }, []) || [];

      // Топ страниц
      const { data: pages } = await supabase
        .from("page_views")
        .select("page_path")
        .order("created_at", { ascending: false });

      const pageCount = pages?.reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.page_path === curr.page_path);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ page_path: curr.page_path, count: 1 });
        }
        return acc;
      }, []).sort((a, b) => b.count - a.count).slice(0, 5) || [];

      const conversionRate = viewsCount ? ((purchaseCount || 0) / viewsCount) * 100 : 0;

      setData({
        totalPageViews: viewsCount || 0,
        totalClicks: clicksCount || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        deviceBreakdown,
        topPages: pageCount,
        purchaseClicks: purchaseCount || 0,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные аналитики",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen flex">
      <AdminSidebar currentSection="analytics" onSectionChange={() => navigate('/admin')} onLogout={async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      }} />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Аналитика</h1>

          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Просмотры страниц
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalPageViews}</div>
                <p className="text-xs text-muted-foreground">
                  Всего просмотров
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Клики
                </CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalClicks}</div>
                <p className="text-xs text-muted-foreground">
                  Всего кликов
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Клики на покупку
                </CardTitle>
                <MousePointer className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.purchaseClicks}</div>
                <p className="text-xs text-muted-foreground">
                  Кнопки продаж
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Конверсия
                </CardTitle>
                <span className="text-xl">📈</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Просмотры → Покупки
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Устройства и топ страниц */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Устройства</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.deviceBreakdown.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.device_type)}
                        <span className="capitalize">{device.device_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(device.count / data.totalPageViews) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {device.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Топ страниц</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1">{page.page_path || '/'}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(page.count / data.totalPageViews) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {page.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
