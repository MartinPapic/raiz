export interface Article {
  id: number;
  title: string;
  content: string;
  url: string;
  source: string;
  published_at?: string;
  summary?: string;
  original_content?: string;
  tags?: string; // Comma-separated
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

export interface KnowledgeItem {
  id: number;
  content: string;
  tags: string;
  source_article_id?: number;
  created_at?: string;
}

export interface SearchResult {
  id: number;
  score: number;
  metadata: {
    title: string;
    url: string;
    source: string;
    published_at: string;
    content_snippet: string;
  };
  content_snippet: string;
}
