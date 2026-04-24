"""
Quick SMTP test — run from backend/ folder:
    python test_email.py your@email.com
"""
import sys, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os

load_dotenv()

TO = sys.argv[1] if len(sys.argv) > 1 else os.getenv("SMTP_FROM_EMAIL")
HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
PORT = int(os.getenv("SMTP_PORT", 587))
USER = os.getenv("SMTP_USERNAME")
PASS = os.getenv("SMTP_PASSWORD")
FROM = os.getenv("SMTP_FROM_EMAIL")

print(f"Connecting to {HOST}:{PORT} as {USER} ...")

msg = MIMEMultipart()
msg["From"] = FROM
msg["To"] = TO
msg["Subject"] = "FairHire AI — SMTP Test"
msg.attach(MIMEText("If you see this, SMTP is working correctly.", "plain"))

try:
    with smtplib.SMTP(HOST, PORT) as server:
        server.starttls()
        server.login(USER, PASS)
        server.send_message(msg)
    print(f"✓ Email sent successfully to {TO}")
except smtplib.SMTPAuthenticationError:
    print("✗ Authentication failed — App Password is wrong or 2FA is not enabled on the Gmail account.")
    print("  Fix: Go to myaccount.google.com → Security → App Passwords → generate a new one.")
except Exception as e:
    print(f"✗ Failed: {e}")
