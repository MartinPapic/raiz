from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class Article(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    url: str = Field(unique=True)
    source: str
    published_at: Optional[datetime] = None
    summary: Optional[str] = None
    original_content: Optional[str] = None # Stores the raw scraped text for reference
    tags: Optional[str] = None # Comma-separated tags
    status: str = Field(default="draft") # draft, published, archived
    created_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgeItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    tags: Optional[str] = None # Comma-separated tags
    source_article_id: Optional[int] = Field(default=None, foreign_key="article.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Source(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    url: str
    feed_url: str
    type: str = "rss"

class FeedHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    source_id: int = Field(foreign_key="source.id")
    status: str # "success", "error"
    articles_count: int = 0
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[str] = None # Error message or other details

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    role: str = Field(default="user") # 'admin' or 'user'
