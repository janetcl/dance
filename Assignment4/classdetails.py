#!/usr/bin/env python

#-----------------------------------------------------------------------
# classdetails.py
# Author: Grace Ackerman and Janet Lee
#-----------------------------------------------------------------------

class ClassDetails (object):

    def __init__(self, classid, courseid, days, startTime, endTime, building, room):
        self._classid = classid
        self._courseid = courseid
        self._days = days
        self._startTime = startTime
        self._endTime = endTime
        self._building = building
        self._room = room

    def getClassId(self):
        return self._classid

    def getCourseId(self):
        return self._courseid

    def getDays(self):
        return self._days

    def getStartTime(self):
        return self._startTime

    def getEndTime(self):
        return self._endTime

    def getBuilding(self):
        return self._building

    def getRoom(self):
        return self._room
