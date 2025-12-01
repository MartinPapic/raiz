import requests
import random
import string

BASE_URL = "http://localhost:8000"

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def test_register_success():
    username = f"user_{generate_random_string()}"
    password = "password123"
    
    print(f"Testing registration for user: {username}")
    
    response = requests.post(f"{BASE_URL}/register", json={
        "username": username,
        "password": password
    })
    
    if response.status_code == 201:
        print("SUCCESS: User registered successfully")
        print(response.json())
    else:
        print(f"FAILURE: Failed to register user. Status: {response.status_code}")
        print(response.text)

def test_register_duplicate():
    username = f"user_{generate_random_string()}"
    password = "password123"
    
    # First registration
    requests.post(f"{BASE_URL}/register", json={
        "username": username,
        "password": password
    })
    
    print(f"Testing duplicate registration for user: {username}")
    
    # Second registration (should fail)
    response = requests.post(f"{BASE_URL}/register", json={
        "username": username,
        "password": password
    })
    
    if response.status_code == 400:
        print("SUCCESS: Duplicate registration blocked correctly")
        print(response.json())
    else:
        print(f"FAILURE: Duplicate registration not blocked. Status: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    try:
        test_register_success()
        print("-" * 20)
        test_register_duplicate()
    except Exception as e:
        print(f"An error occurred: {e}")
