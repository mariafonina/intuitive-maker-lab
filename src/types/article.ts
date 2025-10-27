export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  og_image?: string;
  slug?: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at?: string;
  author_id?: string;
}

export interface ArticleCreateInput {
  title: string;
  subtitle?: string;
  description?: string;
  og_image?: string;
  slug?: string;
  content: string;
  published: boolean;
  author_id: string;
}

export interface ArticleUpdateInput {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  og_image?: string;
  slug?: string;
  content?: string;
  published?: boolean;
}
