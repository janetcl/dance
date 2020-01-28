/**
 * @author mrdoob / http://mrdoob.com/
 */

var TimelineEditor = function () {

  var container = new UI.Panel();
  container.setId( 'timeline' );

  var keysDown = {};
	document.addEventListener( 'keydown', function ( event ) { keysDown[ event.keyCode ] = true; } );
	document.addEventListener( 'keyup',   function ( event ) { keysDown[ event.keyCode ] = false; } );

  var scale = 32;
	var prevScale = scale;

  var timeline = new UI.Panel();
  timeline.setPosition( 'absolute' );
  timeline.setTop( '500px' );
  timeline.setBottom( '0px' );
  timeline.setWidth( '100%' );
  timeline.setOverflow( 'auto' );
  container.add( timeline );

  var canvas = document.createElement( 'canvas' );
  canvas.height = 32;
  canvas.style.width = '100%';
  canvas.style.background = 'rgba( 255, 255, 255, 0.3 )';
	canvas.style.position = 'absolute';

  canvas.addEventListener( 'mousedown', function ( event ) {

		event.preventDefault();

		function onMouseMove( event ) {

      console.log((event.offsetX + scroller.scrollLeft) / scale);

		}

		function onMouseUp( event ) {

			onMouseMove( event );

			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}, false );
  timeline.dom.appendChild( canvas );

  function updateMarks() {

    canvas.width = scroller.clientWidth;

    var context = canvas.getContext( '2d', { alpha: false } );

    context.fillStyle = '#555';
    context.fillRect( 0, 0, canvas.width, canvas.height );

    context.strokeStyle = '#888';
    context.beginPath();

    context.translate( - scroller.scrollLeft, 0 );

    var duration = 500;
    var width = duration * scale;
    var scale4 = scale / 4;

    for ( var i = 0.5; i <= width; i += scale ) {

      context.moveTo( i + ( scale4 * 0 ), 18 ); context.lineTo( i + ( scale4 * 0 ), 26 );

      if ( scale > 16 ) context.moveTo( i + ( scale4 * 1 ), 22 ), context.lineTo( i + ( scale4 * 1 ), 26 );
      if ( scale >  8 ) context.moveTo( i + ( scale4 * 2 ), 22 ), context.lineTo( i + ( scale4 * 2 ), 26 );
      if ( scale > 16 ) context.moveTo( i + ( scale4 * 3 ), 22 ), context.lineTo( i + ( scale4 * 3 ), 26 );

    }

    context.stroke();

    context.font = '10px Arial';
    context.fillStyle = '#888'
    context.textAlign = 'center';

    var step = Math.max( 1, Math.floor( 64 / scale ) );

    for ( var i = 0; i < duration; i += step ) {

      var minute = Math.floor( i / 60 );
      var second = Math.floor( i % 60 );

      var text = ( minute > 0 ? minute + ':' : '' ) + ( '0' + second ).slice( - 2 );

      context.fillText( text, i * scale, 13 );

    }

  }

  var scroller = document.createElement( 'div' );
	scroller.style.position = 'absolute';
	scroller.style.top = '32px';
	scroller.style.bottom = '0px';
	scroller.style.width = '100%';
	scroller.style.overflow = 'auto';
  scroller.style.background = 'rgba( 255, 255, 255, 0.5 )';
	scroller.addEventListener( 'scroll', function ( event ) {

    updateMarks();
    updateTimeMark();

	}, false );
	timeline.dom.appendChild( scroller );

  var loopMark = document.createElement( 'div' );
	loopMark.style.position = 'absolute';
	loopMark.style.top = 0;
	loopMark.style.height = 100 + '%';
	loopMark.style.width = 0;
	loopMark.style.background = 'rgba( 255, 255, 255, 0.1 )';
	loopMark.style.pointerEvents = 'none';
	loopMark.style.display = 'none';
	timeline.dom.appendChild( loopMark );

	var timeMark = document.createElement( 'div' );
	timeMark.style.position = 'absolute';
	timeMark.style.top = '0px';
	timeMark.style.left = '-8px';
	timeMark.style.width = '16px';
	timeMark.style.height = '100%';
	timeMark.style.background = 'linear-gradient(90deg, transparent 8px, #f00 8px, #f00 9px, transparent 9px) 0% 0% / 16px 16px repeat-y';
	timeMark.style.pointerEvents = 'none';
	timeline.dom.appendChild( timeMark );


  function updateTimeMark() {

		timeMark.style.left = ( 0 * scale ) - scroller.scrollLeft - 8 + 'px';

		//var loop = player.getLoop();

		// if ( Array.isArray( loop ) ) {
    //
		// 	var loopStart = loop[ 0 ] * scale;
		// 	var loopEnd = loop[ 1 ] * scale;
    //
		// 	loopMark.style.display = '';
		// 	loopMark.style.left = ( loopStart - scroller.scrollLeft ) + 'px';
		// 	loopMark.style.width = ( loopEnd - loopStart ) + 'px';
    //
		// } else {

			loopMark.style.display = 'none';

		//}

	}


  return container;
};
