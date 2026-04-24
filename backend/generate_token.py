"""
Run this ONCE to authenticate with Google and generate token.pkl.
Requires oauth_credentials.json (OAuth2 Desktop app credentials from Google Cloud Console).

Usage:
    python generate_token.py
"""
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/drive",
]

flow = InstalledAppFlow.from_client_secrets_file("oauth_credentials.json", SCOPES)
creds = flow.run_local_server(port=0)

with open("token.pkl", "wb") as f:
    pickle.dump(creds, f)

print("token.pkl saved. Google Forms integration is now active.")
