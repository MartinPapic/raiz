import requests

BASE_URL = "http://localhost:8000"

def get_token(username, password):
    response = requests.post(f"{BASE_URL}/token", data={"username": username, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def test_scrape():
    token = get_token("admin", "admin123")
    if not token:
        print("Failed to get token")
        return

    print("Triggering scrape...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Assuming article 1 exists and has a valid URL
    # If not, we might need to create one or pick another
    article_id = 1
    
    try:
        response = requests.post(f"{BASE_URL}/articles/{article_id}/scrape", headers=headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            article = response.json()
            print("Scrape Successful!")
            print("Title:", article.get("title"))
            print("Content Preview:", article.get("content")[:500])
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_scrape()
