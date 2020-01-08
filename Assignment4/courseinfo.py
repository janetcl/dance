#!/usr/bin/env python

#-----------------------------------------------------------------------
# courseinfo.py
# Author: Grace Ackerman and Janet Lee
#-----------------------------------------------------------------------

class CourseInfo (object):

    def __init__(self, classid, dept, coursenum, area, title):
        self._classid = classid
        self._dept = dept
        self._coursenum = coursenum
        self._area = area
        self._title = title

    def __str__(self):
        myString = '{:<5} {:>4} {:>6} {:>4} {:<}'
        return myString.format(str(self._classid),
        str(self._dept), str(self._coursenum), str(self._area),
        str(self._title))

    def getClassId(self):
        return self._classid

    def getDept(self):
        return self._dept

    def getCourseNum(self):
        return self._coursenum

    def getArea(self):
        return self._area

    def getTitle(self):
        return self._title
