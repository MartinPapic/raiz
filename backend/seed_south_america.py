import feedparser
from sqlmodel import Session, select, create_engine, SQLModel
from app.models import Source, FeedHistory, Article
from datetime import datetime

# Database setup
engine = create_engine("sqlite:///database.db")

# List of 20 South American RSS Feeds
SOUTH_AMERICAN_FEEDS = [
    # Argentina
    {"name": "Clarín (Argentina)", "url": "https://www.clarin.com", "feed_url": "https://www.clarin.com/rss/lo-ultimo/"},
    {"name": "La Nación (Argentina)", "url": "https://www.lanacion.com.ar", "feed_url": "https://www.lanacion.com.ar/arc/outboundfeeds/rss/?outputType=xml"},
    {"name": "Infobae (Argentina)", "url": "https://www.infobae.com", "feed_url": "https://www.infobae.com/feeds/rss/"},
    
    # Brazil
    {"name": "O Globo (Brasil)", "url": "https://oglobo.globo.com", "feed_url": "https://oglobo.globo.com/rss/topicos/economia/"},
    {"name": "Folha de S.Paulo (Brasil)", "url": "https://www1.folha.uol.com.br", "feed_url": "https://feeds.folha.uol.com.br/emcimadahora/rss091.xml"},
    
    # Chile
    {"name": "La Tercera (Chile)", "url": "https://www.latercera.com", "feed_url": "https://www.latercera.com/arc/outboundfeeds/rss/?outputType=xml"},
    {"name": "El Mercurio (Chile)", "url": "https://www.emol.com", "feed_url": "https://www.emol.com/rss/rss_ultimas_noticias.xml"},
    
    # Colombia
    {"name": "El Tiempo (Colombia)", "url": "https://www.eltiempo.com", "feed_url": "https://www.eltiempo.com/rss/mundo.xml"},
    {"name": "El Espectador (Colombia)", "url": "https://www.elespectador.com", "feed_url": "https://www.elespectador.com/arc/outboundfeeds/rss/?outputType=xml"},
    
    # Peru
    {"name": "El Comercio (Perú)", "url": "https://elcomercio.pe", "feed_url": "https://elcomercio.pe/arc/outboundfeeds/rss/?outputType=xml"},
    {"name": "La República (Perú)", "url": "https://larepublica.pe", "feed_url": "https://larepublica.pe/arc/outboundfeeds/rss/?outputType=xml"},
    
    # Ecuador
    {"name": "El Universo (Ecuador)", "url": "https://www.eluniverso.com", "feed_url": "https://www.eluniverso.com/arc/outboundfeeds/rss/?outputType=xml"},
    
    # Venezuela
    {"name": "El Pitazo (Venezuela)", "url": "https://elpitazo.net", "feed_url": "https://elpitazo.net/feed/"},
    
    # Uruguay
    {"name": "El País (Uruguay)", "url": "https://www.elpais.com.uy", "feed_url": "https://www.elpais.com.uy/rss/"},
    {"name": "Montevideo Portal (Uruguay)", "url": "https://www.montevideo.com.uy", "feed_url": "https://www.montevideo.com.uy/anxml.aspx?59"},
    
    # Paraguay
    {"name": "ABC Color (Paraguay)", "url": "https://www.abc.com.py", "feed_url": "https://www.abc.com.py/arc/outboundfeeds/rss/?outputType=xml"},
    
    # Bolivia
    {"name": "El Deber (Bolivia)", "url": "https://eldeber.com.bo", "feed_url": "https://eldeber.com.bo/rss"},
    
    # Regional / International
    {"name": "CNN Español", "url": "https://cnnespanol.cnn.com", "feed_url": "https://cnnespanol.cnn.com/feed/"},
    {"name": "BBC Mundo", "url": "https://www.bbc.com/mundo", "feed_url": "https://feeds.bbci.co.uk/mundo/rss.xml"},
    {"name": "DW Español", "url": "https://www.dw.com/es", "feed_url": "https://rss.dw.com/xml/rss-sp-all"}
]

def seed_sources(session: Session):
    print("Seeding Sources...")
    for feed in SOUTH_AMERICAN_FEEDS:
        existing_source = session.exec(select(Source).where(Source.name == feed["name"])).first()
        if not existing_source:
            source = Source(name=feed["name"], url=feed["url"], feed_url=feed["feed_url"])
            session.add(source)
            print(f"Added source: {feed['name']}")
        else:
            print(f"Source already exists: {feed['name']}")
    session.commit()

def fetch_and_log_history(session: Session):
    print("\nFetching Feeds and Logging History...")
    sources = session.exec(select(Source)).all()
    
    for source in sources:
        print(f"Checking {source.name}...")
        try:
            feed = feedparser.parse(source.feed_url)
            
            status = "success"
            details = "OK"
            count = len(feed.entries)
            
            if feed.bozo:
                status = "warning"
                details = f"Bozo exception: {feed.bozo_exception}"
                # Some feeds work even with bozo (e.g. encoding issues), so we check entries
                if count == 0:
                    status = "error"
            
            if count == 0 and status == "success":
                 status = "warning"
                 details = "No entries found"

            print(f"  -> Status: {status}, Articles: {count}")
            
            # Log history
            history = FeedHistory(
                source_id=source.id,
                status=status,
                articles_count=count,
                details=str(details)[:255] # Truncate if too long
            )
            session.add(history)
            
        except Exception as e:
            print(f"  -> Error: {e}")
            history = FeedHistory(
                source_id=source.id,
                status="error",
                articles_count=0,
                details=str(e)[:255]
            )
            session.add(history)
            
    session.commit()
    print("History logged successfully.")

def main():
    # Ensure tables exist (including new FeedHistory)
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        seed_sources(session)
        fetch_and_log_history(session)

if __name__ == "__main__":
    main()
