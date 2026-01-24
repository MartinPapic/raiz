import requests

BASE_URL = "http://localhost:8000"

def test_list_security():
    print("Testing List Security...")
    
    # 1. Public user listing drafts -> Should be empty
    r = requests.get(f"{BASE_URL}/articles?status=draft")
    print(f"Public Drafts: {len(r.json())} (Expected 0)")
    
    # 2. Public user listing published -> Should be > 0 (if any)
    r = requests.get(f"{BASE_URL}/articles?status=published")
    print(f"Public Published: {len(r.json())}")
    
    # 3. Admin user listing drafts -> Should be > 0 (if any)
    # Get token first
    token_r = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "admin123"})
    if token_r.status_code == 200:
        token = token_r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE_URL}/articles?status=draft", headers=headers)
        print(f"Admin Drafts: {len(r.json())} (Expected > 0 if drafts exist)")
    else:
        print("Failed to login as admin")

if __name__ == "__main__":
    test_list_security()
