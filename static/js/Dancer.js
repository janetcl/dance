import TimelinePlugin from './WaveSurferTimeline.js';
import CursorPlugin from './WaveSurferCursor.js';
import RegionsPlugin from './WaveSurferRegions.js';
// import EffectComposer from './EffectComposer.js';
// const jsc = require("./jscolor");
// import * as jsc from './jscolor.js';

class Dancer {

  constructor(name, mesh) {
    this.keyframePositions = []; // [ { start: 0, end: 10, position: (0, 0, 0) } ] eg: [ {0: (0,0,0)}, { 20: (0, 1, 10)}]
    this.name = name;
    this.mesh = mesh;
    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.position.z = 0;
  }

  updateName(name) {
    this.name = name;
  }

  updateColor(color) {
    this.mesh.material.color.set(color);
  }

  async addKFPosition(start, end, pos) {
    // Filter existing positions to make sure each time has only one position
    this.keyframePositions = this.keyframePositions.filter(function(kfp, index, arr){
        return (kfp.start !== start && kfp.end !== end);
    });
    var keyframePosition = {start: start, end: end, position: pos}
    this.keyframePositions.push(keyframePosition);
    // Sort all positions in time order
    this.keyframePositions.sort(function(a, b) {return a.start - b.start});
  }

  removeKeyFrame(start) {
    // Filter existing positions to make sure each time has only one position
    this.keyframePositions = this.keyframePositions.filter(function(kfp, index, arr){
        return kfp.start !== start;
    });
    return;
  }

  updateKeyFrame(oldStart, newStart, newEnd) {
    var pos;
    for (var i = 0; i < this.keyframePositions.length; i++) {
        if (this.keyframePositions[i].start === oldStart) {
            pos = this.keyframePositions[i].position;
        }
    }
    this.removeKeyFrame(oldStart);
    this.addKFPosition(newStart, newEnd, pos);
    return;
  }

  getPosAt(t) {
    t = wavesurfer.getCurrentTime();

    if (t > danceDesigner.maxT) {

      var lastIndex = this.keyframePositions.length - 1;
      return this.keyframePositions[lastIndex].position;
    } else {

      if (this.keyframePositions.length == 1) {
        var lastIndex = this.keyframePositions.length - 1;
        return this.keyframePositions[lastIndex].position;
      } else {
        for (var j = 0; j < this.keyframePositions.length - 1; j++) {
          var currKeyFramePos = this.keyframePositions[j];
          var nextKeyFramePos = this.keyframePositions[j+1];
          if (t == currKeyFramePos.start ||
            (t > currKeyFramePos.start && t < currKeyFramePos.end) ||
          (t == currKeyFramePos.end)) {
            return currKeyFramePos.position;
          } else if (t > currKeyFramePos.end && t < nextKeyFramePos.start) {
            var diff = nextKeyFramePos.start - currKeyFramePos.end;
            var frac = (t - currKeyFramePos.end) / diff;
            var newPos = new THREE.Vector3(currKeyFramePos.position.x + (frac * (nextKeyFramePos.position.x - currKeyFramePos.position.x)),
            currKeyFramePos.position.y + (frac * (nextKeyFramePos.position.y - currKeyFramePos.position.y)),
            currKeyFramePos.position.z + (frac * (nextKeyFramePos.position.z - currKeyFramePos.position.z)));
            return newPos;
          } else if (t == nextKeyFramePos.start ||
            (t > nextKeyFramePos.start && t < nextKeyFramePos.end) ||
          (t == nextKeyFramePos.end)) {
            return nextKeyFramePos.position;
          }
        }
      }
    }
  }

  async clone() {
    var cloneDancer = new Dancer(this.name, this.mesh);
    cloneDancer.keyframePositions = await this.keyframePositions.slice(0);
    return cloneDancer;
  }

  computePositions(keyframes) {
    if (keyframes.length == 1) {
      return;
    }
    for (var i = 0; i < keyframes.length - 1; i++) {
      var firstTime = keyframes[i];
      var secondTime = keyframes[i + 1];
      var timeDiff = secondTime - firstTime;
      for (var j = 0; j < timeDiff; j++) {
        this.positions[firstTime + j].x = ((this.positions[secondTime].x - this.positions[firstTime].x) * j / (timeDiff)) + this.positions[firstTime].x;
        this.positions[firstTime + j].y = ((this.positions[secondTime].y - this.positions[firstTime].y) * j / (timeDiff)) + this.positions[firstTime].y;
        this.positions[firstTime + j].z = ((this.positions[secondTime].z - this.positions[firstTime].z) * j / (timeDiff)) + this.positions[firstTime].z;
      }
    }
    return;
  }

}

class Stage {

  constructor() {
    this.dancers = [];
    this.keyframes = [0];
  }

  addDancer(dan) {
    var i;
    // Check to make sure the dancer does not already exist onstage
    for (i = 0; i < this.dancers.length; i++) {
      if (this.dancers[i] === dan) {
        return;
      }
    }
    this.dancers.push(dan);
  }

  removeDancer(dan) {
    this.dancers = this.dancers.filter(function(dancer, index, arr){
        return dancer !== dan;
    });
  }

  addKeyFrame(t) {
    this.keyframes.push(t);
    this.keyframes.sort(function(a, b) {return a - b});
  }

  clearDancers() {
    this.dancers = [];
  }

}


