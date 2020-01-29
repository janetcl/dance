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

# From https://realpython.com/flask-google-login/
# import sqlite3
# from flask_login import (
#     LoginManager,
#     current_user,
#     login_required,
#     login_user,
#     logout_user,
# )
from oauthlib.oauth2 import WebApplicationClient
import requests
import json
# from database import init_db_command
# from user import User

# # SimpleLogin Information
# CLIENT_ID = os.environ.get("CLIENT_ID")
# CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
#
# AUTHORIZATION_BASE_URL = "https://app.simplelogin.io/oauth2/authorize"
# TOKEN_URL = "https://app.simplelogin.io/oauth2/token"
# USERINFO_URL = "https://app.simplelogin.io/oauth2/userinfo"

# Facebook Login
FB_CLIENT_ID = os.environ.get("FB_CLIENT_ID")
FB_CLIENT_SECRET = os.environ.get("FB_CLIENT_SECRET")

FB_AUTHORIZATION_BASE_URL = "https://www.facebook.com/dialog/oauth"
FB_TOKEN_URL = "https://graph.facebook.com/oauth/access_token"

FB_SCOPE = ["email"]

# Google Login
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")

GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)

# This allows us to use a plain HTTP callback
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

#-----------------------------------------------------------------------

# Flask app setup
app = Flask(__name__, template_folder='.')
# app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)

# # User session management setup
# # https://flask-login.readthedocs.io/en/latest
# login_manager = LoginManager()
# login_manager.init_app(app)

# # Naive database setup
# try:
#     init_db_command()
# except sqlite3.OperationalError:
#     # Assume it's already been created
#     pass
#
# OAuth 2 client setup
client = WebApplicationClient(GOOGLE_CLIENT_ID)

# # Flask-Login helper to retrieve a user from our db
# @login_manager.user_loader
# def load_user(user_id):
#     return User.get(user_id)

#-----------------------------------------------------------------------

@app.route("/")
def index():
    # if current_user.is_authenticated:
    #     return (
    #         "<p>Hello, {}! You're logged in! Email: {}</p>"
    #         "<div><p>Google Profile Picture:</p>"
    #         '<img src="{}" alt="Google profile pic"></img></div>'
    #         '<a class="button" href="/logout">Logout</a>'.format(
    #             current_user.name, current_user.email, current_user.profile_pic
    #         )
    #     )
    # else:
    return render_template('index.html')
    # return """
    # <a class="button" href="/google-login">Google Login</a>
    # <br>
    # <a class="button" href="/fb-login">Login with Facebook</a>
    # """

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
def fbLogin():
    facebook = requests_oauthlib.OAuth2Session(
        FB_CLIENT_ID, redirect_uri=URL + "/fb-callback", scope=FB_SCOPE
    )
    authorization_url, _ = facebook.authorization_url(FB_AUTHORIZATION_BASE_URL)

    return redirect(authorization_url)


@app.route("/fb-callback")
def fbCallback():
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

def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()

@app.route("/google-login")
def googleLogin():
    # google = requests_oauthlib.OAuth2Session(
    #     GOOGLE_CLIENT_ID, redirect_uri=URL + "/google-callback", scope=GOOGLE_SCOPE
    # )
    # authorization_url, _ = google.authorization_url(GOOGLE_AUTHORIZATION_BASE_URL)

    # Find out what URL to hit for Google login
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    # return redirect(authorization_url)

    # Use library to construct the request for Google login and provide
    # scopes that let you retrieve user's profile from Google
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "-callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)


@app.route("/google-login-callback")
def googleCallback():
    # Get authorization code Google sent back to you
    code = request.args.get("code")

    # Find out what URL to hit to get tokens that allow you to ask for
    # things on behalf of a user
    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]

    # Prepare and send a request to get tokens! Yay tokens!
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )

    # Parse the tokens!
    client.parse_request_body_response(json.dumps(token_response.json()))


    # Now that you have tokens (yay) let's find and hit the URL
    # from Google that gives you the user's profile information,
    # including their Google profile image and email
    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)


    # You want to make sure their email is verified.
    # The user authenticated with Google, authorized your
    # app, and now you've verified their email through Google!
    if userinfo_response.json().get("email_verified"):
        unique_id = userinfo_response.json()["sub"]
        users_email = userinfo_response.json()["email"]
        picture = userinfo_response.json()["picture"]
        users_name = userinfo_response.json()["given_name"]
    else:
        return "User email not available or not verified by Google.", 400

    # # Create a user in your db with the information provided
    # # by Google
    # user = User(
    #     id_=unique_id, name=users_name, email=users_email, profile_pic=picture
    # )
    #
    # # Doesn't exist? Add it to the database.
    # if not User.get(unique_id):
    #     User.create(unique_id, users_name, users_email, picture)

    # # Begin user session by logging the user in
    # login_user(user)

    # Send user back to homepage
    # return redirect(url_for("index"))
    return render_template('dance.html',
        name=users_name,
        email=users_email,
        avatar_url=picture)

    # facebook = requests_oauthlib.OAuth2Session(
    #     FB_CLIENT_ID, scope=GOOGLE_SCOPE, redirect_uri=URL + "/google-callback"
    # )
    #
    # # we need to apply a fix for Facebook here
    # facebook = facebook_compliance_fix(facebook)
    #
    # google.fetch_token(
    #     FB_TOKEN_URL,
    #     client_secret=FB_CLIENT_SECRET,
    #     authorization_response=request.url,
    # )
    #
    # # Fetch a protected resource, i.e. user profile, via Graph API
    #
    # google_user_data = facebook.get(
    #     "https://graph.facebook.com/me?fields=id,name,email,picture{url}"
    # ).json()
    #
    # email = facebook_user_data["email"]
    # name = facebook_user_data["name"]
    # picture_url = facebook_user_data.get("picture", {}).get("data", {}).get("url")
    #
    # return render_template('dance.html',
    #     name=name,
    #     email=email,
    #     avatar_url=picture_url)

# @app.route("/logout")
# @login_required
# def logout():
#     logout_user()
#     return redirect(url_for("index"))

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
