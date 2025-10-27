import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, MousePointer, Smartphone, Monitor, Tablet } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";

interface PageConversion {
  page_path: string;
  views: number;
  clicks: number;
  purchaseClicks: number;
  conversionRate: number;
}

interface FunnelStep {
  event_name: string;
  count: number;
  dropoff_rate: number;
}

interface AnalyticsData {
  totalPageViews: number;
  uniqueSessions: number;
  totalClicks: number;
  conversionRate: number;
  avgScrollDepth: number;
  avgTimeOnPage: number;
  bounceRate: number;
  returningVisitorRate: number;
  deviceBreakdown: { device_type: string; count: number }[];
  topPages: { page_path: string; count: number; uniqueSessions: number }[];
  landingPages: { page_path: string; count: number }[];
  exitPages: { page_path: string; count: number }[];
  purchaseClicks: number;
  pageConversions: PageConversion[];
  utmSources: { utm_source: string; count: number }[];
  funnelSteps: FunnelStep[];
}

const Analytics = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [data, setData] = useState<AnalyticsData>({
    totalPageViews: 0,
    uniqueSessions: 0,
    totalClicks: 0,
    conversionRate: 0,
    avgScrollDepth: 0,
    avgTimeOnPage: 0,
    bounceRate: 0,
    returningVisitorRate: 0,
    deviceBreakdown: [],
    topPages: [],
    landingPages: [],
    exitPages: [],
    purchaseClicks: 0,
    pageConversions: [],
    utmSources: [],
    funnelSteps: [],
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadAnalytics();
    }
  }, [dateFilter]);

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
      // Определяем дату начала фильтра
      const getStartDate = () => {
        const now = new Date();
        switch (dateFilter) {
          case 'today':
            now.setHours(0, 0, 0, 0);
            return now.toISOString();
          case 'week':
            now.setDate(now.getDate() - 7);
            return now.toISOString();
          case 'month':
            now.setDate(now.getDate() - 30);
            return now.toISOString();
          case 'all':
          default:
            return null;
        }
      };

      const startDate = getStartDate();
      
      // Создаем базовый query builder для page_views
      let viewsQuery = supabase.from("page_views").select("*", { count: 'exact', head: true });
      if (startDate) {
        viewsQuery = viewsQuery.gte("created_at", startDate);
      }
      const { count: viewsCount } = await viewsQuery;

      // Получаем количество уникальных сессий
      let uniqueSessionsQuery = supabase
        .from("page_views")
        .select("session_id");
      if (startDate) {
        uniqueSessionsQuery = uniqueSessionsQuery.gte("created_at", startDate);
      }
      const { data: sessionsData } = await uniqueSessionsQuery;
      const uniqueSessions = new Set(sessionsData?.map(s => s.session_id).filter(Boolean)).size;

      // Создаем базовый query builder для button_clicks
      let clicksQuery = supabase.from("button_clicks").select("*", { count: 'exact', head: true });
      if (startDate) {
        clicksQuery = clicksQuery.gte("created_at", startDate);
      }
      const { count: clicksCount } = await clicksQuery;

      // Получаем клики по кнопкам покупки
      let purchaseQuery = supabase
        .from("button_clicks")
        .select("*", { count: 'exact', head: true })
        .eq("button_type", "purchase");
      if (startDate) {
        purchaseQuery = purchaseQuery.gte("created_at", startDate);
      }
      const { count: purchaseCount } = await purchaseQuery;

      // Распределение по устройствам
      let devicesQuery = supabase.from("page_views").select("device_type").order("device_type");
      if (startDate) {
        devicesQuery = devicesQuery.gte("created_at", startDate);
      }
      const { data: devices } = await devicesQuery;

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
      let pagesQuery = supabase.from("page_views").select("page_path").order("created_at", { ascending: false });
      if (startDate) {
        pagesQuery = pagesQuery.gte("created_at", startDate);
      }
      const { data: pages } = await pagesQuery;

      const pageCount = pages?.reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.page_path === curr.page_path);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ page_path: curr.page_path, count: 1 });
        }
        return acc;
      }, []).sort((a, b) => b.count - a.count).slice(0, 5) || [];

      // Конверсия по страницам (исключаем админские)
      let allViewsQuery = supabase
        .from("page_views")
        .select("page_path, session_id")
        .not("page_path", "like", "%/admin%")
        .not("page_path", "like", "%/auth%");
      if (startDate) {
        allViewsQuery = allViewsQuery.gte("created_at", startDate);
      }
      const { data: allViews } = await allViewsQuery;

      let allClicksQuery = supabase
        .from("button_clicks")
        .select("page_path, button_type, session_id")
        .not("page_path", "like", "%/admin%")
        .not("page_path", "like", "%/auth%");
      if (startDate) {
        allClicksQuery = allClicksQuery.gte("created_at", startDate);
      }
      const { data: allClicks } = await allClicksQuery;

      // Группируем УНИКАЛЬНЫЕ СЕССИИ по страницам
      const uniqueSessionsByPage = (allViews || []).reduce((acc: Record<string, Set<string>>, curr) => {
        const path = curr.page_path || '/';
        if (!acc[path]) {
          acc[path] = new Set();
        }
        if (curr.session_id) {
          acc[path].add(curr.session_id);
        }
        return acc;
      }, {});

      // Группируем клики и уникальные сессии с покупками по страницам
      const clicksByPage = (allClicks || []).reduce((acc: Record<string, { 
        total: number; 
        purchase: number;
        purchaseSessions: Set<string>;
      }>, curr) => {
        const path = curr.page_path || '/';
        if (!acc[path]) {
          acc[path] = { total: 0, purchase: 0, purchaseSessions: new Set() };
        }
        acc[path].total++;
        if (curr.button_type === 'purchase') {
          acc[path].purchase++;
          if (curr.session_id) {
            acc[path].purchaseSessions.add(curr.session_id);
          }
        }
        return acc;
      }, {});

      // Создаем массив конверсий по страницам
      // Конверсия = % уникальных сессий, которые сделали покупку
      const pageConversions: PageConversion[] = Object.keys(uniqueSessionsByPage)
        .map(path => {
          const uniqueSessionsCount = uniqueSessionsByPage[path].size;
          const clicks = clicksByPage[path]?.total || 0;
          const purchaseClicks = clicksByPage[path]?.purchase || 0;
          const uniquePurchaseSessions = clicksByPage[path]?.purchaseSessions.size || 0;
          
          // Правильная конверсия: % уникальных сессий, которые совершили покупку
          const conversionRate = uniqueSessionsCount > 0 
            ? (uniquePurchaseSessions / uniqueSessionsCount) * 100 
            : 0;

          return {
            page_path: path,
            views: uniqueSessionsCount,
            clicks,
            purchaseClicks,
            conversionRate: Math.round(conversionRate * 100) / 100,
          };
        })
        .sort((a, b) => b.views - a.views);

      // UTM sources анализ
      let utmQuery = supabase
        .from("page_views")
        .select("utm_source")
        .not("utm_source", "is", null);
      if (startDate) {
        utmQuery = utmQuery.gte("created_at", startDate);
      }
      const { data: utmData } = await utmQuery;

      const utmSources = utmData?.reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.utm_source === curr.utm_source);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ utm_source: curr.utm_source || 'direct', count: 1 });
        }
        return acc;
      }, []).sort((a, b) => b.count - a.count) || [];

      // Получаем уникальные сессии, которые совершили покупку
      let purchaseSessionsQuery = supabase
        .from("button_clicks")
        .select("session_id")
        .eq("button_type", "purchase");
      if (startDate) {
        purchaseSessionsQuery = purchaseSessionsQuery.gte("created_at", startDate);
      }
      const { data: purchaseSessionsData } = await purchaseSessionsQuery;
      const uniquePurchaseSessions = new Set(
        purchaseSessionsData?.map(s => s.session_id).filter(Boolean)
      ).size;

      // Правильная конверсия: % уникальных сессий, которые совершили покупку
      const conversionRate = uniqueSessions > 0 
        ? (uniquePurchaseSessions / uniqueSessions) * 100 
        : 0;

      // Средняя глубина прокрутки и время на странице
      let engagementQuery = supabase.from("page_views").select("scroll_depth, time_on_page");
      if (startDate) {
        engagementQuery = engagementQuery.gte("created_at", startDate);
      }
      const { data: engagementData } = await engagementQuery;

      const avgScrollDepth = engagementData && engagementData.length > 0
        ? Math.round(engagementData.reduce((sum, row) => sum + (row.scroll_depth || 0), 0) / engagementData.length)
        : 0;

      const avgTimeOnPage = engagementData && engagementData.length > 0
        ? Math.round(engagementData.reduce((sum, row) => sum + (row.time_on_page || 0), 0) / engagementData.length)
        : 0;

      // Bounce Rate - процент посетителей, которые ушли после одной страницы
      let bounceQuery = supabase
        .from("page_views")
        .select("*", { count: 'exact', head: true })
        .eq("is_bounce", true);
      if (startDate) {
        bounceQuery = bounceQuery.gte("created_at", startDate);
      }
      const { count: bounceCount } = await bounceQuery;
      const bounceRate = viewsCount && viewsCount > 0 ? ((bounceCount || 0) / viewsCount) * 100 : 0;

      // Returning Visitors Rate
      let returningQuery = supabase
        .from("page_views")
        .select("*", { count: 'exact', head: true })
        .eq("is_returning", true);
      if (startDate) {
        returningQuery = returningQuery.gte("created_at", startDate);
      }
      const { count: returningCount } = await returningQuery;
      const returningVisitorRate = viewsCount && viewsCount > 0 ? ((returningCount || 0) / viewsCount) * 100 : 0;

      // Landing Pages - первые страницы в сессиях (pages_in_session = 1)
      let landingQuery = supabase
        .from("page_views")
        .select("page_path")
        .eq("pages_in_session", 1);
      if (startDate) {
        landingQuery = landingQuery.gte("created_at", startDate);
      }
      const { data: landingData } = await landingQuery;

      const landingPages = landingData?.reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.page_path === curr.page_path);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ page_path: curr.page_path, count: 1 });
        }
        return acc;
      }, []).sort((a, b) => b.count - a.count).slice(0, 10) || [];

      // Exit Pages - последние страницы (те, после которых is_bounce или макс pages_in_session в сессии)
      let exitQuery = supabase
        .from("page_views")
        .select("page_path, is_bounce");
      if (startDate) {
        exitQuery = exitQuery.gte("created_at", startDate);
      }
      const { data: exitData } = await exitQuery;

      const exitPages = exitData?.filter(view => view.is_bounce)
        .reduce((acc: any[], curr) => {
          const existing = acc.find(item => item.page_path === curr.page_path);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ page_path: curr.page_path, count: 1 });
          }
          return acc;
        }, []).sort((a, b) => b.count - a.count).slice(0, 10) || [];

      // Funnel Steps - анализ воронки из funnel_events
      let funnelQuery = supabase.from("funnel_events").select("event_name");
      if (startDate) {
        funnelQuery = funnelQuery.gte("created_at", startDate);
      }
      const { data: funnelData } = await funnelQuery;

      const eventCounts = funnelData?.reduce((acc: Record<string, number>, curr) => {
        acc[curr.event_name] = (acc[curr.event_name] || 0) + 1;
        return acc;
      }, {}) || {};

      const totalFunnelEvents = Object.values(eventCounts).reduce((sum: number, count) => sum + (count as number), 0);
      const funnelSteps: FunnelStep[] = Object.entries(eventCounts)
        .map(([event_name, count]) => ({
          event_name,
          count: count as number,
          dropoff_rate: totalFunnelEvents > 0 ? Math.round(((totalFunnelEvents - (count as number)) / totalFunnelEvents) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      setData({
        totalPageViews: viewsCount || 0,
        uniqueSessions: uniqueSessions,
        totalClicks: clicksCount || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgScrollDepth,
        avgTimeOnPage,
        bounceRate: Math.round(bounceRate * 100) / 100,
        returningVisitorRate: Math.round(returningVisitorRate * 100) / 100,
        deviceBreakdown,
        topPages: pageCount,
        landingPages,
        exitPages,
        purchaseClicks: purchaseCount || 0,
        pageConversions,
        utmSources,
        funnelSteps,
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Аналитика</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setDateFilter('today')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateFilter === 'today' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Сегодня
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateFilter === 'week' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                7 дней
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateFilter === 'month' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                30 дней
              </button>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateFilter === 'all' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Всё время
              </button>
            </div>
          </div>

          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Уникальные посетители
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.uniqueSessions}</div>
                <p className="text-xs text-muted-foreground">
                  Уникальных сессий
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всего просмотров
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalPageViews}</div>
                <p className="text-xs text-muted-foreground">
                  Включая повторные
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
                  % посетителей → покупка
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Средняя прокрутка
                </CardTitle>
                <span className="text-xl">📜</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.avgScrollDepth}%</div>
                <p className="text-xs text-muted-foreground">
                  глубина чтения
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Среднее время
                </CardTitle>
                <span className="text-xl">⏱️</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(data.avgTimeOnPage / 60)}:{String(data.avgTimeOnPage % 60).padStart(2, '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  время на странице
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Отказы
                </CardTitle>
                <span className="text-xl">🚪</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.bounceRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  ушли с первой страницы
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Возвращаются
                </CardTitle>
                <span className="text-xl">🔄</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.returningVisitorRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  уже были на сайте
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Landing и Exit Pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Landing Pages (Входные)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.landingPages.length > 0 ? (
                    data.landingPages.map((page, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="text-sm">{page.page_path}</span>
                        <span className="text-sm font-semibold">{page.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Нет данных</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exit Pages (Выходные)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.exitPages.length > 0 ? (
                    data.exitPages.map((page, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="text-sm">{page.page_path}</span>
                        <span className="text-sm font-semibold">{page.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Нет данных</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Воронка конверсии */}
          {data.funnelSteps.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Воронка конверсии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.funnelSteps.map((step, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{step.event_name}</span>
                        <span className="text-sm text-muted-foreground">{step.count} событий</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full transition-all"
                          style={{ width: `${100 - step.dropoff_rate}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Прогресс: {100 - step.dropoff_rate}%</span>
                        <span>Отсев: {step.dropoff_rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Конверсия по страницам */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Конверсия по страницам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Страница</th>
                      <th className="text-right py-3 px-4 font-medium">Уник. посетители</th>
                      <th className="text-right py-3 px-4 font-medium">Всего кликов</th>
                      <th className="text-right py-3 px-4 font-medium">Кликов на покупку</th>
                      <th className="text-right py-3 px-4 font-medium">Конверсия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pageConversions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          Нет данных
                        </td>
                      </tr>
                    ) : (
                      data.pageConversions.map((page, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm">{page.page_path}</td>
                          <td className="text-right py-3 px-4">{page.views}</td>
                          <td className="text-right py-3 px-4">{page.clicks}</td>
                          <td className="text-right py-3 px-4 font-medium text-primary">
                            {page.purchaseClicks}
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-semibold ${
                              page.conversionRate > 5 ? 'text-green-600' :
                              page.conversionRate > 2 ? 'text-yellow-600' :
                              'text-muted-foreground'
                            }`}>
                              {page.conversionRate}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Источники трафика (UTM) */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Источники трафика (UTM)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.utmSources.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Нет данных по UTM-меткам
                </p>
              ) : (
                <div className="space-y-4">
                  {data.utmSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{source.utm_source}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(source.count / data.totalPageViews) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {source.count}
                        </span>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {Math.round((source.count / data.totalPageViews) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