var danceDesigner = {
  scene: null, camera: null, renderer: null, rendererWidth: null,
  rendererHeight: null, movingDancer: null,
  controls: null, loader: null, container: null, light: null,
  plane: null, selection: null, offset: new THREE.Vector3(),
  raycaster: new THREE.Raycaster(), s: null,
  dancersArr: [], maxT: null, stagePlane: null,
  xMax: null, xMin: null, zMax: null, zMin: null,
  camera1: null, renderer1: null, camera2: null, renderer2: null,
  scene2: null, renderers: [], dragControls: null, newPos: null,
  // janet: null, phillip: null,
  init: function() {
    this.scene = new THREE.Scene();

    // TODO: Make the renderer a function of window width/height

    this.rendererWidth = window.innerWidth * 8 / 10;
    this.rendererHeight = window.innerHeight * 8 / 10;
    // this.rendererWidth = 900;
    // this.rendererHeight = 570;
    var viewAngle = 45;
    var nearClipping = 0.1;
    var farClipping = 9999;
    this.camera = new THREE.PerspectiveCamera( viewAngle, this.rendererWidth / this.rendererHeight, nearClipping, farClipping );
    this.renderer = new THREE.WebGLRenderer({canvas: document.getElementById("renderer")});
    this.renderer.setSize( this.rendererWidth, this.rendererHeight );

    // Create small renderer for aerial view
    var width1 = window.innerWidth / 5.5;
    var height1 = window.innerHeight / 5.5;
    // var width1 = 300;
    // var height1 = 190;
    var viewAngle1 = 45;
    this.camera1 = new THREE.PerspectiveCamera( viewAngle1, width1 / height1, nearClipping, farClipping );
    this.renderer1 = new THREE.WebGLRenderer({canvas: document.getElementById("0"), preserveDrawingBuffer: true});

    this.renderer1.setSize( width1, height1 );
    this.camera1.position.z = -10;
    this.camera1.position.y = 30;
    this.camera1.lookAt(new THREE.Vector3(0, 0, -10));

    // Events
    document.addEventListener('mousedown', this.onDocumentMouseDown, true);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);

    this.loader = new THREE.TextureLoader();
    this.s = new Stage();
    this.maxT = 0;
    this.dancersArr = [];

    // var spotLightJanet = new THREE.SpotLight( {color: 0xffffff, intensity: 0.1});
    // spotLightJanet.position.set( -3, 50, 20 );
    // spotLightJanet.castShadow = true;
    // spotLightJanet.shadow.mapSize.width = 1024;
    // spotLightJanet.shadow.mapSize.height = 1024;
    // spotLightJanet.shadow.camera.near = 500;
    // spotLightJanet.shadow.camera.far = 4000;
    // spotLightJanet.shadow.camera.fov = 30;
    // spotLightJanet.target = janetMesh;
    // this.scene.add( spotLightJanet );

    this.light = new THREE.PointLight(0xFFFFFF);
    this.light.position.x = 0;
    this.light.position.y = 10;
    this.light.position.z = 0;
    this.light.intensity = 1;
    this.scene.add(this.light);

    var light = new THREE.PointLight(0xFFFFFF);
    light.position.x = 0;
    light.position.y = 20;
    light.position.z = -10;
    light.intensity = 2;
    this.scene.add(light);

    // Add the stage
    var geometry = new THREE.PlaneGeometry( 30, 20, 10, 5 );
    var material = new THREE.MeshBasicMaterial({
      color: 0xFF8844,
      map: this.loader.load('static/files/stage.jpg'),
      side: THREE.DoubleSide,
    });
    var floor = new THREE.Mesh( geometry, material );
    floor.rotation.x = Math.PI / 2;
    floor.position.z = -10;
    floor.position.y = -1;
    this.scene.add( floor );

    this.xMax = 17.5;
    this.xMin = -17.5;
    this.zMax = 0;
    this.zMin = -20;

    var geo = new THREE.WireframeGeometry( floor.geometry );
    var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
    var wireframe = new THREE.LineSegments( geo, mat );
    floor.add( wireframe );

    // Set the camera and orbit controls
    this.camera.position.z = 25;
    this.camera.position.y = 30;
    // this.camera.lookAt(new THREE.Vector3(0, 0, 10));

    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls.target.set( 0, 0, -2 );
    this.controls.maxDistance = 50;

    this.dragControls = new THREE.DragControls(this.dancersArr, this.camera, this.renderer.domElement);
    this.dragControls.addEventListener( 'dragstart', function ( event ) {
    	event.object.material.emissive.set( 0xaaaaaa );
      // console.log("moving object: ", event.object);
      // console.log("new position: ", event.object.position);
      danceDesigner.controls.enabled = false;
    } );

    this.dragControls.addEventListener( 'dragend', function ( event ) {
    	event.object.material.emissive.set( 0x000000 );
      // console.log("FINAL position: ", event.object.position);
      danceDesigner.controls.enabled = true;
    } );

    var axesHelper = new THREE.AxesHelper( 5 );
    this.scene.add( axesHelper );

    // Plane, that helps to determinate an intersection position
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({color: 0xffffff, visible: false}));
    this.plane.rotation.x = Math.PI / 2;
    this.plane.position.z = -10;
    this.plane.position.y = -1;
    this.scene.add(this.plane);

    var stageNormalVector = new THREE.Vector3(0, 1, 0);
    this.stagePlane = new THREE.Plane(stageNormalVector);

    // Create small renderer for timeline
    // var width2 = window.innerWidth / 6;
    // var height2 = window.innerHeight / 6;
    // var viewAngle2 = 45;
    // this.camera2 = new THREE.PerspectiveCamera( viewAngle2, width2 / height2, nearClipping, farClipping );
    // this.renderer2 = new THREE.WebGLRenderer();
    // this.renderer2.setSize( width2, height2 );
    // document.body.appendChild( this.renderer2.domElement );
    // this.camera2.position.z = -10;
    // this.camera2.position.y = 30;
    // this.camera2.lookAt(new THREE.Vector3(0, 0, -10));

    // let timelineSection = document.getElementById("timelineSection");
    // Create new canvas
    // let canvas = create("canvas", {class: "timelineCanvas"});
    // document.getElementById('timelineSection').appendChild(canvas);
    // this.renderers.push({renderer: this.renderer2, scene: this.scene.clone(), time: 0});
  },
  onDocumentMouseDown: function (event) {
    // event.preventDefault();
    if (event.clientY > (danceDesigner.rendererHeight) && event.clientY < ((danceDesigner.rendererHeight) + 32)) {
      if (moveNumber == 0) {
        addToUndoBuffer();
      }
      var isMovingAKeyFrame = false;
      var lastKeyframeT = 0;
  		function onMouseMove( event ) {
  		}
  		async function onMouseUp( event ) {

        // if (isMovingAKeyFrame) {
        //
        //   t = Math.round(t);
        //
        //   if (lastKeyframeT == 0) {
        //     // What do you do if the user is moving the first keyframe?
        //     // Automatically create a new keyframe at time = 0 to replace it
        //     alert("Cannot move first key frame.");
        //   }
        //
        //   var lastKeyframeIndex = 0;
        //   var currentTimeLessIndex = 0;
        //   // console.log(danceDesigner.s.keyframes);
        //   // Determine where the current time is in the keyframes[] array if it exists
        //   for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
        //     if (danceDesigner.s.keyframes[i] == lastKeyframeT) {
        //       lastKeyframeIndex = i;
        //     }
        //     if (danceDesigner.s.keyframes[i] < t) {
        //       currentTimeLessIndex = i;
        //     }
        //   }
        //   var keyframeAdjust = null;
        //   var secondToLastT = danceDesigner.s.keyframes[danceDesigner.s.keyframes.length - 2];
        //
        //   // Adjust all of the dancers' positions appropriately.
        //   for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
        //     danceDesigner.s.dancers[i].updateKeyFrame(lastKeyframeT, t, t + 2);
        //     // await danceDesigner.s.dancers[i].updatePositions();
        //     // Case where the keyframe moved was previously the last keyframe in the routine.
        //     if (lastKeyframeIndex == danceDesigner.s.keyframes.length - 1) {
        //       if (t > lastKeyframeT) {
        //         danceDesigner.maxT = t;
        //         keyframeAdjust = "Move Last Extend Routine";
        //       } else {
        //         // Case where old last position is moving between two other positions
        //         if (t < secondToLastT) {
        //           danceDesigner.maxT = secondToLastT;
        //           keyframeAdjust = "Move Last New Order";
        //         }
        //         // Case where the last position is still the last posiition
        //         else {
        //           danceDesigner.maxT = t;
        //           keyframeAdjust = "Move Last Keep Order";
        //         }
        //       }
        //     } else {
        //       // Case where the keyframe being moved was previously not the last keyframe in the routine.
        //       if (t > danceDesigner.s.keyframes[danceDesigner.s.keyframes.length - 1]) {
        //         danceDesigner.maxT = t;
        //         // Move the position to a new ending position in the routine
        //         keyframeAdjust = "Move Middle Position To New End";
        //       } else {
        //         keyframeAdjust = "Move Middle Position To New Middle";
        //       }
        //     }
        //   }
        //
        //   // Adjust the stage's keyframes appropriately
        //   if (keyframeAdjust == "Move Last Keep Order" || keyframeAdjust == "Move Last Extend Routine") {
        //     danceDesigner.s.keyframes[lastKeyframeIndex] = t;
        //   } else {
        //     danceDesigner.s.keyframes[lastKeyframeIndex] = t;
        //     danceDesigner.s.keyframes.sort(function(a, b) {
        //       return a - b;
        //     });
        //   }
        //
        //   isMovingAKeyFrame = false;
        //
        //   // PUSH TO UNDO BUFFER
        //   await addToUndoBuffer();
        //   timeline.updateSetKeyframeTimeMark(lastKeyframeT, t);
        //   justHitUndo = false;
        // }

        // t = ((event.offsetX + timeline.scroller.scrollLeft) / timeline.scale);
  			onMouseMove( event );
  			document.removeEventListener( 'mousemove', onMouseMove );
  			document.removeEventListener( 'mouseup', onMouseUp );
  		}

      // t = ((event.offsetX + timeline.scroller.scrollLeft) / timeline.scale);
      var lessT = Math.round(t - 1);
      t = Math.round(t);
      var greaterT = Math.round(t + 1);
      if (danceDesigner.s.keyframes.includes(t) || danceDesigner.s.keyframes.includes(lessT) || danceDesigner.s.keyframes.includes(greaterT)) {
        // Determine where the current time is in the keyframes[] array if it exists
        for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
          if (danceDesigner.s.keyframes[i] == t || danceDesigner.s.keyframes[i] == lessT || danceDesigner.s.keyframes[i] == greaterT) {
            t = danceDesigner.s.keyframes[i];
            // Select the keyframe to move it
            isMovingAKeyFrame = true;
            lastKeyframeT = t;
          }
        }
      } else {
        // Set the dancers' position to the maximum position
        for (var i = 0; i < danceDesigner.s.dancers.length; i++) {

          var kLength = danceDesigner.s.dancers[i].keyframePositions.length;
          danceDesigner.s.dancers[i].mesh.position.x = danceDesigner.s.dancers[i].keyframePositions[kLength-1].position.x;
          danceDesigner.s.dancers[i].mesh.position.y = danceDesigner.s.dancers[i].keyframePositions[kLength-1].position.y;
          danceDesigner.s.dancers[i].mesh.position.z = danceDesigner.s.dancers[i].keyframePositions[kLength-1].position.z;

        }
      }

  		document.addEventListener( 'mousemove', onMouseMove, false );
  		document.addEventListener( 'mouseup', onMouseUp, false );

    } else if (event.clientX > danceDesigner.rendererWidth || event.clientY > (danceDesigner.rendererHeight + 32)) {
      danceDesigner.controls.enabled = false;
      return;
    } else {
      var mouseX = (event.clientX / danceDesigner.rendererWidth) * 2 - 1;
      var mouseY = -(event.clientY / danceDesigner.rendererHeight) * 2 + 1;
      // Get 3D vector from 3D mouse position using 'unproject' function
      var vector = new THREE.Vector3(mouseX, mouseY, 1);
      vector.unproject(danceDesigner.camera);
      // Set the raycaster position
      danceDesigner.raycaster.set( danceDesigner.camera.position, vector.sub( danceDesigner.camera.position ).normalize() );
      // Find all intersected objects
      var intersects = danceDesigner.raycaster.intersectObjects(danceDesigner.dancersArr);
      if (intersects.length > 0) {
        // Disable the controls
        danceDesigner.controls.enabled = false;
        // Set the selection - first intersected object
        danceDesigner.selection = intersects[0].object;

        for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
          var tempT = Math.round(t);
          if (tempT > danceDesigner.maxT) {
            tempT = Math.round(danceDesigner.maxT);
          }

          if ((Math.abs(danceDesigner.s.dancers[i].mesh.position.x - intersects[0].object.position.x) < 1) &&
          (Math.abs(danceDesigner.s.dancers[i].mesh.position.y - intersects[0].object.position.y) < 1) &&
          (Math.abs(danceDesigner.s.dancers[i].mesh.position.z - intersects[0].object.position.z) < 1)) {
            danceDesigner.movingDancer = danceDesigner.s.dancers[i];
          }
        }
        // Calculate the offset
        var intersects = danceDesigner.raycaster.intersectObject(danceDesigner.plane);
        danceDesigner.offset.copy(intersects[0].point).sub(danceDesigner.plane.position);
      }
    }
  },
  onDocumentMouseMove: function (event) {
    // event.preventDefault();
    if (event.clientX > danceDesigner.rendererWidth || event.clientY > danceDesigner.rendererWidth) {
      danceDesigner.controls.enabled = false;
      return;
    }
    // Get mouse position
    var mouseX = (event.clientX / danceDesigner.rendererWidth) * 2 - 1;
    var mouseY = -(event.clientY / danceDesigner.rendererHeight) * 2 + 1;
    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(danceDesigner.camera);
    // Set the raycaster position
    danceDesigner.raycaster.set( danceDesigner.camera.position, vector.sub( danceDesigner.camera.position ).normalize() );
    if (danceDesigner.selection) {
      // Check the position where the plane is intersected
      var intersects = danceDesigner.raycaster.intersectObject(danceDesigner.plane);
      // Reposition the object based on the intersection point with the plane
      newPosThreeVector = danceDesigner.stagePlane.projectPoint(
        intersects[0].point.sub(danceDesigner.offset),
        danceDesigner.selection.position
      );
      // Find the dancer based on the initial pose
      if (danceDesigner.movingDancer) {
        if (newPosThreeVector) {
          // Clamp the position to within the boundaries of the stage
          if (danceDesigner.selection.position.x > danceDesigner.xMax) {
            newPosThreeVector.x = danceDesigner.xMax;
            danceDesigner.selection.position.x = danceDesigner.xMax;
          } else if (danceDesigner.selection.position.x < danceDesigner.xMin) {
            newPosThreeVector.x = danceDesigner.xMin;
            danceDesigner.selection.position.x = danceDesigner.xMin;
          }
          if (danceDesigner.selection.position.z > danceDesigner.zMax) {
            newPosThreeVector.z = danceDesigner.zMax;
            danceDesigner.selection.position.z = danceDesigner.zMax;
          } else if (danceDesigner.selection.position.z < danceDesigner.zMin) {
            newPosThreeVector.z = danceDesigner.zMin;
            danceDesigner.selection.position.z = danceDesigner.zMin;
          }
          var newPos = new THREE.Vector3(newPosThreeVector.x, newPosThreeVector.y, newPosThreeVector.z);
          // Set the new position
          danceDesigner.newPos = newPos;
        }

      }
    } else {
      // Update position of the plane if need
      var intersects = danceDesigner.raycaster.intersectObjects(danceDesigner.dancersArr);
      if (intersects.length > 0) {
        danceDesigner.plane.position.copy(intersects[0].object.position);
        danceDesigner.plane.lookAt(danceDesigner.camera.position);
      }
    }
  },
  onDocumentMouseUp: async function (event) {
    // event.preventDefault();
    if (event.clientX > danceDesigner.rendererWidth || event.clientY > danceDesigner.rendererWidth) {
      danceDesigner.controls.enabled = false;
      return;
    }
    if (danceDesigner.selection) {
      var oldPosition = danceDesigner.movingDancer.getPosAt(t);
      if (danceDesigner.newPos) {
        if ((Math.abs(danceDesigner.newPos.x - oldPosition.x) < 0.01)
        || (Math.abs(danceDesigner.newPos.z - oldPosition.z) < 0.01)) {
          // TODO: Fix this.
          alert("Editing dancer ", danceDesigner.movingDancer.mesh.material.color, danceDesigner.movingDancer.name);
        } else {
          await addNewKeyFrame(t);
        }
      } else {
        await addNewKeyFrame(t);
      }

      // Push to Undo Buffer
      addToUndoBuffer();
      autoSave();
      justHitUndo = false;
    }
    danceDesigner.movingDancer = null;
    // Enable the controls
    danceDesigner.controls.enabled = true;
    danceDesigner.selection = null;
  }
};

