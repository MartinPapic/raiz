import requests

BASE_URL = "http://localhost:8000"

def test_login(username, password):
    print(f"Testing login for '{username}'...")
    response = requests.post(f"{BASE_URL}/token", data={
        "username": username,
        "password": password
    })
    
    if response.status_code == 200:
        print(f"SUCCESS: Login successful for '{username}'")
    else:
        print(f"FAILURE: Login failed for '{username}'. Status: {response.status_code}")

if __name__ == "__main__":
    test_login("admin", "admin123")
    test_login("Admin", "admin123") # Test capitalized
