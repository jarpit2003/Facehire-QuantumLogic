"""
Run this ONCE to authenticate with Google and generate token.pkl.
Requires oauth_credentials.json (OAuth2 Desktop app credentials from Google Cloud Console).

Usage:
    cd backend
    python generate_token.py
"""
import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/drive",
]

CREDS_FILE = os.path.join(os.path.dirname(__file__), "oauth_credentials.json")
TOKEN_FILE = os.path.join(os.path.dirname(__file__), "token.pkl")

if not os.path.exists(CREDS_FILE):
    print(f"ERROR: {CREDS_FILE} not found.")
    exit(1)

print("Opening browser for Google OAuth2 authentication...")
print("Sign in with the Google account that owns the Google Cloud project.\n")

flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE, SCOPES)
creds = flow.run_local_server(port=0, open_browser=True)

with open(TOKEN_FILE, "wb") as f:
    pickle.dump(creds, f)

print(f"\n✅ token.pkl saved to: {TOKEN_FILE}")
print("Google Forms integration is now active. Restart the backend server.")

