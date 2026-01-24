import requests
import time

BASE_URL = "http://localhost:8000"

def get_token(username, password):
    response = requests.post(f"{BASE_URL}/token", data={"username": username, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def test_regeneration():
    token = get_token("admin", "admin123")
    if not token:
        print("Failed to get token")
        return

    print("Triggering regeneration...")
    start_time = time.time()
    headers = {"Authorization": f"Bearer {token}"}
    # Increase timeout to 60s
    try:
        response = requests.post(f"{BASE_URL}/articles/1/regenerate", headers=headers, timeout=60)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            article = response.json()
            print("Regeneration Successful!")
            print("Title:", article.get("title"))
            print("Content Preview:", article.get("content")[:500])
        else:
            print("Error:", response.text)
    except requests.exceptions.Timeout:
        print("Request timed out")
    except Exception as e:
        print(f"Error: {e}")
    
    print(f"Time taken: {time.time() - start_time:.2f}s")

if __name__ == "__main__":
    test_regeneration()
