from sqlmodel import Session, select, create_engine
from app.models import Article

# Connect to the database
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url)

def check_articles():
    with Session(engine) as session:
        # Count all articles
        statement = select(Article)
        articles = session.exec(statement).all()
        print(f"Total articles: {len(articles)}")
        
        # Count by status
        drafts = [a for a in articles if a.status == 'draft']
        published = [a for a in articles if a.status == 'published']
        archived = [a for a in articles if a.status == 'archived']
        
        print(f"Drafts: {len(drafts)}")
        print(f"Published: {len(published)}")
        print(f"Archived: {len(archived)}")

if __name__ == "__main__":
    check_articles()
