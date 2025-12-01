from typing import List, Optional
from datetime import timedelta
import os
import asyncio
import sys

# Windows-specific event loop policy to prevent zombie processes with Uvicorn
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel
from app.models import User, Article, Source, KnowledgeItem, FeedHistory

from app.database import create_db_and_tables, get_session
from app.models import User, Article, Source, KnowledgeItem
from app.auth import verify_password, create_access_token, get_current_user, get_optional_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from app.services.ingestion import parse_rss_feed
from app.services.rag import search_similar

load_dotenv()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Welcome to Raíz API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

class IngestRequest(BaseModel):
    feed_url: str
    source_name: str

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Include role in the token payload
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

class UserCreate(BaseModel):
    username: str
    password: str

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_create: UserCreate, session: Session = Depends(get_session)):
    # Check if user already exists
    existing_user = session.exec(select(User).where(User.username == user_create.username)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    from app.auth import get_password_hash
    hashed_password = get_password_hash(user_create.password)
    new_user = User(username=user_create.username, hashed_password=hashed_password, role="user")
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return {"message": "User created successfully", "username": new_user.username}

# --- User Management (Admin Only) ---

@app.get("/users", response_model=List[User])
def get_users(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return session.exec(select(User)).all()

class UserRoleUpdate(BaseModel):
    role: str

@app.put("/users/{user_id}/role", response_model=User)
def update_user_role(user_id: int, role_update: UserRoleUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user_to_update = session.get(User, user_id)
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
    
    if role_update.role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user_to_update.role = role_update.role
    session.add(user_to_update)
    session.commit()
    session.refresh(user_to_update)
    return user_to_update

@app.delete("/users/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user_to_delete = session.get(User, user_id)
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_to_delete.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    session.delete(user_to_delete)
    session.commit()
    return {"ok": True}

@app.post("/ingest")
def ingest_feed(request: IngestRequest, current_user: User = Depends(get_current_user)):
    try:
        count = parse_rss_feed(request.feed_url, request.source_name)
        return {"message": "Ingestion successful", "count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/articles", response_model=List[Article])
def get_articles(status: str = "published", session: Session = Depends(get_session), current_user: User = Depends(get_optional_current_user)):
    # Access Control Logic for List
    if status == "all":
        if not current_user or current_user.role != "admin":
            return [] # Or raise 403
        articles = session.exec(select(Article)).all()
        return articles

    if status != "published":
        if not current_user or current_user.role != "admin":
            # Return empty list or 403. Returning empty list mimics "no articles found"
            return []
            
    articles = session.exec(select(Article).where(Article.status == status)).all()
    return articles

@app.get("/articles/{article_id}", response_model=Article)
def get_article(article_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_optional_current_user)):
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Access Control Logic
    if article.status != "published":
        # If not published, user must be admin
        if not current_user or current_user.role != "admin":
            # Return 404 to hide existence of draft/archived articles
            raise HTTPException(status_code=404, detail="Article not found")
            
    return article

class ArticleUpdate(BaseModel):
    title: str
    summary: str
    status: str

@app.put("/articles/{article_id}", response_model=Article)
def update_article(article_id: int, article_update: ArticleUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    article.title = article_update.title
    article.summary = article_update.summary
    article.status = article_update.status
    
    session.add(article)
    session.commit()
    session.refresh(article)
    
    # Re-index in RAG if needed (omitted for MVP simplicity, or we can update metadata)
    
    return article

@app.get("/search")
def search_articles(query: str, limit: int = 5):
    results = search_similar(query, limit)
    return results

# --- Source Management ---

@app.get("/sources", response_model=List[Source])
def get_sources(session: Session = Depends(get_session)):
    return session.exec(select(Source)).all()

@app.post("/sources", response_model=Source)
def create_source(source: Source, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    session.add(source)
    session.commit()
    session.refresh(source)
    return source

@app.delete("/sources/{source_id}")
def delete_source(source_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    source = session.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    session.delete(source)
    session.commit()
    return {"ok": True}

@app.get("/sources/successful", response_model=List[Source])
def get_successful_sources(session: Session = Depends(get_session)):
    """
    Returns a list of sources that have at least one successful connection in FeedHistory.
    """
    from app.models import FeedHistory
    # Join Source and FeedHistory where status is 'success'
    # Distinct sources
    statement = select(Source).join(FeedHistory).where(FeedHistory.status == "success").distinct()
    return session.exec(statement).all()

class FeedHistoryReadWithSource(BaseModel):
    id: int
    source_name: str
    status: str
    articles_count: int
    fetched_at: datetime
    details: Optional[str] = None

@app.get("/history/successful", response_model=List[FeedHistoryReadWithSource])
def get_successful_history(session: Session = Depends(get_session)):
    """
    Returns a list of successful feed history records, joined with Source to get the name.
    """
    statement = select(FeedHistory, Source.name).join(Source).where(FeedHistory.status == "success").order_by(FeedHistory.fetched_at.desc()).limit(50)
    results = session.exec(statement).all()
    
    history_list = []
    for history, source_name in results:
        history_list.append(FeedHistoryReadWithSource(
            id=history.id,
            source_name=source_name,
            status=history.status,
            articles_count=history.articles_count,
            fetched_at=history.fetched_at,
            details=history.details
        ))
    return history_list

# --- Article Actions ---

@app.delete("/articles/{article_id}")
def delete_article(article_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    session.delete(article)
    session.commit()
    return {"ok": True}

@app.post("/articles/{article_id}/regenerate")
def regenerate_article(article_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # We need the original source text or at least the summary to regenerate
    # Since we don't store the full original text, we use the current summary/content as context
    # Ideally, we should store the original text in a separate field
    
    from app.services.llm import generate_article_content
    
    # Use current content as source for regeneration
    generated_data = generate_article_content(article.title, article.summary or article.content)
    
    article.title = generated_data['title']
    article.content = generated_data['content']
    
    # Generate a better summary or just truncate without "..." if short
    # Ideally, the LLM should also return a summary
    if len(generated_data['content']) > 200:
        article.summary = generated_data['content'][:200] + "..."
    else:
        article.summary = generated_data['content']
    
    session.add(article)
    session.commit()
    session.refresh(article)
    
    return article

@app.post("/articles/{article_id}/scrape")
def scrape_article(article_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if not article.url:
        raise HTTPException(status_code=400, detail="Article has no URL")
        
    from app.services.scraper import scrape_url
    
    try:
        scraped_text = scrape_url(article.url)
        article.content = scraped_text
        article.original_content = scraped_text # Save original for reference
        
        # Also update summary so the UI card reflects the change
        if len(scraped_text) > 200:
            article.summary = scraped_text[:200] + "..."
        else:
            article.summary = scraped_text
            
        session.add(article)
        session.commit()
        session.refresh(article)
        return article
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

class RefineRequest(BaseModel):
    content: str
    instruction: str

@app.post("/articles/{article_id}/refine")
def refine_article(article_id: int, request: RefineRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    from app.services.llm import refine_article_content
    
    refined_content = refine_article_content(request.content, request.instruction)
    
    # We return the refined content but don't save it automatically? 
    # Or should we save it? The user is in the editor, so they might want to review it first.
    # But the editor expects to save on "Save".
    # Let's return it and let the frontend update the state.
    
    return {"refined_content": refined_content}

@app.post("/articles/{article_id}/audit")
def audit_article(article_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    print(f"DEBUG: Received audit request for article {article_id}")
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    from app.services.llm import audit_article_content
    
    # Use original_content if available, otherwise fallback to summary or empty
    reference_content = article.original_content or article.summary or ""
    print(f"DEBUG: Reference content length: {len(reference_content)}")
    
    audit_report = audit_article_content(article.content, reference_content)
    print(f"DEBUG: Audit report generated. Length: {len(audit_report)}")
    
    return {"audit_report": audit_report}

# --- Knowledge Base Endpoints ---

@app.post("/knowledge-base")
def add_to_knowledge_base(item: KnowledgeItem, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@app.get("/knowledge-base/suggestions")
def get_knowledge_base_suggestions(tags: str = "", query: str = "", session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """
    Get suggestions from the knowledge base based on tags or query.
    Simple implementation: matches if any tag overlaps or if query is in content.
    """
    statement = select(KnowledgeItem)
    results = session.exec(statement).all()
    
    suggestions = []
    search_tags = [t.strip().lower() for t in tags.split(",") if t.strip()]
    
    for item in results:
        item_tags = [t.strip().lower() for t in item.tags.split(",") if t.strip()]
        
        # Check for tag overlap
        if search_tags and any(t in item_tags for t in search_tags):
            suggestions.append(item)
            continue
            
        # Check for query match
        if query and query.lower() in item.content.lower():
            suggestions.append(item)
            continue
            
    return suggestions
