import requests
from bs4 import BeautifulSoup

def scrape_url(url: str) -> str:
    """
    Fetches the URL and extracts the text content from paragraph tags.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Simple heuristic: extract all text from <p> tags
        paragraphs = soup.find_all('p')
        text_content = "\n\n".join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
        
        return text_content
    except Exception as e:
        print(f"Error scraping URL {url}: {e}")
        raise e
