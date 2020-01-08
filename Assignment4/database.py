#!/usr/bin/env python

#-----------------------------------------------------------------------
# database.py
# Author: Grace Ackerman and Janet Lee
#-----------------------------------------------------------------------

from sqlite3 import connect
from sys import stderr
from os import path
from courseinfo import CourseInfo
from coursedetails import CourseDetails
from classdetails import ClassDetails

#-----------------------------------------------------------------------

class Database:

    def __init__(self):
        self._connection = None

    def connect(self):
        DATABASE_NAME = 'reg.sqlite'
        if not path.isfile(DATABASE_NAME):
            print >>stderr, 'database: does not exist'
            return False
        self._connection = connect(DATABASE_NAME)
        return True

    def disconnect(self):
        self._connection.close()

    def search(self, dept, coursenum, area, title):
        cursor = self._connection.cursor()

        stmtStr = 'SELECT classid, dept, coursenum, area, title ' + \
            'FROM classes, courses, crosslistings ' + \
            'WHERE classes.courseid = courses.courseid ' + \
            'AND courses.courseid = crosslistings.courseid ' + \
            'AND dept LIKE ? ' + \
            'AND coursenum LIKE ? ' + \
            'AND area LIKE ? ' + \
            'AND title LIKE ? ' + \
            'ORDER BY dept, coursenum, classid'
        cursor.execute(stmtStr, [get_value(dept), get_value(coursenum),
        get_value(area), get_value(title)])

        courseinfos = []
        row = cursor.fetchone()
        while row is not None:
            courseinfo = CourseInfo(str(row[0]),
            str(row[1]), str(row[2]), str(row[3]), str(row[4]))
            courseinfos.append(courseinfo);
            row = cursor.fetchone()
        cursor.close()
        return courseinfos

    def searchClassDetails(self, classid):

        cursor = self._connection.cursor()

        #fetch class info (courseid, days, starttime, endtime, bldg, roomnum)
        stmtStr1 = 'SELECT courseid, days, starttime, endtime, bldg, ' + \
            'roomnum ' + \
            'FROM classes ' + \
            'WHERE classid = ? '

        cursor.execute(stmtStr1, [classid])
        row = cursor.fetchone()
        if row is None:
            return None

        classdetails = ClassDetails(classid, row[0], row[1], row[2], row[3],
        row[4], row[5])

        cursor.close()
        return classdetails

    def searchCourseDetails(self, courseid):

        cursor = self._connection.cursor()
        deptAndNumber = []

        #fetch crosslistings info (dept, coursenum)
        stmtStr2 = 'SELECT dept, coursenum ' + \
            'FROM crosslistings ' + \
            'WHERE courseid = ? ' + \
            'ORDER BY dept, coursenum '

        cursor.execute(stmtStr2, [courseid])
        row = cursor.fetchone()

        while row:
            deptAndNumber.append('{} {}'.format(row[0],row[1]))
            row = cursor.fetchone()

        #fetch courses info (area, title, descrip, prereqs)
        stmtStr3 = 'SELECT area, title, descrip, prereqs ' + \
            'FROM courses ' + \
            'WHERE courseid = ? '

        cursor.execute(stmtStr3, [courseid])
        row = cursor.fetchone()

        area = row[0]
        title = row[1]
        description = row[2]
        prereqs = row[3]

        professors = []
        #fetch profs info (profname)
        stmtStr4 = 'SELECT profname ' + \
            'FROM coursesprofs, profs ' + \
            'WHERE coursesprofs.profid = profs.profid ' + \
            'AND courseid = ? ' + \
            'ORDER BY profname '

        cursor.execute(stmtStr4, [courseid])
        row = cursor.fetchone()

        while row:
            professors.append(row[0])
            row = cursor.fetchone()

        courseDetails = CourseDetails(courseid, deptAndNumber, area, title,
        description, prereqs, professors)
        cursor.close()
        return courseDetails

#-----------------------------------------------------------------------

def get_value(value):
    if value:
        value = value.replace('%', '\\%')
        value = value.replace('_', '\\_')
    else:
        value = ''
    return '%' + value + '%'