var t = 0;
var lightAngle = 0;
var play = false;
var hasMusic = false;
var audio;
var file;
var audioURL = "https://res.cloudinary.com/hdcz0vo9p/video/upload/v1581906149/default_dbabou.mp3";

var TimelineEditor = function () {

  var container = new UI.Panel();
  container.setId( 'timeline' );

  var keysDown = {};
	document.addEventListener( 'keydown', function ( event ) { keysDown[ event.keyCode ] = true; } );
	document.addEventListener( 'keyup',   function ( event ) { keysDown[ event.keyCode ] = false; } );

  var scale = 5;
	var prevScale = scale;

  var timeline = new UI.Panel();
  timeline.setPosition( 'absolute' );
  timeline.setTop( '80%' );
  timeline.setBottom( '0px' );
  timeline.setWidth( '100%' );
  timeline.setOverflow( 'auto' );
  container.add( timeline );

  var canvasDiv = document.createElement( 'div' );
  canvasDiv.id = 'canvasDiv';
  canvasDiv.style.background = 'rgba( 255, 255, 255, 0.3 )';

  var canvas = document.createElement( 'canvas' );
  canvas.height = '30px';
  canvas.style.width = '100%';
  canvas.style.background = 'rgba( 255, 255, 255, 0.3 )';
	canvas.style.position = 'absolute';
  canvasDiv.appendChild(canvas);
  timeline.dom.appendChild( canvasDiv );

  var scroller = document.createElement( 'div' );
  scroller.id = 'timelineSection';
	scroller.style.position = 'absolute';
	scroller.style.top = '30px';
	scroller.style.bottom = '0px';
	scroller.style.width = '100%';
	scroller.style.overflow = 'auto';
  scroller.style.background = 'rgba( 255, 255, 255, 0.5 )';
	scroller.addEventListener( 'scroll', function ( event ) {

	}, false );
	timeline.dom.appendChild( scroller );

  var timeMarks = [];

  function addTimeMark( t, len ) {

    var newTimeMark = wavesurfer.addRegion({
      id: t,
      start: t,
      end: t + len,
      color: "rgba(118,255,161, 0.8)"
      // color: 'hsla(290, 62%, 70%, 0.9)'
    });

    timeMarks.push({mark: newTimeMark, start: t, end: t + 2})
  }

  function removeTimeMark(time) {
    var region = wavesurfer.regions.list[time];
    region.remove();
  }

  function removeTimeMarks() {
    wavesurfer.clearRegions();
    timeMarks = [];
  }

  function updateKeyframeTimeMark(oldStart, newStart, newEnd) {
    for (var i = 0; i < timeMarks.length; i++) {
      if (timeMarks[i].start == oldStart) {
          timeMarks[i].start = newStart;
          timeMarks[i].end = newEnd;
      }
    }
  }

  return {
    container: container,
    addTimeMark: addTimeMark,
    removeTimeMark: removeTimeMark,
    removeTimeMarks: removeTimeMarks,
    updateKeyframeTimeMark: updateKeyframeTimeMark,
    scroller: scroller,
    scale: scale,
    timeMarks: timeMarks,
  };

};

var timeline = new TimelineEditor();
document.getElementById( 'timelineEditor' ).appendChild( timeline.container.dom );

