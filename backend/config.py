import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()


class Config:
    """Configuration class for the Flask application"""
    SECRET_KEY = "test"
    JWT_SECRET_KEY = "test"
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
