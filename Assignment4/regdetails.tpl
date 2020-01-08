<!DOCTYPE html>
 <html>
   <head>
      <title>Registrar's Office Class Details</title>
      <link rel="stylesheet" href="/reg.css">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
   <body>
     <div class="header">
       <div class="row">
         <p class="registrar_title">
            Registrar's Office: Class Details
         </p>
       </div>
     </div>

     <div class="details_body">
        <p class="details_title"> Class Details (class id {{classDetails.getClassId()}}) </p>
        <strong>Course Id: </strong>{{classDetails.getCourseId()}} <br>
        <strong>Days: </strong>{{classDetails.getDays()}} <br>
        <strong>Start time: </strong>{{classDetails.getStartTime()}} <br>
        <strong>End time: </strong>{{classDetails.getEndTime()}} <br>
        <strong>Building: </strong>{{classDetails.getBuilding()}} <br>
        <strong>Room: </strong>{{classDetails.getRoom()}}
        <br><br>

        <hr class="line_break">
        <br>
        <p class="details_title"> Course Details (course id {{classDetails.getCourseId()}}) </p>
          % for deptAndNumber in courseDetails.getDeptAndNumber():
            <strong>Dept and Number: </strong>{{deptAndNumber}}<br>
          % end
          <strong>Area: </strong>{{courseDetails.getArea()}} <br>
          <strong>Title: </strong>{{courseDetails.getTitle()}} <br>
          <strong>Description: </strong>{{courseDetails.getDescription()}} <br>
          <strong>Prerequisites: </strong> {{courseDetails.getPrereqs()}} <br>
          % for professor in courseDetails.getProfessor():
            <strong>Professor(s): </strong> {{professor}} <br>
          % end
        </hr>
      </div>

      <div>
        <p class="footer">
        Created by Grace Ackerman and Janet Lee.
        </p>
      </div>
   </body>
 </html>