// Initialize WaveSurfer
var wavesurfer = WaveSurfer.create({
    container: timeline.scroller,
    scrollParent: true,
    waveColor: 'violet',
    progressColor: 'purple',
    barWidth: 2,
    barHeight: 1, // the height of the wave
    barGap: null,
    autoCenter: false,
    // minPxPerSec: 30,
    plugins: [
      TimelinePlugin.create({
        container: "#waveform"
      }),
      CursorPlugin.create({
          showTime: true,
          opacity: 1,
          customShowTimeStyle: {
              'background-color': '#000',
              color: '#fff',
              padding: '2px',
              'font-size': '10px'
          }
      }),
      RegionsPlugin.create({})
    ]
});

wavesurfer.regions.disableDragSelection();

var audioFileName = "EMPTY";

$(document).on('change', ':file', function() {
    var input = $(this),
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [label]);
    audioFileName = label;
    document.getElementById("audioFileName").innerHTML = audioFileName;
});

// Once the user loads a file in the fileinput, the file should be loaded into waveform
document.getElementById("fileinput").addEventListener('change', function(e){
    file = this.files[0];

    if (file) {
        hasMusic = true;
        var reader = new FileReader();

        reader.onload = function (evt) {
            // Create a Blob providing as first argument a typed array with the file buffer
            var blob = new window.Blob([new Uint8Array(evt.target.result)]);

            // Load the blob into Wavesurfer
            wavesurfer.loadBlob(blob);
        };

        reader.onerror = function (evt) {
            console.error("An error ocurred reading the file: ", evt);
        };

        // Read File as an ArrayBuffer
        reader.readAsArrayBuffer(file);
        audio = file;

        // Save the new audio to Cloudinary
        var formData = new FormData();
        formData.append('audio', audio);

        fetch('/saveAudio', {
          method: 'POST', // or 'PUT'
          body: formData,
        })
        .then((response) => response.json())
        .catch(error => console.error('Error:', error))
        .then((response) => {
          audioURL = response.audioURL;
          console.log("AUDIOURL: ", audioURL);
          console.log('Success:', JSON.stringify(response));
        });
    }

}, false);


// Set up listeners on each wavesurfer region
wavesurfer.on('region-create', function(r, e) {
  r.update({color: "rgba(255,222,67, 0.8)"});
});

wavesurfer.on('region-click', function(r, e) {
  r.update({color: "rgba(255,222,67, 0.8)"});
});

wavesurfer.on('region-mouseenter', function(r, e) {
  r.update({color: "rgba(255,222,67, 0.8)"});
});

wavesurfer.on('region-mouseleave', function(r, e) {
  // TODO: do this in a better way. only checks
  if (wavesurfer.getCurrentTime() > r.end || wavesurfer.getCurrentTime() < r.start) {
    r.update({color: "rgba(118,255,161, 0.8)"});
  }
});

wavesurfer.on('region-in', function(r, e) {
  r.update({color: "rgba(255,222,67, 0.8)"});
});

wavesurfer.on('region-out', function(r, e) {
  r.update({color: "rgba(118,255,161, 0.8)"});
});

wavesurfer.on('region-update-end', function(r, e) {
  console.log(parseFloat(r.id));
  var oldStart = parseFloat(r.id);
  timeline.updateKeyframeTimeMark(parseFloat(r.id), r.start, r.end);
  r.update({id: r.start});

  // Update the keyframe positions
  for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
    var d = danceDesigner.s.dancers[i];
    d.updateKeyFrame(oldStart, r.start, r.end);
  }
  for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
    if (danceDesigner.s.keyframes[i] == oldStart) {
      danceDesigner.s.keyframes[i] = r.start;
    }
  }
  danceDesigner.s.keyframes.sort(function(a, b) {
    return a - b;
  });

  autoSave();
});


function animate() {

  t = wavesurfer.getCurrentTime();

  if (t > danceDesigner.maxT) {
    for (var i = 0; i < danceDesigner.s.dancers.length; i++) {

      var d = danceDesigner.s.dancers[i];
      var lastIndex = d.keyframePositions.length - 1;
      d.mesh.position.x = d.keyframePositions[lastIndex].position.x;
      d.mesh.position.y = d.keyframePositions[lastIndex].position.y;
      d.mesh.position.z = d.keyframePositions[lastIndex].position.z;

    }
  } else {

    for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
      var d = danceDesigner.s.dancers[i];

      if (d == danceDesigner.movingDancer) {
        if (danceDesigner.newPos) {
          d.mesh.position.x = danceDesigner.newPos.x;
          d.mesh.position.y = danceDesigner.newPos.y;
          d.mesh.position.z = danceDesigner.newPos.z;
        }
        continue;
      }
      if (d.keyframePositions.length == 1) {
        var lastIndex = d.keyframePositions.length - 1;
        d.mesh.position.x = d.keyframePositions[lastIndex].position.x;
        d.mesh.position.y = d.keyframePositions[lastIndex].position.y;
        d.mesh.position.z = d.keyframePositions[lastIndex].position.z;
      } else {
        for (var j = 0; j < d.keyframePositions.length - 1; j++) {
          var currKeyFramePos = d.keyframePositions[j];
          var nextKeyFramePos = d.keyframePositions[j+1];
          if (t == currKeyFramePos.start ||
            (t > currKeyFramePos.start && t < currKeyFramePos.end) ||
          (t == currKeyFramePos.end)) {
            d.mesh.position.x = currKeyFramePos.position.x;
            d.mesh.position.y = currKeyFramePos.position.y;
            d.mesh.position.z = currKeyFramePos.position.z;
          } else if (t > currKeyFramePos.end && t < nextKeyFramePos.start) {
            var diff = nextKeyFramePos.start - currKeyFramePos.end;
            var frac = (t - currKeyFramePos.end) / diff;
            // console.log(nextKeyFramePos);
            d.mesh.position.x = currKeyFramePos.position.x + (frac * (nextKeyFramePos.position.x - currKeyFramePos.position.x));
            d.mesh.position.y = currKeyFramePos.position.y + (frac * (nextKeyFramePos.position.y - currKeyFramePos.position.y));
            d.mesh.position.z = currKeyFramePos.position.z + (frac * (nextKeyFramePos.position.z - currKeyFramePos.position.z));
          } else if (t == nextKeyFramePos.start ||
            (t > nextKeyFramePos.start && t < nextKeyFramePos.end) ||
          (t == nextKeyFramePos.end)) {
            d.mesh.position.x = nextKeyFramePos.position.x;
            d.mesh.position.y = nextKeyFramePos.position.y;
            d.mesh.position.z = nextKeyFramePos.position.z;
          }
        }
      }
    }
  }
  requestAnimationFrame( animate );
  render();
  update();
}

var undoBuffer = [];
var moveNumber = 0;
var undoBufferFilled = false;

async function addToUndoBuffer() {
  moveNumber++;

  // TODO: Update the undo buffer.
  // TODO: Implement the redo buffer.
  // Copy over the dancers
  let oldDancers = [];
  for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
      const newDancer = await danceDesigner.s.dancers[i].clone();
      oldDancers.push(newDancer);
  }

  // Push to the undo buffer
  undoBuffer.unshift({
    move: moveNumber,
    time: t,
    maxT: danceDesigner.maxT,
    dancers: oldDancers,
    keyframes: danceDesigner.s.keyframes.slice(0)
  });

  // Limit the length
  if (undoBuffer.length > 10) {
    undoBuffer.length == 10;
    undoBufferFilled = true;
  }
}

