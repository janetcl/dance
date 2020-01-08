<!DOCTYPE html>
 <html>
   <head>
      <title>Registrar's Office Class Search</title>
      <link rel="stylesheet" href="/reg.css">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body onLoad="getResults();">
   <body>
     <div class="header">
      <p class="registrar_title">
         Registrar's Office: Class Search
      </p>
       <div class="details_body">
         <form action="index" method="get">
           <table id="boxes">
             <tbody>
               <tr>
                 <th>
                   <input type="text" placeholder="Department" id="deptInput">
                 </th>
                 <th>
                   <input type="text" placeholder="Course Number" id="courseNumInput">
                 </th>
                 <th>
                   <input type="text" placeholder="Area" id="areaInput">
                 </th>
                 <th>
                   <input type="text" placeholder="Title" id="titleInput">
                 </th>
               </tr>
             </tbody>
           </table>
         </form>
       </div>
     </div>
    <div class="details_body">
      <div class="thinBorder">
        <span id="resultsSpan"></span>
      </div>
    </div>
    <div>
      <p class="footer">
      Created by Grace Ackerman and Janet Lee.
      </p>
    </div>


    <script src=
   "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js">
    </script>

    <script>


       function setup()
       {
          console.log('document loaded');


          $('#deptInput').focus();
          $('#deptInput').on('input', getResults);

          $('#courseNumInput').focus();
          $('#courseNumInput').on('input', getResults);

          $('#areaInput').focus();
          $('#areaInput').on('input', getResults);

          $('#titleInput').focus();
          $('#titleInput').on('input', getResults);


       }

       function handleResponse(response)
       {
          if (response == '')
             $('#resultsSpan').html('(None)');
          else
             $('#resultsSpan').html(response);
       }

       let request;

       function getResults()
       {
         console.log('GETTING RESULTS');
          let dept = $('#deptInput').val();
          dept = encodeURIComponent(dept);

          let courseNum = $('#courseNumInput').val();
          courseNum = encodeURIComponent(courseNum);

          let area = $('#areaInput').val();
          area = encodeURIComponent(area);

          let title = $('#titleInput').val();
          title = encodeURIComponent(title);


          let url = '/searchresults?dept=' + dept + '&coursenum=' + courseNum +
          '&area=' + area + '&title=' + title;
          if (request != null)
             request.abort();
          request = $.ajax(
             {
                type: "GET",
                url: url,
                success: handleResponse
             }
          );
       }

       $('document').ready(setup);

    </script>



   </body>
 </html>
