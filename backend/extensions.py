# extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from itsdangerous import URLSafeTimedSerializer


db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
serializer = URLSafeTimedSerializer("secret_key")