function autoSave() {
  // Autosave the dance.
  var image = saveAsImage();
  var dancersInfo = [];
  for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
      var dancer = danceDesigner.s.dancers[i];
      // Store the color, name, positions, kfpositions for each dancer
      var dancerInfo = {
        "name": dancer.name,
        "color": dancer.mesh.material.color,
        "keyframePositions": dancer.keyframePositions
      }
      dancersInfo.push(dancerInfo);
  }
  var theseDancers = JSON.stringify(dancersInfo);
  var theseKeyframes = JSON.stringify(danceDesigner.s.keyframes);
  var dance_name= document.getElementById("dance_name").value;

  const data = {
   "dance_id": dance_id,
   "dance_name": dance_name,
   "dancers": theseDancers,
   "keyframes": theseKeyframes,
   "number_of_keyframes": danceDesigner.s.keyframes.length,
   "image": image,
   "audioFileName": audioFileName,
   "audioURL": audioURL,
  };

  document.getElementById("savedStatus").innerHTML = "Saving your changes..."


  fetch('/saveDance', {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then((response) => response.json())
  .then((data) => {
    // console.log('Success:', data);
    document.getElementById("savedStatus").innerHTML = "Saved!"
    return;
  })
  .catch((error) => {
    document.getElementById("savedStatus").innerHTML = "Error: unable to save changes."
    // console.error('Error:', error);
  });
}

function retrieveUndo() {
  // console.log("Undo buffer length: ", undoBuffer.length);
  if (undoBuffer.length == 0) {
    return;
  }

  // Pop from the front of the undo buffer
  return undoBuffer.shift();
}


// Render the scene
function render() {
  if (danceDesigner.renderer) {
    danceDesigner.renderer.render(danceDesigner.scene, danceDesigner.camera);
    danceDesigner.renderer1.render(danceDesigner.scene, danceDesigner.camera1);

    // Render the timeline renderers
    // for (let a = 0; a < danceDesigner.renderers.length; a++) {
    //   var thisRenderer = danceDesigner.renderers[a].renderer;
    //   var scene = danceDesigner.renderers[a].scene;
    //   var time = danceDesigner.renderers[a].time;
    //
    //
    //   if (time == t && play == false) {
    //     thisRenderer.render(danceDesigner.scene, danceDesigner.camera1);
    //   }
    //   else {
    //     for (let i = 0; i < scene.children.length; i ++) {
    //       if (scene.children[i].type == "Mesh" && scene.children[i].geometry.type == "BoxGeometry") {
    //         for (let j = 0; j < danceDesigner.dancerPos.length; j++) {
    //           var d = danceDesigner.dancerPos[i].Dancer;
    //           if (danceDesigner.dancerPos[i][time] != null) {
    //             if (d.name == scene.children[i].geometry.name) {
    //               scene.children[i].position.x = danceDesigner.dancerPos[i][time].x;
    //               scene.children[i].position.y = danceDesigner.dancerPos[i][time].y;
    //               scene.children[i].position.z = danceDesigner.dancerPos[i][time].z;
    //             }
    //           }
    //         }
    //       }
    //     }
    //     thisRenderer.render(scene, danceDesigner.camera1);
    //   }
    // }

  }
}

function currentTimeFormatted(currentTime) {
  var minutes = Math.floor(currentTime / 60);
  var seconds = (currentTime % 60);
  var secondsString;
  if (seconds < 10) {
    secondsString = "0" + seconds.toFixed(2);
  } else {
    secondsString = seconds.toFixed(2);
  }
  if (minutes == 0) {
    return "00:" + secondsString;
  } else if (minutes > 9) {
    return minutes + ":" + secondsString;
  } else return "0" + minutes + ":" + secondsString;
}

// Set button controls and events for each button.
var buttons = document.getElementsByTagName("button");
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", onButtonClick, false);
};
var keyframes = 1;
document.getElementById("Time").innerHTML = "Current Time: " + currentTimeFormatted(t);
document.getElementById("keyFrames").innerHTML = "Total Keyframes: " + keyframes;
var newPosThreeVector = null;

async function addNewKeyFrame(t) {

// TODO: dancer deletion

  var inKeyFrames = false;
  var oldKeyFrameIndex = 0;
  var d = danceDesigner.s.dancers[0];
  for (var i = 0; i < d.keyframePositions.length; i++) {
    if (t == d.keyframePositions[i].start
      || t > d.keyframePositions[i].start && t < d.keyframePositions[i].end
      || t == d.keyframePositions[i].end) {
        inKeyFrames = true;
        oldKeyFrameIndex = i;
        break;
      }
  }

  // if (!danceDesigner.s.keyframes.includes(t)) {
  if (!inKeyFrames) {
    // Adding a new keyframe
    danceDesigner.s.addKeyFrame(t);

    var nextStartTime = 0;
    for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
      if (danceDesigner.s.keyframes[i] > t) {
        nextStartTime = danceDesigner.s.keyframes[i];
        break;
      }
    }
    var len = 2;
    if (nextStartTime > 0) {
      // len = (nextStartTime - t) - 0.5;
      len = 0.5 * (nextStartTime - t);
      if (len < 0.5) {
        alert("Keyframes must be within 0.5 seconds of each other.");
      }
    }
    timeline.addTimeMark(t, len);

    if (t > danceDesigner.maxT) {
      danceDesigner.maxT = t;
    }

    for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
      var dancer = danceDesigner.s.dancers[i];
      if (dancer == danceDesigner.movingDancer) {
        var newPos = new THREE.Vector3(danceDesigner.newPos.x, danceDesigner.newPos.y, danceDesigner.newPos.z);
        danceDesigner.newPos = null;
      } else {
        var dancerMesh = dancer.mesh;
        var newPos = new THREE.Vector3(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z);
      }
      await dancer.addKFPosition(t, t + len, newPos);
    }
  } else {
    // Keyframe already exists
    for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
      var dancer = danceDesigner.s.dancers[i];
      if (dancer == danceDesigner.movingDancer) {
        if (danceDesigner.newPos) {
          var newPos = new THREE.Vector3(danceDesigner.newPos.x, danceDesigner.newPos.y, danceDesigner.newPos.z);
          danceDesigner.newPos = null;
        } else {
          var dancerMesh = dancer.mesh;
          var newPos = new THREE.Vector3(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z);
        }
      } else {
        var dancerMesh = dancer.mesh;
        var newPos = new THREE.Vector3(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z);
      }
      await dancer.addKFPosition(d.keyframePositions[oldKeyFrameIndex].start, d.keyframePositions[oldKeyFrameIndex].end, newPos);
    }
  }

  return;
}

var justHitUndo = false;
var newDancerNumber = 1;
var usersDances = [];
var dance_id = 0;
var next_available_id = 0;
var userData;
var inc = 0;
var txSprites = [];


var elements = document.getElementsByClassName("launchModal");
for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', loadInitModal, false);
}

// TODO: Add an X arrow if the modal is loaded from an existing dance

