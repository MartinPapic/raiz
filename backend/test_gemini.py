import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get("GEMINI_API_KEY")
print(f"API Key found: {bool(API_KEY)}")

if API_KEY:
    genai.configure(api_key=API_KEY)
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content("Say hello")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No API Key")
