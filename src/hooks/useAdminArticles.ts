import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Article, ArticleCreateInput, ArticleUpdateInput } from "@/types/article";
import { useAdmin } from "@/contexts/AdminContext";

export type { Article } from "@/types/article";

export const useAdminArticles = () => {
  const queryClient = useQueryClient();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Article[];
    },
    enabled: !isAdminLoading && isAdmin, // Загружаем только если пользователь админ
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Только 1 повторная попытка
    retryDelay: 1000, // Задержка 1 секунда
  });

  const createArticle = useMutation({
    mutationFn: async (article: ArticleCreateInput) => {
      const { error } = await supabase.from("articles").insert(article);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
  });

  const updateArticle = useMutation({
    mutationFn: async ({ id, ...article }: ArticleUpdateInput) => {
      const { error } = await supabase.from("articles").update(article).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
  });

  return {
    articles,
    isLoading,
    createArticle,
    updateArticle,
    deleteArticle,
  };
};