// Handle button clicking
async function onButtonClick(event) {
  
if (event.target.id === "addDancer") {

    var loader = new THREE.TextureLoader();
    var geometry = new THREE.BoxGeometry(1, 2, 1);
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: loader.load('static/files/janet.jpg')});
    var newMesh = new THREE.Mesh(geometry, material);
    newMesh.name = "Dancer";
    var newDancer = new Dancer("Dancer" + newDancerNumber, newMesh);
    newDancer.updateColor('#'+(Math.random()*0xFFFFFF<<0).toString(16));
    var posDefault = new THREE.Vector3(-15, 0, -20 + inc);
    inc += 2;

    var d = danceDesigner.s.dancers[0];
    for (var i = 0; i < d.keyframePositions.length; i++) {
      newDancer.addKFPosition(d.keyframePositions[i].start, d.keyframePositions[i].end, posDefault);
    }

    newDancer.mesh.position.x = posDefault.x;
    newDancer.mesh.position.y = posDefault.y;
    newDancer.mesh.position.z = posDefault.z;

    // Add the new dancer to the scene
    danceDesigner.scene.add(newDancer.mesh);
    danceDesigner.dancersArr.push(newMesh);
    danceDesigner.s.addDancer(newDancer);

    // Add in the text sprites
    var txSprite = makeTextSprite( "Dancer" + newDancerNumber,
    newDancer.mesh.position.x, newDancer.mesh.position.y + 1.4, newDancer.mesh.position.z,
    { fontsize: 200,
      fontface: "Roboto",
      radius:0,
      textColor: {r:255, g:255, b:255, a:1.0},
      borderColor: { r:0, g:0, b:0, a:0 },
      }
    );
    txSprites.push({"txSprite": txSprite, "dancerMesh": newDancer.mesh});
    console.log(txSprite);
    danceDesigner.scene.add( txSprite );

    // Increment new dancer count
    newDancerNumber++;

  } else if (event.target.id === "undo") {

    if (!justHitUndo) {
      // console.log('DID NOT JUST HIT UNDO');
      var oldState = retrieveUndo();
      if (oldState == null) {
        alert("Cannot undo any further.");
        return;
      }
    }
    var oldState = retrieveUndo();
    if (oldState == null) {
      alert("Cannot undo any further.");
      return;
    }

    t = oldState.time;
    danceDesigner.maxT = oldState.maxT;
    danceDesigner.s.dancers = [];
    for (var i = 0; i < oldState.dancers.length; i++) {
      const oldDancer = await oldState.dancers[i].clone();
      danceDesigner.s.dancers.push(oldDancer);
      // danceDesigner.s.dancers[i].updatePositions();
      danceDesigner.s.dancers[i].computePositions(oldState.keyframes);
    }

    danceDesigner.s.keyframes = oldState.keyframes;

    // Clean up the timeline
    timeline.removeTimeMarks();

    // for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
    //   timeline.addTimeMark(danceDesigner.s.keyframes[i]);
    // }

    var d = danceDesigner.s.dancers[0];
    for (var i = 0; i < d.keyframePositions.length; i++) {
      timeline.addTimeMark(keyframePositions[i].start, keyframePositions[i].end - keyframePositions[i].start);
    }

    // Add the current state to the undo buffer
    if (undoBuffer.length == 0) {
      if (!undoBufferFilled) {
        await addToUndoBuffer();
      }
    }

    justHitUndo = true;

  } else if (event.target.id === "delete") {

    // TODO: Update deletion
    // for (var i = 0; i < wavesurfer.regions.list.length; i++) {
    //   var i = 0;
    // }
    var keyframeIndex = -1;

    // var lessT = Math.round(t - 1);
    // t = Math.round(t);
    // var greaterT = Math.round(t + 1);
    // if (danceDesigner.s.keyframes.includes(t) || danceDesigner.s.keyframes.includes(lessT) || danceDesigner.s.keyframes.includes(greaterT)) {
    //   // Determine where the current time is in the keyframes[] array if it exists
    //   for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
    //     if (danceDesigner.s.keyframes[i] == t || danceDesigner.s.keyframes[i] == lessT || danceDesigner.s.keyframes[i] == greaterT) {
    //       t = danceDesigner.s.keyframes[i];
    //       keyframeIndex = i;
    //     }
    //   }
    // }

    var keyframeStart = 0;
    var d = danceDesigner.s.dancers[0];
    for (var i = 0; i < d.keyframePositions.length; i++) {
      if (t == d.keyframePositions[i].start ||
        t > d.keyframePositions[i].start && t < d.keyframePositions[i].end
        || t == d.keyframePositions[i].end) {
        keyframeIndex = i;
        keyframeStart = d.keyframePositions[i].start;
      }
    }

    if (keyframeIndex == -1) {
      return;
    }

    // Update the dancers' positions in the dance
    for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
      if (keyframeIndex == 0) {
        // Cannot remove the first keyframe
        alert("Cannot remove the first keyframe!");
        return;
      } else if (keyframeIndex == (danceDesigner.s.keyframes.length - 1)) {
        danceDesigner.maxT = danceDesigner.s.keyframes[keyframeIndex - 1];
      }
      danceDesigner.s.dancers[i].removeKeyFrame(keyframeStart);

    }

    // Filter existing keyframes to remove keyframe mark
    danceDesigner.s.keyframes = danceDesigner.s.keyframes.filter(function(time, index, arr){
        return time !== keyframeStart;
    });

    // Update time mark in timeline
    timeline.removeTimeMark(keyframeStart);

    await addToUndoBuffer();
    autoSave();

    justHitUndo = false;
  } else if (event.target.id === "clear") {
    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      danceDesigner.s.dancers[i].positions = [];
      var dancerMesh = danceDesigner.s.dancers[i].mesh;
      danceDesigner.s.dancers[i].updateOnlyPosition();
      timeline.removeTimeMarks();
    }
    danceDesigner.maxT = 0;
    keyframes = 0;
    justHitUndo = false;
  } else if (event.target.id === "play") {
    var playButton = document.getElementById("play");
    var playButtonIcon = document.getElementById("playIcon");
    playButtonIcon.classList.toggle("fa-pause");
    playButtonIcon.classList.toggle("fa-play");
    lightAngle = 0;
    play = true;
    wavesurfer.playPause();
  }
}

async function initNewDance(numDancers) {

  await clearTheStage();
  timeline.addTimeMark(0, 2);

  // Set default silent audio
  file = '/static/files/default.mp3';
  wavesurfer.load(file);
  document.getElementById("audioFileName").innerHTML = "";

  var oldHTML = document.getElementById("modal-body");
  var dancersRows = oldHTML.children[0].children[0].children[1].children[1];
  var newDancers = [];
  for (var j = 0; j < dancersRows.children.length; j++) {
    var child = {};
    child.id = dancersRows.children[j].id;
    child.name = dancersRows.children[j].children[0].value;
    child.color = dancersRows.children[j].children[1].value;
    newDancers.push(child);
  }

// TODO: Edit first keyframe, need to detect that you are in that waveform region

  // Reset the dancers
  var loader = new THREE.TextureLoader();
  newDancerNumber = 0;
  var defaultZValue = -20;
  var offset = 2;
  for (var i = 0; i < numDancers; i++) {
    var geometry = new THREE.BoxGeometry(1, 2, 1);
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: loader.load('static/files/janet.jpg')});
    var newMesh = new THREE.Mesh(geometry, material);
    newMesh.name = "Dancer";
    console.log(newDancers[i].name);
    var newDancer = new Dancer(newDancers[i].name, newMesh);
    newDancer.updateColor(newDancers[i].color);
    if (i < 10) {
      var posDefault = new THREE.Vector3(-15, 0, defaultZValue + (offset * i));
    } else {
      var posDefault = new THREE.Vector3(15, 0, defaultZValue + (offset * (i - 10)));
    }

    newDancer.addKFPosition(0, 2, posDefault);
    newDancer.mesh.position.x = posDefault.x;
    newDancer.mesh.position.y = posDefault.y;
    newDancer.mesh.position.z = posDefault.z;

    var txSprite = makeTextSprite( newDancers[i].name,
    newDancer.mesh.position.x, newDancer.mesh.position.y + 1.4, newDancer.mesh.position.z,
    { fontsize: 200,
      fontface: "Roboto",
      radius:0,
      textColor: {r:255, g:255, b:255, a:1.0},
      borderColor: { r:0, g:0, b:0, a:0 },
    }
    );
    txSprites.push({"txSprite": txSprite, "dancerMesh": newDancer.mesh});
    danceDesigner.scene.add( txSprite );

    // Add the new dancer to the scene
    danceDesigner.scene.add(newDancer.mesh);
    danceDesigner.dancersArr.push(newMesh);
    danceDesigner.s.addDancer(newDancer);

    // Increment new dancer count
    newDancerNumber++;
  }

  danceDesigner.maxT = 0;

}

/**
  * convenience for converting JSON color to rgba that canvas wants
  * Be nice to handle different forms (e.g. no alpha, CSS style, etc.)
  */
 function getCanvasColor ( color ) {
     return "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";
}

/**
*  function for drawing rounded rectangles
*/
function roundRect(ctx, x, y, w, h, r, borderThickness, borderColor, fillColor)
{
   // no point in drawing it if it isn't going to be rendered
   if (fillColor == undefined && borderColor == undefined)
       return;

   x -= borderThickness + r;
   y += borderThickness + r;
   w += borderThickness * 2 + r * 2;
   h += borderThickness * 2 + r * 2;

   ctx.beginPath();
   ctx.moveTo(x+r, y);
   ctx.lineTo(x+w-r, y);
   ctx.quadraticCurveTo(x+w, y, x+w, y-r);
   ctx.lineTo(x+w, y-h+r);
   ctx.quadraticCurveTo(x+w, y-h, x+w-r, y-h);
   ctx.lineTo(x+r, y-h);
   ctx.quadraticCurveTo(x, y-h, x, y-h+r);
   ctx.lineTo(x, y-r);
   ctx.quadraticCurveTo(x, y, x+r, y);
   ctx.closePath();

   ctx.lineWidth = borderThickness;

   // background color
   // border color

   // if the fill color is defined, then fill it
   if (fillColor != undefined) {
       ctx.fillStyle = getCanvasColor(fillColor);
       ctx.fill();
   }

   if (borderThickness > 0 && borderColor != undefined) {
       ctx.strokeStyle = getCanvasColor(borderColor);
       ctx.stroke();
   }
}

