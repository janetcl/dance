from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import or_, and_
import os

import json
from dance import app
import urllib

# Which database to fetch from:
basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://localhost/dancer"
# app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']

db = SQLAlchemy(app)

# The secure key that someone needs to use the POST methods.
SECURE_DATABASE_KEY = "sdjfhs24324[][p][}}P`092`)*@))@31DSDA&ASD{}[][]w]%%332"
