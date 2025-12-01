import requests

BASE_URL = "http://localhost:8000"

def test_login(username, password):
    print(f"Testing login for {username}...")
    response = requests.post(f"{BASE_URL}/token", data={
        "username": username,
        "password": password
    })
    
    if response.status_code == 200:
        print("SUCCESS: Login successful")
        print(response.json())
    else:
        print(f"FAILURE: Login failed. Status: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_login("admin", "admin123")
    test_login("Martin", "wrongpassword") # Should fail