var DESCENDER_ADJUST = 1.28;
/**
* Build a text sprite.  We use canvas to write the label in 2D then create a texture
* from the canvas.  Three.js extracts the raster from the canvas and composites that
* into the center of the texture.
*/
function makeTextSprite( message, x, y, z, parameters )
{
 if ( parameters === undefined ) parameters = {};

 var fontface = parameters.hasOwnProperty("fontface") ?
     parameters["fontface"] : "Arial";

 var fontsize = parameters.hasOwnProperty("fontsize") ?
     parameters["fontsize"] : 18;

 var borderThickness = parameters.hasOwnProperty("borderThickness") ?
     parameters["borderThickness"] : 4;

 var borderColor = parameters.hasOwnProperty("borderColor") ?
     parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

 var fillColor = parameters.hasOwnProperty("fillColor") ?
     parameters["fillColor"] : undefined;

 var textColor = parameters.hasOwnProperty("textColor") ?
     parameters["textColor"] : { r:0, g:0, b:255, a:1.0 };

 var radius = parameters.hasOwnProperty("radius") ?
             parameters["radius"] : 6;

 var vAlign = parameters.hasOwnProperty("vAlign") ?
                     parameters["vAlign"] : "center";

 var hAlign = parameters.hasOwnProperty("hAlign") ?
                     parameters["hAlign"] : "center";

 var canvas = document.createElement('canvas');
 var context = canvas.getContext('2d');

 // set a large-enough fixed-size canvas
 canvas.width = 1800;
 canvas.height = 900;

 context.font = fontsize + "px " + fontface;
 context.textBaseline = "alphabetic";
 context.textAlign = "left";

 // get size data (height depends only on font size)
 var metrics = context.measureText( message );
 var textWidth = metrics.width;

 /*
 // need to ensure that our canvas is always large enough
 // to support the borders and justification, if any
 // Note that this will fail for vertical text (e.g. Japanese)
 // The other problem with this approach is that the size of the canvas
 // varies with the length of the text, so 72-point text is different
 // sizes for different text strings.  There are ways around this
 // by dynamically adjust the sprite scale etc. but not in this demo...
 var larger = textWidth > fontsize ? textWidth : fontsize;
 canvas.width = larger * 4;
 canvas.height = larger * 2;
 // need to re-fetch and refresh the context after resizing the canvas
 context = canvas.getContext('2d');
 context.font = fontsize + "px " + fontface;
 context.textBaseline = "alphabetic";
 context.textAlign = "left";
  metrics = context.measureText( message );
 textWidth = metrics.width;

  console.log("canvas: " + canvas.width + ", " + canvas.height + ", texW: " + textWidth);
 */

 // find the center of the canvas and the half of the font width and height
 // we do it this way because the sprite's position is the CENTER of the sprite
 var cx = canvas.width / 2;
 var cy = canvas.height / 2;
 var tx = textWidth/ 2.0;
 var ty = fontsize / 2.0;

 // then adjust for the justification
 if ( vAlign == "bottom")
     ty = 0;
 else if (vAlign == "top")
     ty = fontsize;

 if (hAlign == "left")
     tx = textWidth;
 else if (hAlign == "right")
     tx = 0;

 // the DESCENDER_ADJUST is extra height factor for text below baseline: g,j,p,q. since we don't know the true bbox
 roundRect(context, cx - tx , cy + ty + 0.28 * fontsize,
         textWidth, fontsize * DESCENDER_ADJUST, radius, borderThickness, borderColor, fillColor);

 // text color.  Note that we have to do this AFTER the round-rect as it also uses the "fillstyle" of the canvas
 context.fillStyle = getCanvasColor(textColor);

 context.fillText( message, cx - tx, cy + ty);

 // draw some visual references - debug only
 // drawCrossHairs( context, cx, cy );
 // outlineCanvas(context, canvas);
 // addSphere(x,y,z);

 // canvas contents will be used for a texture
 var texture = new THREE.Texture(canvas)
 texture.needsUpdate = true;

 var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
 var sprite = new THREE.Sprite( spriteMaterial );
 sprite.name = "Sprite";

 // we MUST set the scale to 2:1.  The canvas is already at a 2:1 scale,
 // but the sprite itself is square: 1.0 by 1.0
 // Note also that the size of the scale factors controls the actual size of the text-label
 sprite.scale.set(4,2,1);

 // set the sprite's position.  Note that this position is in the CENTER of the sprite
 sprite.position.set(x, y, z);

return sprite;
}

$(document).on('click', '.createNewDance', function() {
  dance_id = next_available_id;

  // TODO: Guide to a new modal to specify stage dimensions(stretch goal) and audio.
  // TODO: Add secondary modal to specify the dancer's init positions.

  var color1 = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
  var color2 = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
  var innerHTML =
  `<div class="container">
    <div class="row">
      <div class="col-12">
        <p style="color: black;">
          Number of Dancers:
          <input type="number" id="quantity" name="quantity" min="1" max="20" value="2" style="color: black; width: 100px;">
        </p>
      </div>
      <div class="container">
        <div class="row">
          <div class="col-12">
            <p style="color: black;">
              Edit the dancers' names and colors below!
            </p>
          </div>
        </div>
        <div class="row">
          <div class="col-6" id="Dancer1">
            <input type="text" value="Dancer1">
            <input type="color" value="${color1}">
          </div>
          <div class="col-6" id="Dancer2">
            <input type="text" value="Dancer2">
            <input type="color" value="${color2}">
          </div>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById("modal-body").innerHTML = innerHTML;

  var footerHTML =
  `<div class="container" style="justify-content: space-between;">
    <div class="row" style="justify-content: space-between;">
      <button type="button" id="goBack" class="btn btn-primary">Go back</button>
      <button type="button" id="createFinal" class="btn btn-success" data-dismiss="modal">Create!</button>
    </div>
  </div>`;

  document.getElementById("modal-footer").innerHTML = footerHTML;

  document.getElementById("createFinal").addEventListener("click", async function() {
    var numDancers = document.getElementById("quantity").value;
    await initNewDance(numDancers);
    autoSave();
  });

  document.getElementById("goBack").addEventListener("click", function(userData) {
    var userDances = userData.dances;
    var innerHTML = '<div class="container"><div class="row">';
    if (usersDances.length == 0) {
      innerHTML +=
      `<div class="col">
        <p style="color: black;">You haven't created any dances yet. 😔</p>
        </div>`;
    }
    else {
        for (var i = 0; i < usersDances.length; i++) {
        innerHTML +=
        `<div class="col-4 text-center danceBtn" style="justify-content: center;">
          <div class="row" style="justify-content: center;">
            <button type="button" id="${usersDances[i].id}" class="btn btn-light">
              ${usersDances[i].dance_name}
          </button>
          </div>
          <div class="row" style="justify-content: center;">
            <img src=${usersDances[i].image} width="250"/>
          </div>
          <div class="row" style="justify-content: center;">
            <button type="button" id="DELETE${usersDances[i].id}" class="btn btn-danger">
              Delete
            </button>
          </div>
        </div>`;
        // `<div class="col-6 text-center danceBtn" style="justify-content: center;">
        //   <button type="button" id="${usersDances[i].id}" class="btn btn-light">
        //     ${usersDances[i].dance_name} ${usersDances[i].id}
        //   </button>
        //   <img src=${usersDances[i].image} />
        // </div>`;
      }
    }
    innerHTML += '</div></div>';
    document.getElementById("modal-body").innerHTML = innerHTML;

    var footerHTML =
    `<button type="button" id="createNewDance" class="createNewDance btn btn-primary">Create new dance</button>`;

    document.getElementById("modal-footer").innerHTML = footerHTML;

  });
});

$(document).on('click', '.danceBtn', async function(){

  await clearTheStage();

  var selectedDance = usersDances[this.children[0].children[0].id];
  document.getElementById("dance_name").value = selectedDance.dance_name;
  danceDesigner.s.dancers = [];

  wavesurfer.load(selectedDance.audioURL);

  // TODO: Fix this bug of retrieving audio from the database
  // console.log("selectedDance.audioFileName", selectedDance.audioFileName);
  if (selectedDance.audioFileName === "EMPTY") {
    document.getElementById("audioFileName").innerHTML = "";
  } else {
    document.getElementById("audioFileName").innerHTML = selectedDance.audioFileName;
  }

  // Load in the new dance
  var newDancers = JSON.parse(selectedDance.dancers);
  for (var j = 0; j < newDancers.length; j++) {
    var thisDancer = newDancers[j];
    var loader = new THREE.TextureLoader();
    var geometry = new THREE.BoxGeometry(1, 2, 1);
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: loader.load('static/files/janet.jpg')});

    var newMesh = new THREE.Mesh(geometry, material);

    newMesh.name = "Dancer";
    var newDancer = new Dancer(thisDancer.name, newMesh);
    newDancer.updateColor(thisDancer.color);
    var posDefault = thisDancer.keyframePositions[0].position;
    newDancer.addKFPosition(0, 2, posDefault);

    console.log(thisDancer.keyframePositions);
    for (var k = 0; k < thisDancer.keyframePositions.length; k++) {
      newDancer.addKFPosition(thisDancer.keyframePositions[k].start, thisDancer.keyframePositions[k].end, thisDancer.keyframePositions[k].position);
    }

    newDancer.mesh.position.x = posDefault.x;
    newDancer.mesh.position.y = posDefault.y;
    newDancer.mesh.position.z = posDefault.z;

    // Add the new dancer to the scene
    danceDesigner.scene.add(newDancer.mesh);
    danceDesigner.dancersArr.push(newMesh);
    danceDesigner.s.addDancer(newDancer);

    // Add in the text sprites
    var txSprite = makeTextSprite( thisDancer.name,
    newDancer.mesh.position.x, newDancer.mesh.position.y + 1.4, newDancer.mesh.position.z,
    { fontsize: 200,
      fontface: "Roboto",
      radius:0,
      textColor: {r:255, g:255, b:255, a:1.0},
      borderColor: { r:0, g:0, b:0, a:0 },
      }
    );
    txSprites.push({"txSprite": txSprite, "dancerMesh": newDancer.mesh});
    danceDesigner.scene.add( txSprite );

    // Increment new dancer count
    newDancerNumber++;
  }


  var newKeyframes = JSON.parse(selectedDance.keyframes);
  danceDesigner.s.keyframes = newKeyframes;


  var d = danceDesigner.s.dancers[0];
  console.log(danceDesigner.s.dancers[0].keyframePositions);
  for (var i = 0; i < d.keyframePositions.length; i++) {
    timeline.addTimeMark(d.keyframePositions[i].start, d.keyframePositions[i].end - d.keyframePositions[i].start);
  }

  danceDesigner.maxT = d.keyframePositions[d.keyframePositions.length-1].end;

  // Close the modal
  $('#dancesModal').modal('hide');

});

