#!/usr/bin/env python

#-----------------------------------------------------------------------
# database.py
# Author: Janet Lee
# Based on database.py by Bob Dondero
#-----------------------------------------------------------------------

from sqlite3 import connect
from sys import stderr
from os import path
from stage import Stage

#-----------------------------------------------------------------------
# # http://flask.pocoo.org/docs/1.0/tutorial/database/
# import sqlite3
#
# import click
# from flask import current_app, g
# from flask.cli import with_appcontext
#
# def get_db():
#     if "db" not in g:
#         g.db = sqlite3.connect(
#             "sqlite_db", detect_types=sqlite3.PARSE_DECLTYPES
#         )
#         g.db.row_factory = sqlite3.Row
#
#     return g.db
#
# def close_db(e=None):
#     db = g.pop("db", None)
#
#     if db is not None:
#         db.close()
#
# def init_db():
#     db = get_db()
#
#     with current_app.open_resource("dancer.sql") as f:
#         db.executescript(f.read().decode("utf8"))
#
# @click.command("init-db")
# @with_appcontext
# def init_db_command():
#     """Clear the existing data and create new tables."""
#     init_db()
#     click.echo("Initialized the database.")
#
# def init_app(app):
#     app.teardown_appcontext(close_db)
#     app.cli.add_command(init_db_command)


class Database:

    def __init__(self):
        self._connection = None

    def connect(self):
        DATABASE_NAME = 'dancer.sqlite'
        if not path.isfile(DATABASE_NAME):
            raise Exception('Database connection failed')
        self._connection = connect(DATABASE_NAME)

    def disconnect(self):
        self._connection.close()

    def search(self, user):
        cursor = self._connection.cursor()

        QUERY_STRING = \
            'select user, stageName, details, stageId from stages ' + \
            'where user like ?'
        cursor.execute(QUERY_STRING, (user+'%',))

        stages = []
        row = cursor.fetchone()
        while row is not None:
            stage = Stage(str(row[0]), str(row[1]), str(row[2]), int(row[3]))
            stages.append(stage);
            row = cursor.fetchone()
        cursor.close()
        return stages

#-----------------------------------------------------------------------

# For testing:

if __name__ == '__main__':
    database = Database()
    database.connect()
    stages = database.search('Janet')
    for stage in stages:
        print(stage)
    database.disconnect()
