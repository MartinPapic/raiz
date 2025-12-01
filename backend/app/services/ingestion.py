import feedparser
from datetime import datetime
from sqlmodel import Session, select
from app.models import Article
from app.database import engine
from app.services.rag import index_article
from app.services.llm import generate_article_content
from deep_translator import GoogleTranslator

def parse_rss_feed(feed_url: str, source_name: str):
    feed = feedparser.parse(feed_url)
    new_articles = []
    
    with Session(engine) as session:
        for entry in feed.entries:
            # Check if article already exists
            existing_article = session.exec(select(Article).where(Article.url == entry.link)).first()
            if existing_article:
                continue
            
            published_at = None
            if hasattr(entry, 'published_parsed'):
                published_at = datetime(*entry.published_parsed[:6])
            
            summary_text = entry.summary if hasattr(entry, 'summary') else ""
            
            # Generate content with LLM
            # Fallback to translation if LLM fails or key is missing
            generated_data = generate_article_content(entry.title, summary_text)
            
             # If LLM returned original title (meaning it failed or no key), try translation
            if generated_data['title'] == entry.title:
                 translator = GoogleTranslator(source='auto', target='es')
                 title_es = translator.translate(entry.title)
                 summary_es = translator.translate(summary_text) if summary_text else ""
                 content_es = summary_es
                 tags_es = ""
            else:
                 title_es = generated_data['title']
                 content_es = generated_data['content']
                 summary_es = content_es[:200] + "..." # Create summary from content
                 tags_list = generated_data.get('tags', [])
                 tags_es = ",".join(tags_list) if isinstance(tags_list, list) else str(tags_list)

            article = Article(
                title=title_es,
                content=content_es,
                url=entry.link,
                source=source_name,
                published_at=published_at,
                summary=summary_es,
                original_content=summary_text, # Save original RSS summary
                tags=tags_es,
                status="draft"
            )
            session.add(article)
            try:
                session.commit()
                session.refresh(article)
                
                # Index in Vector DB
                try:
                    index_article(article)
                except Exception as e:
                    print(f"Error indexing article {article.id}: {e}")

                new_articles.append(article)
            except Exception as e:
                session.rollback()
                # Check if it's an integrity error (duplicate URL)
                if "UNIQUE constraint failed" in str(e) or "IntegrityError" in str(e):
                    print(f"Duplicate article skipped: {entry.link}")
                    continue
                else:
                    print(f"Error saving article: {e}")
                    continue
        
    return len(new_articles)
