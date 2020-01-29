#!/usr/bin/env python

#-----------------------------------------------------------------------
# app.py
# Author: Janet Lee
# Based on penny.py by Bob Dondero
#-----------------------------------------------------------------------

import os
import requests_oauthlib
from requests_oauthlib.compliance_fixes import facebook_compliance_fix

from sys import argv
from database import Database
from flask import Flask, request, make_response, redirect, url_for
from flask import render_template


CLIENT_ID = os.environ.get("CLIENT_ID")
print(CLIENT_ID)
CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
print(CLIENT_SECRET)

FB_CLIENT_ID = os.environ.get("FB_CLIENT_ID")
print(FB_CLIENT_ID)
FB_CLIENT_SECRET = os.environ.get("FB_CLIENT_SECRET")
print(FB_CLIENT_SECRET)

FB_AUTHORIZATION_BASE_URL = "https://www.facebook.com/dialog/oauth"
FB_TOKEN_URL = "https://graph.facebook.com/oauth/access_token"

FB_SCOPE = ["email"]

AUTHORIZATION_BASE_URL = "https://app.simplelogin.io/oauth2/authorize"
TOKEN_URL = "https://app.simplelogin.io/oauth2/token"
USERINFO_URL = "https://app.simplelogin.io/oauth2/userinfo"

# This allows us to use a plain HTTP callback
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

#-----------------------------------------------------------------------

app = Flask(__name__, template_folder='.')

#-----------------------------------------------------------------------

@app.route("/")
def index():
    return """
    <a href="/fb-login">Login with Facebook</a>
    """

# Your ngrok url, obtained after running "ngrok http 8000"
URL = "https://3b3e01a3.ngrok.io"

# @app.route('/index')
# def index():
#
#     html = render_template('index.html')
#     database = Database()
#     print("searching database")
#     database.connect()
#     stages = database.search('Janet')
#     for stage in stages:
#         print(stage)
#     database.disconnect()
#     response = make_response(html)
#     return response

@app.route("/fb-login")
def login():
    facebook = requests_oauthlib.OAuth2Session(
        FB_CLIENT_ID, redirect_uri=URL + "/fb-callback", scope=FB_SCOPE
    )
    authorization_url, _ = facebook.authorization_url(FB_AUTHORIZATION_BASE_URL)

    return redirect(authorization_url)


@app.route("/fb-callback")
def callback():
    facebook = requests_oauthlib.OAuth2Session(
        FB_CLIENT_ID, scope=FB_SCOPE, redirect_uri=URL + "/fb-callback"
    )

    # we need to apply a fix for Facebook here
    facebook = facebook_compliance_fix(facebook)

    facebook.fetch_token(
        FB_TOKEN_URL,
        client_secret=FB_CLIENT_SECRET,
        authorization_response=request.url,
    )

    # Fetch a protected resource, i.e. user profile, via Graph API

    facebook_user_data = facebook.get(
        "https://graph.facebook.com/me?fields=id,name,email,picture{url}"
    ).json()

    email = facebook_user_data["email"]
    name = facebook_user_data["name"]
    picture_url = facebook_user_data.get("picture", {}).get("data", {}).get("url")

    return render_template('dance.html',
        name=name,
        email=email,
        avatar_url=picture_url)

    # return f"""
    # User information: <br>
    # Name: {name} <br>
    # Email: {email} <br>
    # Avatar <img src="{picture_url}"> <br>
    # <a href="/">Home</a>
    # """


# @app.route("/login")
# def login():
#     simplelogin = requests_oauthlib.OAuth2Session(
#         CLIENT_ID, redirect_uri="http://localhost:8000/callback"
#     )
#     authorization_url, _ = simplelogin.authorization_url(AUTHORIZATION_BASE_URL)
#
#     return redirect(authorization_url)
#
#
# @app.route("/callback")
# def callback():
#     simplelogin = requests_oauthlib.OAuth2Session(CLIENT_ID)
#     simplelogin.fetch_token(
#         TOKEN_URL, client_secret=CLIENT_SECRET, authorization_response=request.url
#     )
#
#     user_info = simplelogin.get(USERINFO_URL).json()
#     return f"""
#     User information: <br>
#     Name: {user_info["name"]} <br>
#     Email: {user_info["email"]} <br>
#     Avatar <img src="{user_info.get('avatar_url')}"> <br>
#     <a href="/">Home</a>
#     """

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
