import requests

BASE_URL = "http://localhost:8000"

def get_token(username, password):
    response = requests.post(f"{BASE_URL}/token", data={"username": username, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def test_access():
    # 1. Get a published article (assume ID 1 is published, or we find one)
    # For this test, let's assume article 1 exists.
    # We need to ensure we have a draft article too.
    
    admin_token = get_token("admin", "admin123")
    user_token = get_token("user", "user123")
    
    print(f"Admin Token: {bool(admin_token)}")
    print(f"User Token: {bool(user_token)}")

    # Create a draft article as admin
    draft_article = {
        "title": "Draft Article",
        "summary": "This is a draft",
        "content": "Secret content",
        "status": "draft",
        "url": "http://example.com",
        "source": "Test",
        "published_at": "2023-01-01T00:00:00"
    }
    
    # We don't have a create endpoint exposed easily for this test without ingesting...
    # But we can update article 1 to be draft temporarily if we want, or just check existing.
    # Let's check article 1 status first.
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    r = requests.get(f"{BASE_URL}/articles/1", headers=headers)
    if r.status_code == 200:
        article_1 = r.json()
        print(f"Article 1 Status: {article_1['status']}")
        
        # If it's published, test public access
        if article_1['status'] == 'published':
            r_public = requests.get(f"{BASE_URL}/articles/1")
            print(f"Public Access to Published: {r_public.status_code} (Expected 200)")
            
            # Now try to update it to draft
            r_update = requests.put(f"{BASE_URL}/articles/1", json={**article_1, "status": "draft"}, headers=headers)
            if r_update.status_code == 200:
                print("Article 1 updated to draft.")
                
                # Test Public Access (Should fail)
                r_public_draft = requests.get(f"{BASE_URL}/articles/1")
                print(f"Public Access to Draft: {r_public_draft.status_code} (Expected 404)")
                
                # Test User Access (Should fail)
                r_user_draft = requests.get(f"{BASE_URL}/articles/1", headers={"Authorization": f"Bearer {user_token}"})
                print(f"User Access to Draft: {r_user_draft.status_code} (Expected 404)")
                
                # Test Admin Access (Should success)
                r_admin_draft = requests.get(f"{BASE_URL}/articles/1", headers=headers)
                print(f"Admin Access to Draft: {r_admin_draft.status_code} (Expected 200)")
                
                # Restore to published
                requests.put(f"{BASE_URL}/articles/1", json={**article_1, "status": "published"}, headers=headers)
                print("Article 1 restored to published.")
            else:
                print("Failed to update article to draft")

if __name__ == "__main__":
    test_access()
