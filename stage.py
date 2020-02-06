#!/usr/bin/env python

#-----------------------------------------------------------------------
# stage.py
# Author: Janet Lee
# Based on book.py by Bob Dondero
#-----------------------------------------------------------------------

from db import get_db

class Stage:
    def __init__(self, id_, user, title, details):
        self._id = id_
        self._user = user
        self._title = title
        self._details = details

    @staticmethod
    def get(stage_id):
        db = get_db()

        # Printing debug statements
        cursor = db.execute(
            "SELECT * FROM stages"
        )
        row = cursor.fetchone()
        while row is not None:
          print(row)
          row = cursor.fetchone()

        stage = db.execute(
            "SELECT * FROM stages WHERE id = ?", (stage_id,)
        ).fetchone()
        if not stage:
            return None

        stage = Stage(
            id_=stage[0], user=stage[1], title=stage[2], details=stage[3]
        )
        return stage

    @staticmethod
    def create(id_, user_id, title, details):
        db = get_db()
        db.execute(
            "INSERT INTO stages (id, user_id, title, details) "
            "VALUES (?, ?, ?, ?)",
            (id_, user_id, title, details),
        )
        db.commit()

# class Stage:
#
#     def __init__(self, id_, user, title, details):
#         self._id = id_
#         self._user = user
#         self._title = title
#         self._details = details
#
#     def __str__(self):
#         return str(self._id) + ', ' + self._user + ', ' + self._title + ', ' + self._details
#
#     def getId(self):
#         return self._id
#
#     def getUser(self):
#         return self._user
#
#     def getTitle(self):
#         return self._title
#
#     def getDetails(self):
#         return self._details
