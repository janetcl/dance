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