// TODO: Fix how the thumbnail image is saved to resize despite screen size differences,
// so it is always the same size in the modal.

// TODO: why does login not work on heroku? getting a 401 error.

async function clearTheStage() {

  // Clear the dancers
  while (danceDesigner.scene.getObjectByName("Dancer")) {
    danceDesigner.scene.remove(danceDesigner.scene.getObjectByName("Dancer"));
  }
  danceDesigner.dancersArr = [];

  // Clear the text sprites
  while(danceDesigner.scene.getObjectByName("Sprite")) {
    danceDesigner.scene.remove(danceDesigner.scene.getObjectByName("Sprite"));
  }
  txSprites = [];

  // Clear the time marks from the timeline
  timeline.removeTimeMarks();

  return;
}
//
// var record = document.getElementById("video");
// record.addEventListener("click", function() {
//   var composer = new THREE.EffectComposer(danceDesigner.renderer);
//   // set up effects passes for your app here
//
//   function animate() {
//
// 	requestAnimationFrame( animate );
//
// 	composer.render();
//
//   var threecap = new THREEcap();
//   threecap.record({
//     width: 640,
//     height: 480,
//     fps: 25,
//     time: 10,
//     format: 'mp4',
//     //canvas: canvasDomElement,   // optional, slowest
//     composer: composer // optional, fastest
//   }).then(function(video) {
//     video.saveFile('myVideo.mp4');
//   });
// });

// TODO: fix filming issues
// TODO: make sure keyframes don't overlap -- enforce a min difference between start and end time
// TODO: make sure add dancer works
// TODO: color each handle bar differently to mark start/end

function saveAsImage() {
  var imgData, imgNode;

        try {
            var strMime = "image/jpeg";
            imgData = danceDesigner.renderer1.domElement.toDataURL(strMime);
            var strDownloadMime = "image/octet-stream";
            var danceImgName = dance_id + ".jpg";
            return imgData.replace(strMime, strDownloadMime);
        } catch (e) {
            console.log(e);
            return;
        }
}

// // Volume controls
// var volume = document.getElementById("volume");
// // volume.innerHTML = slider({
// //   	min: 0,
// //   	max: 100,
// //   	value: 0,
// // 		range: "min",
// //   	slide: function(event, ui) {
// //     	wavesurfer.setVolume(ui.value / 100);
// //   	}
// // });
//
// // Update the current slider value (each time you drag the slider handle)
// volume.oninput = function() {
//   console.log('input : ', volume.value);
//   if (wavesurfer) {
//     wavesurfer.setVolume(volume.value / 100);
//   }
// }

var playbackSpeed = 1;
document.querySelector('#volumeSlider').addEventListener('input', function() {
    playbackSpeed = Number(this.value) / 100;
    wavesurfer.setPlaybackRate(playbackSpeed);
});

document.querySelector('#zoomSlider').oninput = function () {
  console.log(this.value);
    wavesurfer.zoom(Number(this.value));
};


// Update controls and stats
function update() {
  document.getElementById("Time").innerHTML = "Current Time: " + currentTimeFormatted(t);
  play = wavesurfer.isPlaying();
  document.getElementById("playbackSpeed").innerHTML = playbackSpeed + "x";

  for (var i = 0; i < txSprites.length; i++) {
    var txSprite = txSprites[i].txSprite;
    var dancerMesh = txSprites[i].dancerMesh;
    txSprite.position.set(dancerMesh.position.x, dancerMesh.position.y + 1.4, dancerMesh.position.z);
  }

  document.getElementById("keyFrames").innerHTML = "Total Keyframes: " + keyframes;
  keyframes = danceDesigner.s.keyframes.length;
  danceDesigner.controls.update();

  if (document.getElementById("quantity")) {
    document.getElementById("quantity").addEventListener("change", function(e) {


      var oldHTML = document.getElementById("modal-body");

      var dancersRows = oldHTML.children[0].children[0].children[1].children[1];

      var newDancers = [];

      for (var j = 0; j < dancersRows.children.length; j++) {

        var child = {};
        child.id = dancersRows.children[j].id;
        child.name = dancersRows.children[j].children[0].value;
        child.color = dancersRows.children[j].children[1].value;

        newDancers.push(child);
      }

      var innerHTML =
      `<div class="container">
        <div class="row">
          <div class="col-12">
            <p style="color: black;">
              Number of Dancers:
              <input type="number" id="quantity" name="quantity" min="1" max="20" value="${e.target.value}" style="color: black; width: 100px;">
            </p>
          </div>`;

      var dancerPickers =
      `<div class="container">
        <div class="row">
          <div class="col-12">
            <p style="color: black;">
              Edit the dancers' names and colors below!
            </p>
          </div>
        </div>
        <div class="row">`;

      for (var i = 0; i < e.target.value; i++) {
        if (i > newDancers.length - 1) {
          var thisColor = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
          dancerPickers +=
          `<div class="col-6" id="Dancer${i+1}">
            <input type="text" value="Dancer${i+1}">
            <input type="color" value="${thisColor}">
          </div>`
        } else {
          dancerPickers +=
          `<div class="col-6" id="Dancer${i+1}">
            <input type="text" value="${newDancers[i].name}">
            <input type="color" value=${newDancers[i].color}>
          </div>`
        }
      };

      dancerPickers += `</div></div>`;

      innerHTML += dancerPickers;
      innerHTML += "</div></div>";

      document.getElementById("modal-body").innerHTML = innerHTML;

    });
  }
}

$(document).ready(function() {
  loadInitModal();
});

function loadInitModal() {
  fetch('/getDances', {
    method: 'GET', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then((response) => response.json())
  .then((myBlob) => {
    next_available_id = myBlob.next_available_id;
    usersDances = myBlob.dances;
    var innerHTML = '<div class="container"><div class="row">';
    if (usersDances.length == 0) {
      innerHTML +=
      `<div class="col">
        <p style="color: black;">You haven't created any dances yet. 😔</p>
        </div>`;
    }
    else {
        for (var i = 0; i < usersDances.length; i++) {
        innerHTML +=
        `<div class="col-4 text-center danceBtn" style="justify-content: center;">
          <div class="row" style="justify-content: center;">
            <button type="button" id="${usersDances[i].id}" class="btn btn-light">
              ${usersDances[i].dance_name}
          </button>
          </div>
          <div class="row" style="justify-content: center;">
            <img src=${usersDances[i].image} width="250"/>
          </div>
          <div class="row" style="justify-content: center;">
            <button type="button" id="DELETE${usersDances[i].id}" class="btn btn-danger">
              Delete
            </button>
          </div>
        </div>`;
      }
    }
    innerHTML += '</div></div>';
    document.getElementById("modal-body").innerHTML = innerHTML;

    var footerHTML = '<button type="button" id="createNewDance" class="createNewDance btn btn-primary">Create new dance</button>';

    document.getElementById("modal-footer").innerHTML = footerHTML;

    $('#dancesModal').modal('show');
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

// Initialize lesson on page load
function initializeLesson() {
  danceDesigner.init();
  animate(0, 0);
  t = 0;
}
if (window.addEventListener)
  window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
