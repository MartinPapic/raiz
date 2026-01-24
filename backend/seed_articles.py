from sqlmodel import Session, create_engine, SQLModel
from app.models import Article, KnowledgeItem
from datetime import datetime

engine = create_engine("sqlite:///database.db")

def seed_articles():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # Article 1: Draft with original content (Real URL from El País)
        article1 = Article(
            title="El cambio climático acelera el deshielo en los Andes",
            content="Este es un borrador inicial sobre el deshielo en los Andes...",
            original_content="TEXTO ORIGINAL SCRAPEADO: El cambio climático está provocando un retroceso acelerado de los glaciares en la cordillera de los Andes, según un nuevo informe...",
            url="https://es.wikipedia.org/wiki/Cambio_clim%C3%A1tico",
            source="Wikipedia",
            published_at=datetime.utcnow(),
            summary="Un informe alerta sobre el rápido deshielo en los Andes debido al cambio climático.",
            tags="cambio climático, andes, medio ambiente",
            status="draft"
        )
        session.add(article1)

        # Article 2: Published article
        article2 = Article(
            title="Avances en energía solar fotovoltaica",
            content="La eficiencia de los paneles solares ha aumentado un 20% en la última década...",
            original_content="TEXTO ORIGINAL: La tecnología solar fotovoltaica ha experimentado un crecimiento exponencial...",
            url="https://es.wikipedia.org/wiki/Energ%C3%ADa_solar_fotovoltaica",
            source="Wikipedia",
            published_at=datetime.utcnow(),
            summary="La energía solar es cada vez más eficiente y barata.",
            tags="energía, solar, tecnología, renovables",
            status="published"
        )
        session.add(article2)
        
        # Article 3: Another draft
        article3 = Article(
            title="La biodiversidad en el Amazonas",
            content="El Amazonas alberga el 10% de la biodiversidad conocida...",
            url="https://es.wikipedia.org/wiki/Amazonia",
            source="Wikipedia",
            published_at=datetime.utcnow(),
            summary="El Amazonas es clave para la biodiversidad global.",
            tags="amazonas, biodiversidad, naturaleza",
            status="draft"
        )
        session.add(article3)

        session.commit()
        print("Articles seeded successfully!")

if __name__ == "__main__":
    seed_articles()
