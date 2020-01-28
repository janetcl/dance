#!/usr/bin/env python

#-----------------------------------------------------------------------
# stage.py
# Author: Janet Lee
# Based on book.py by Bob Dondero
#-----------------------------------------------------------------------

class Stage:

    def __init__(self, user, stageName, details, stageId):
        self._user = user
        self._stageName = stageName
        self._details = details
        self._stageId = stageId

    def __str__(self):
        return self._user + ', ' + self._stageName + ', ' + self._details + ', ' + \
           str(self._stageId)

    def getUser(self):
        return self._user

    def getStageName(self):
        return self._stageName

    def getDetails(self):
        return self._details

    def getStageId(self):
        return self._stageId
