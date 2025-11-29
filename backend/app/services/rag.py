import faiss
import numpy as np
import pickle
import os
from sentence_transformers import SentenceTransformer
from app.models import Article
from typing import List, Dict

# Initialize Sentence Transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')
embedding_dim = 384

# Initialize FAISS index
index_file = "faiss_index.bin"
metadata_file = "faiss_metadata.pkl"

if os.path.exists(index_file):
    index = faiss.read_index(index_file)
    with open(metadata_file, "rb") as f:
        metadata_store = pickle.load(f)
else:
    index = faiss.IndexFlatL2(embedding_dim)
    metadata_store = {} # Map ID (int) -> Metadata (dict)

def save_index():
    faiss.write_index(index, index_file)
    with open(metadata_file, "wb") as f:
        pickle.dump(metadata_store, f)

def index_article(article: Article):
    """
    Adds an article to the FAISS index.
    """
    if article.id is None:
        return

    # Combine title and summary/content for embedding
    text_to_embed = f"{article.title}. {article.summary or ''}"
    embedding = model.encode([text_to_embed])
    
    # Add to FAISS
    index.add(np.array(embedding).astype('float32'))
    
    # Store metadata (using FAISS internal ID which is sequential 0..N-1)
    # Note: In a real app with updates/deletes, we'd need ID mapping. 
    # Here we assume append-only and sync with DB ID if possible, 
    # but FAISS IDs are just indices. Let's map FAISS ID -> Article Data
    faiss_id = index.ntotal - 1
    metadata_store[faiss_id] = {
        "id": article.id,
        "title": article.title,
        "url": article.url,
        "source": article.source,
        "published_at": str(article.published_at) if article.published_at else "",
        "content_snippet": text_to_embed[:200]
    }
    
    save_index()

def search_similar(query: str, n_results: int = 5) -> List[dict]:
    """
    Searches for similar articles in the FAISS index.
    """
    if index.ntotal == 0:
        return []

    embedding = model.encode([query])
    D, I = index.search(np.array(embedding).astype('float32'), k=n_results)
    
    results = []
    for i in range(len(I[0])):
        idx = I[0][i]
        if idx != -1 and idx in metadata_store:
            meta = metadata_store[idx]
            results.append({
                "id": meta["id"],
                "score": float(D[0][i]),
                "metadata": meta,
                "content_snippet": meta["content_snippet"]
            })
            
    return results
