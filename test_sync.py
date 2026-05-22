import requests
import json

BASE_URL = "http://localhost:8000"

def test_sync():
    # 1. Login
    login_data = {
        "username": "admin@bindass.com",
        "password": "secretadmin123"
    }
    print("Logging in...")
    res = requests.post(f"{BASE_URL}/api/owners/login", data=login_data)
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return
    
    token = res.json()["access_token"]
    print(f"Token acquired: {token[:10]}...")

    # 2. Sync Widget
    config = {
        "bot_name": "NEXA Sync Test",
        "bot_logo": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        "primary_color": "#ff0000",
        "position": "bottom-right",
        "greeting": "Sync working!"
    }
    print("Syncing widget config...")
    res = requests.post(f"{BASE_URL}/api/widget/save", json=config, headers={"Authorization": f"Bearer {token}"})
    print(f"Sync Result: {res.status_code}")
    print(f"Response: {res.text}")

if __name__ == "__main__":
    test_sync()
