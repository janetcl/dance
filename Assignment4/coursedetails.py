#!/usr/bin/env python

#-----------------------------------------------------------------------
# coursedetails.py
# Author: Grace Ackerman and Janet Lee
#-----------------------------------------------------------------------

class CourseDetails (object):

    def __init__(self, courseid, deptAndNumber, area, title, description, prereqs, professor):
        self._courseid = courseid
        self._deptAndNumber = deptAndNumber
        self._area = area
        self._title = title
        self._description = description
        self._prereqs = prereqs
        self._professor = professor

    def __str__(self):
        return '{0}\t{1}\t{2}\t{3}\t{4}'.format(self._classid,
        self._dept, self._coursenum, self._area, self._title)

    def getCourseId(self):
        return self._courseid

    def getDeptAndNumber(self):
        return self._deptAndNumber

    def getArea(self):
        return self._area

    def getTitle(self):
        return self._title

    def getDescription(self):
        return self._description

    def getPrereqs(self):
        return self._prereqs

    def getProfessor(self):
        return self._professor
