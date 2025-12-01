import requests
import sys

BASE_URL = "http://localhost:8000"

def get_token(username, password):
    response = requests.post(f"{BASE_URL}/token", data={
        "username": username,
        "password": password
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def test_user_management():
    print("--- Testing User Management ---")
    
    # 1. Login as Admin
    admin_token = get_token("admin", "admin123")
    if not admin_token:
        print("FAILURE: Could not login as admin")
        return

    # 2. List Users
    print("\nTesting GET /users (Admin)...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.get(f"{BASE_URL}/users", headers=headers)
    
    if response.status_code == 200:
        users = response.json()
        print(f"SUCCESS: Retrieved {len(users)} users.")
        for u in users:
            print(f" - {u['username']} ({u['role']}) [ID: {u['id']}]")
    else:
        print(f"FAILURE: Could not list users. Status: {response.status_code}")
        return

    # 3. Create a temporary user to manipulate
    print("\nCreating temporary user 'temp_test_user'...")
    requests.post(f"{BASE_URL}/register", json={"username": "temp_test_user", "password": "password"})
    
    # Refresh user list to get ID
    users = requests.get(f"{BASE_URL}/users", headers=headers).json()
    target_user = next((u for u in users if u["username"] == "temp_test_user"), None)
    
    if not target_user:
        print("FAILURE: Could not find created temp user")
        return
    
    target_id = target_user["id"]
    print(f"Target User ID: {target_id}")

    # 4. Promote to Admin
    print(f"\nTesting PUT /users/{target_id}/role to 'admin'...")
    response = requests.put(f"{BASE_URL}/users/{target_id}/role", 
                          json={"role": "admin"}, 
                          headers=headers)
    
    if response.status_code == 200 and response.json()["role"] == "admin":
        print("SUCCESS: User promoted to admin.")
    else:
        print(f"FAILURE: Could not promote user. Status: {response.status_code}")

    # 5. Delete User
    print(f"\nTesting DELETE /users/{target_id}...")
    response = requests.delete(f"{BASE_URL}/users/{target_id}", headers=headers)
    
    if response.status_code == 200:
        print("SUCCESS: User deleted.")
    else:
        print(f"FAILURE: Could not delete user. Status: {response.status_code}")

    # 6. Verify Deletion
    users = requests.get(f"{BASE_URL}/users", headers=headers).json()
    if not any(u["id"] == target_id for u in users):
        print("SUCCESS: User no longer in list.")
    else:
        print("FAILURE: User still exists in list.")

if __name__ == "__main__":
    test_user_management()
