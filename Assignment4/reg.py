#!/usr/bin/env python

#-----------------------------------------------------------------------
# reg.py
# Author: Grace Ackerman and Janet Lee
#-----------------------------------------------------------------------

from sys import argv, stderr
from database import Database
from urllib import quote_plus
from bottle import route, request, response, error, redirect, run
from bottle import template, TEMPLATE_PATH
from bottle import static_file, run
import socket
from courseinfo import CourseInfo
from coursedetails import CourseDetails
from classdetails import ClassDetails

TEMPLATE_PATH.insert(0, '')

@route('/<fileName:re:.*\.css>')
def send_static(fileName):
    return static_file(fileName, root='.')

@route('/')
@route('/index')
def index():

    templateInfo = {}
    return template('index.tpl', templateInfo)

@route('/searchresults')
def searchResults():

    dept = request.query.dept
    if dept is None:
        dept = None
    coursenum = request.query.coursenum
    if coursenum is None:
        coursenum = None
    area = request.query.area
    if area is None:
        area = None
    title = request.query.title
    if title is None:
        title = None

    try:
        database = Database()
        connected = database.connect()
        if not connected:
            return "database does not exist"
        courseinfos = database.search(dept, coursenum, area, title)
        database.disconnect()

        ret = '<table id="results"><tr>' + \
          '<th align=left>ClassId</th>' + \
          '<th align=left>Dept</th>' + \
          '<th align=left>Num</th>' + \
          '<th align=left>Area</th>' + \
          '<th align=left>Title</th>' + \
          '</tr>'

        for courseinfo in courseinfos:
            ret += '<tr>' + \
            '<td><a href="regdetails?classid=' + courseinfo.getClassId() + '" target="_blank">' + courseinfo.getClassId() + '</a></td>' + \
            '<td>' + courseinfo.getDept() + '</td>' + \
            '<td>' + courseinfo.getCourseNum() + '</td>' + \
            '<td>' + courseinfo.getArea() + '</td>' + \
            '<td>' + courseinfo.getTitle() + '</td>' + \
            '</tr>'

        ret+= "</table>"

        return ret

    except Exception, e:
        print >>stderr, e
        #send appropriate message to browser
        return e


@route('/regdetails')
def regDetails():

    classid = request.query.classid
    print classid
    if classid == '' or classid is None:
        e = "Missing class id"
        print >>stderr, e
        #send appropriate message to browser
        templateInfo = {
            'error': e
        }
        return template('errorpage.tpl', templateInfo)


    try:
        database = Database()
        database.connect()
        classDetails = database.searchClassDetails(classid)

        if classDetails is None:
            e = "Class id {} does not exist.".format(classid)
            print >>stderr, e
            #send appropriate message to browser
            templateInfo = {
                'error': e
            }
            return template('errorpage.tpl', templateInfo)

        courseid = classDetails.getCourseId()
        courseDetails = database.searchCourseDetails(courseid)
        database.disconnect()

        templateInfo = {
            'classDetails': classDetails,
            'courseDetails': courseDetails}
        return template('regdetails.tpl', templateInfo)

    except Exception, e:
        print >>stderr, e
        #send appropriate message to browser
        templateInfo = {
            'error': e
        }
        return template('errorpage.tpl', templateInfo)

@error(404)
def notFound(error):
    return template('notfound.tpl', {})


if __name__ == '__main__':
    if len(argv) != 2:
        print 'Usage: ' + argv[0] + ' port'
        exit(1)
    if not argv[1].isdigit():
        print >>stderr, 'reg: invalid port'
        exit(1)
    hostname = socket.gethostname()
    run(host='0.0.0.0', port=argv[1], debug=True)
