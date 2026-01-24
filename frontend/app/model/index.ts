export interface Article {
  id: number | string;
  title: string;
  content: string | any | any[];
  url: string;
  source: string;
  published_at?: string;
  summary?: string;
  original_content?: string;
  tags?: string; // Comma-separated
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  author?: string | { name: string };
  main_image?: string;
  featured?: boolean;
}

export interface KnowledgeItem {
  id: number;
  content: string;
  tags: string;
  source_article_id?: number;
  created_at?: string;
}

export interface SearchResult {
  id: number | string;
  score: number;
  metadata: {
    title: string;
    url: string;
    source: string;
    published_at?: string;
    // Sanity Fields
    author?: string | { name: string };
    main_image?: string;
    content_snippet: string;
  };
  content_snippet: string;
}
