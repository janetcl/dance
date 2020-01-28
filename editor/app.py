#!/usr/bin/env python

#-----------------------------------------------------------------------
# app.py
# Author: Janet Lee
# Based on penny.py by Bob Dondero
#-----------------------------------------------------------------------

# Python standard libraries
import json
import os
import sqlite3

# Third-party libraries
# from flask import Flask, redirect, request, url_for
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from oauthlib.oauth2 import WebApplicationClient
import requests

# Internal imports
# from db import init_db_command
from user import User

from sys import argv
from database import Database, init_db_command
# from time import localtime, asctime, strftime
from flask import Flask, request, make_response, redirect, url_for
from flask import render_template

#-----------------------------------------------------------------------

# Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", None)
GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)

#-----------------------------------------------------------------------

app = Flask(__name__, template_folder='.')
app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)

#-----------------------------------------------------------------------

# User session management setup
# https://flask-login.readthedocs.io/en/latest
login_manager = LoginManager()
login_manager.init_app(app)

# Naive database setup
try:
    init_db_command()
except sqlite3.OperationalError:
    # Assume it's already been created
    pass

# OAuth 2 client setup
client = WebApplicationClient(GOOGLE_CLIENT_ID)

# Flask-Login helper to retrieve a user from our db
@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)

#-----------------------------------------------------------------------

# def getAmPm():
#     if strftime('%p') == "AM":
#         return 'morning'
#     return 'afternoon'
#
# def getCurrentTime():
#     return asctime(localtime())

#-----------------------------------------------------------------------

@app.route('/')
@app.route('/index')
def index():

    html = render_template('index.html')
        # ampm=getAmPm(),
        # currentTime=getCurrentTime())
    database = Database()
    print("searching database")
    database.connect()
    stages = database.search('Janet')
    for stage in stages:
        print(stage)
    database.disconnect()
    response = make_response(html)
    return response

#-----------------------------------------------------------------------
#
# @app.route('/searchform')
# def searchForm():
#
#     errorMsg = request.args.get('errorMsg')
#     if errorMsg is None:
#         errorMsg = ''
#
#     prevAuthor = request.cookies.get('prevAuthor')
#     if prevAuthor is None:
#         prevAuthor = '(None)'
#
#     html = render_template('searchform.html',
#         ampm=getAmPm(),
#         currentTime=getCurrentTime(),
#         errorMsg=errorMsg,
#         prevAuthor=prevAuthor)
#     response = make_response(html)
#     return response

#-----------------------------------------------------------------------

# @app.route('/searchresults')
# def searchResults():
#
#     author = request.args.get('author')
#     if (author is None) or (author.strip() == ''):
#         errorMsg = 'Please type an author name.'
#         return redirect(url_for('searchForm', errorMsg=errorMsg))
#
#     database = Database()
#     database.connect()
#     books = database.search(author)
#     database.disconnect()
#
#     html = render_template('searchresults.html',
#         ampm=getAmPm(),
#         currentTime=getCurrentTime(),
#         author=author,
#         books=books)
#     response = make_response(html)
#     response.set_cookie('prevAuthor', author)
#     return response

#-----------------------------------------------------------------------

if __name__ == '__main__':
    if len(argv) != 2:
        print('Usage: ' + argv[0] + ' port')
        exit(1)
    app.run(host='0.0.0.0', port=int(argv[1]), debug=True)
