class Position {
  constructor(x, y, z, t) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.time = t;
  }
}

class Dancer {

  constructor(name) {
    this.positions = [];
    this.name = name;
    this.potentialPose = null;

    this.geometry = new THREE.BoxGeometry(1, 2, 1);
    this.material = new THREE.MeshLambertMaterial({ color: 0xff0000});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
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

  clearPositions() {
    this.positions = [];
  }

  addPotentialPos(pos) {
    this.potentialPose = pos;
  }

  addPosition(pos) {
    // Filter existing positions to make sure each time has only one position
    this.positions = this.positions.filter(function(position, index, arr){
        return position.time !== pos.time;
    });
    // Push new position onto dancer's positions
    this.positions.push(pos);
    // Sort all positions in time order
    this.positions.sort(function(a, b) {return a.time - b.time});
  }

  // Removes the position at time t from the dancer's positions
  removePosition(t) {
    this.positions = this.positions.filter(function(position, index, arr){
        return position.time !== t;
    });
  }

  // Returns the position at time t if it exists
  getPosition(t) {
    var i;
    for (i = 0; i < this.positions.length; i++) {
      if (this.positions[i].time === t) {
        return this.positions[i];
      }
    }
    return;
  }

  // Update the position when there is only one keyframe at t = 0
  updateOnlyPosition(newPos) {
    this.positions[0] = newPos;
  }

  // Update the first position
  updateFirstPosition(nextKeyFrameT, newPos) {
    this.positions[0] = newPos;
    this.positions[nextKeyFrameT]
    for (var i = 1; i < nextKeyFrameT; i++) {
      this.positions[i].x = ((this.positions[nextKeyFrameT].x - newPos.x) * i / (nextKeyFrameT)) + newPos.x;
      this.positions[i].y = ((this.positions[nextKeyFrameT].y - newPos.y) * i / (nextKeyFrameT)) + newPos.y;
      this.positions[i].z = ((this.positions[nextKeyFrameT].z - newPos.z) * i / (nextKeyFrameT)) + newPos.z;
    }
  }

}

var newDancerPosObj = {Dancer: d}
newDancerPosObj[0] =
{
  x: d.positions[0].x,
  y: d.positions[0].y,
  z: d.positions[0].z,
};
var j;
for (j = 0; j < d.positions.length - 1; j++) {
  var firstPosX = d.positions[j].x;
  var firstPosY = d.positions[j].y;
  var firstPosZ = d.positions[j].z;
  var firstTime = d.positions[j].time;
  var secondPosX = d.positions[j+1].x;
  var secondPosY = d.positions[j+1].y;
  var secondPosZ = d.positions[j+1].z;
  var secondTime = d.positions[j+1].time;
  var k;
  for (k = firstTime + 1; k <= secondTime; k++) {
    newDancerPosObj[k] =
    {
      x: ((secondPosX - firstPosX) * (k - firstTime) / (secondTime - firstTime)) + firstPosX,
      y: ((secondPosY - firstPosY) * (k - firstTime) / (secondTime - firstTime)) + firstPosY,
      z: ((secondPosZ - firstPosZ) * (k - firstTime) / (secondTime - firstTime)) + firstPosZ,
    };
  }
}

class Stage {

  constructor() {
    this.dancers = [];
    this.keyframes = [];
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

Stage.keyframes:
{[0, 10, 50]}
 dancer.positions[0]
 dancer.positions[10]
 dancer.positions[50]

addKeyFrame -
  need to edit each of dancer.positions[]

  if (stage.keyframes.contains(t)) {
    var keyframeIndex = 0;
    // Determine where the current time is in the keyframes[] array if it exists
    for (var i = 0; i < stage.keyframes.length; i++) {
      if (stage.keyframes[i] == t) {
        keyframeIndex = i;
      }
    }
    for (dancer in stage.dancers) {
      if (i == 0) {
        // Case when we are updating the initial position at t = 0
        if (stage.keyframes.length == 1) {
          dancer.updateOnlyPosition(newPos);
        } else {
          dancer.updateFirstPosition(stage.keyframes[1], newPos);
        }
      } else if (i == (stage.keyframes.length - 1)) {
        // Case when we are updating the last position
        dancer.updateLastPosition(stage.keyframes[i - 1], stage.keyframes[i], newPos);
      } else {
        // Case when we are updating a middle position
        dancer.updateMiddlePosition(stage.keyframes[i - 1], stage.keyframes[i], stage.keyframes[i + 1], newPos);
      }
    }
  } else {
    // Adding a new keyframe
    stage.addKeyFrame(t);
    if (t > stage.keyframes[stage.keyframes.length - 1]) {
      // Adding a new keyframe at the end of the routine
      for (dancer in stage.dancers) {
        dancer.addNewLastPosition(stage.keyframes[stage.keyframes.length - 2], t, newPos);
      }
    } else {
      // Adding a new keyframe in the middle of the routine
      var keyframeIndex = 0;
      // Determine where the current time is in the keyframes[] array if it exists
      for (var i = 0; i < stage.keyframes.length; i++) {
        if (stage.keyframes[i] == t) {
          keyframeIndex = i;
        }
      }
      for (dancer in stage.dancers) {
        dancer.addNewMiddlePosition(stage.keyframes[i - 1], stage.keyframes[i], stage.keyframes[i + 1], newPos);
      }
    }
  }



  for dancer in stage.getDancers() {

    if (stage.keyframes.contains(t)) {
      if (t == 0) {

      } else if (t == danceDesigner.maxT) {

      } else {
        dancer.updatePosition(keyframes[t - 1], keyframes[t]);
      }
    } else {
      if (t > danceDesigner.maxT) {
        dancer.addLatePosition(t);
      }

      dancer.addMiddlePosition(prevKeyFrameT, t, nextKeyFrameT);
    }
  }

if editing dancer.positions[0]:
  -need to recompute dancer.positions[0 to 9]

if editing dancer.positions[10]:
  -need to recompute dancer.positions[1 to 49]

if adding dancer.positions[5]:
  -need to recompute dancer.positions[1 to 9]

if adding dancer.positions[100]:
  -need to add dancer.positions[51 to 100]

dancers:
for each dancer:
positions:
dancer.positions[0] = {position};
dancer.positions[1] = {position};

to play:
  set the positions to each of the dancers to the corresponding dancer.positions[t]

  getDancer(threeJSPose) {
    var i;
    for (i = 0; i < this.dancers.length; i++) {
      var len = this.dancers[i].positions.length;
      // TO DO: interpolate all of the positions to get it so that there are positions
      // along all times! right now you only have 1 position per keyframe, but you need this
      // to be continuous along the entire timeline - ie, have 1 position per unit of time.

      // Reconsider how you are storing positions in general. Why interpolate through
      // all of the positions / compute it individually upon playing?
      var j;
      for (j = 0; j < len; j++) {
        console.log(this.dancers[i].positions[j]);
        if ((Math.abs(this.dancers[i].positions[j].x - threeJSPose.x) < 1) &&
        (Math.abs(this.dancers[i].positions[j].y - threeJSPose.y) < 1) &&
        (Math.abs(this.dancers[i].positions[j].z - threeJSPose.z) < 1)) {
          return this.dancers[i];
        }
      }
    }
    return;
  }

  play() {
    var i;
    for (i = 0; i < this.dancers.length; i++) {
      const d = this.dancers[i];
      var j;
      for (j = 0; j < d.positions.length; j++) {
      }
    }
    return;
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
  raycaster: new THREE.Raycaster(), dancerPos: [], s: null,
  dancersArr: [], dancers: {}, maxT: null, stagePlane: null,
  xMax: null, xMin: null, zMax: null, zMin: null,
  camera1: null, renderer1: null, camera2: null, renderer2: null,
  scene2: null, renderers: [],
  init: function() {
    this.scene = new THREE.Scene();
    this.rendererWidth = window.innerWidth * 8 / 10;
    this.rendererHeight = window.innerHeight * 8 / 10;
    var viewAngle = 45;
    var nearClipping = 0.1;
    var farClipping = 9999;
    this.camera = new THREE.PerspectiveCamera( viewAngle, this.rendererWidth / this.rendererHeight, nearClipping, farClipping );
    this.renderer = new THREE.WebGLRenderer({canvas: document.getElementById("renderer")});
    this.renderer.setSize( this.rendererWidth, this.rendererHeight );
    document.body.appendChild( this.renderer.domElement );

    // Create small renderer for aerial view
    var width1 = window.innerWidth / 6;
    var height1 = window.innerHeight / 6;
    var viewAngle1 = 45;
    // this.camera1 = new THREE.PerspectiveCamera( viewAngle1, width1 / height1, nearClipping, farClipping );
    // this.renderer1 = new THREE.WebGLRenderer({canvas: document.getElementById("0")});
    // document.getElementById("0").addEventListener('click', function() {
    //   t = 0;
    //   timeline.updateTimeMark();
    //   console.log(0);
    // }, false);
    // this.renderer1.setSize( width1, height1 );
    // document.body.appendChild( this.renderer1.domElement );
    // this.camera1.position.z = -10;
    // this.camera1.position.y = 30;
    // this.camera1.lookAt(new THREE.Vector3(0, 0, -10));

    // Events
    document.addEventListener('mousedown', this.onDocumentMouseDown, false);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);

    this.loader = new THREE.TextureLoader();
    var janet = new Dancer("Janet");
    janet.updateColor(0x293fff);
    var j1 = new Position(-2, 0, -5, 0);
    janet.addPosition(j1);
    var geometry = new THREE.BoxGeometry(1, 2, 1);
    geometry.name = "Janet";
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.loader.load('files/janet.jpg')});
    var janetMesh = new THREE.Mesh(geometry, material);
    janetMesh.position.x = j1.x;
    janetMesh.position.y = j1.y;
    janetMesh.position.z = j1.z;
    this.scene.add(janetMesh);

    var phillip = new Dancer("Phillip");
    phillip.updateColor(0xf8f833);
    var p1 = new Position(2, 0, -3, 0);
    phillip.addPosition(p1);
    var phillipMesh;
    var geometry = new THREE.BoxGeometry(1, 2, 1);
    geometry.name = "Phillip";
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.loader.load('files/yoon.jpg')});
    var phillipMesh = new THREE.Mesh(geometry, material);
    phillipMesh.position.x = p1.x;
    phillipMesh.position.y = p1.y;
    phillipMesh.position.z = p1.z;
    this.scene.add(phillipMesh);

    this.s = new Stage();
    this.s.addDancer(janet);
    this.s.addDancer(phillip);
    this.maxT = 0;
    this.dancers = {[janet.name]: janetMesh, [phillip.name]: phillipMesh};
    this.dancersArr = [janetMesh, phillipMesh];
    // this.s.play();

    var spotLight = new THREE.SpotLight( {color: 0xffffff, intensity: 0.1});
    spotLight.position.set( -1, 60, 20 );
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    spotLight.target = phillipMesh;
    this.scene.add( spotLight );

    var spotLightJanet = new THREE.SpotLight( {color: 0xffffff, intensity: 0.1});
    spotLightJanet.position.set( -3, 50, 20 );
    spotLightJanet.castShadow = true;
    spotLightJanet.shadow.mapSize.width = 1024;
    spotLightJanet.shadow.mapSize.height = 1024;
    spotLightJanet.shadow.camera.near = 500;
    spotLightJanet.shadow.camera.far = 4000;
    spotLightJanet.shadow.camera.fov = 30;
    spotLightJanet.target = janetMesh;
    this.scene.add( spotLightJanet );

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
      map: this.loader.load('files/stage.jpg'),
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
    this.camera.position.z = 8;
    this.camera.position.y = 3;
    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls.target.set( 0, 0, -2 );

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
    // Get mouse position
    if (event.clientX > (window.innerWidth * 8 / 10) || event.clientY > (window.innerHeight * 8 / 10)) {
      console.log("outside of window");
      return;
    }
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

      var found = false;
      for (var i = 0; i < danceDesigner.dancerPos.length; i++) {
        var tempT = Math.round(t);
        if (tempT > danceDesigner.maxT) {
          tempT = Math.round(danceDesigner.maxT);
        }
        console.log("t: ", t);
        console.log("maxT: ", danceDesigner.maxT);
        console.log("tempT: ", tempT);
        console.log("NOTICE ME FIRST: ", danceDesigner.dancerPos[i]);
        console.log("NOTICE THIS: ", danceDesigner.dancerPos[i][tempT]);
        if ((Math.abs(danceDesigner.dancerPos[i][tempT].x - intersects[0].object.position.x) < 1) &&
        (Math.abs(danceDesigner.dancerPos[i][tempT].y - intersects[0].object.position.y) < 1) &&
        (Math.abs(danceDesigner.dancerPos[i][tempT].z - intersects[0].object.position.z) < 1)) {
          danceDesigner.movingDancer = danceDesigner.dancerPos[i].Dancer;
          found = true;
        }
      }
      console.log("danceDesigner.selection", danceDesigner.selection);
      // danceDesigner.movingDancer = danceDesigner.s.getDancer(intersects[0].object.position);
      //console.log('movingDancer', danceDesigner.movingDancer);
      // Calculate the offset
      var intersects = danceDesigner.raycaster.intersectObject(danceDesigner.plane);
      danceDesigner.offset.copy(intersects[0].point).sub(danceDesigner.plane.position);
    //  console.log("intersects", intersects);
    }
  },
  onDocumentMouseMove: function (event) {
    event.preventDefault();
    if (event.clientX > (window.innerWidth * 8 / 10) || event.clientY > (window.innerHeight * 8 / 10)) {
      //console.log("outside of window");
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
          //console.log("FIX THIS");
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
          var newPos = new Position(newPosThreeVector.x, newPosThreeVector.y, newPosThreeVector.z, Math.round(t));
          danceDesigner.movingDancer.addPotentialPos(newPos);
          console.log("added new pos");
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
  onDocumentMouseUp: function (event) {
    // Enable the controls
    if (event.clientX > (window.innerWidth * 8 / 10) || event.clientY > (window.innerHeight * 8 / 10)) {
      //console.log("outside of window");
      return;
    }
    if (danceDesigner.selection) {
      addNewKeyFrame(t);
    }
    danceDesigner.movingDancer = null;
    danceDesigner.controls.enabled = true;
    danceDesigner.selection = null;
  }
};

var t = 0;
var lightAngle = 0;
var play = false;

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

  var canvas = document.createElement( 'canvas' );
  canvas.height = 32;
  canvas.style.width = '100%';
  canvas.style.background = 'rgba( 255, 255, 255, 0.3 )';
	canvas.style.position = 'absolute';

  canvas.addEventListener( 'mousedown', function ( event ) {

		event.preventDefault();

		function onMouseMove( event ) {

      t = ((event.offsetX + scroller.scrollLeft) / scale);
      updateTimeMark();

		}

		function onMouseUp( event ) {

			onMouseMove( event );
			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );

		}

    t = ((event.offsetX + scroller.scrollLeft) / scale);
    updateTimeMark();

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
  scroller.id = 'timelineSection';
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

		timeMark.style.left = ( t * scale ) - scroller.scrollLeft - 8 + 'px';

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

  var timeMarks = [];

  function addTimeMark( t ) {

    var newTimeMark = document.createElement( 'div' );
    newTimeMark.style.position = 'absolute';
    newTimeMark.style.top = '0px';
    newTimeMark.style.left = '-8px';
    newTimeMark.style.width = '23px';
    newTimeMark.style.height = '100%';
    newTimeMark.style.background = 'linear-gradient(90deg, transparent 8px, #7f93ff 12px, #7f93ff 13px, transparent 9px) 0% 0% / 16px 16px repeat-y';
    newTimeMark.style.pointerEvents = 'none';

    timeMarks.push({mark: newTimeMark, time: t});
    newTimeMark.style.left = ( t * scale ) - scroller.scrollLeft - 8 + 'px';
    timeline.dom.appendChild( newTimeMark );

  }

  function removeTimeMarks() {
    for (var i = 0; i < timeMarks.length; i++) {
      timeline.dom.removeChild( timeMarks[i].mark);
    }
    timeMarks = [];
  }

  return {
    container: container,
    updateTimeMark: updateTimeMark,
    addTimeMark: addTimeMark,
    removeTimeMarks: removeTimeMarks,
  };

};

var timeline = new TimelineEditor();
document.getElementById( 'timelineEditor' ).appendChild( timeline.container.dom );


function animate() {
  if (play) {
    if (danceDesigner.maxT === 0) {
      play = false;
    }
    if (t > danceDesigner.maxT) {
      play = false;
    }
    timeline.updateTimeMark();
    var i;
    for (i = 0; i < danceDesigner.dancerPos.length; i++) {
      var d = danceDesigner.dancerPos[i].Dancer;
      if (danceDesigner.dancerPos[i][t] != null) {
        danceDesigner.dancers[d.name].position.x = danceDesigner.dancerPos[i][t].x;
        danceDesigner.dancers[d.name].position.y = danceDesigner.dancerPos[i][t].y;
        danceDesigner.dancers[d.name].position.z = danceDesigner.dancerPos[i][t].z;
      }
    }
    t += 1;
    if (t === danceDesigner.maxT) {
      play = false;
    }
    lightAngle += 5;
    if (lightAngle > 360) { lightAngle = 0;};
    danceDesigner.light.position.x = 5 * Math.cos(lightAngle * Math.PI / 180);
    danceDesigner.light.position.z = 5 * Math.sin(lightAngle * Math.PI / 180);
  } else {
    var closestT = Math.round(t);
    if (closestT > danceDesigner.maxT) {
      closestT = danceDesigner.maxT - 1;
    }
    for (i = 0; i < danceDesigner.dancerPos.length; i++) {
      var d = danceDesigner.dancerPos[i].Dancer;
      if (danceDesigner.dancerPos[i][closestT] != null) {
        danceDesigner.dancers[d.name].position.x = danceDesigner.dancerPos[i][closestT].x;
        danceDesigner.dancers[d.name].position.y = danceDesigner.dancerPos[i][closestT].y;
        danceDesigner.dancers[d.name].position.z = danceDesigner.dancerPos[i][closestT].z;
      }
    }
  }
  requestAnimationFrame( animate );
  render();
  update();
}

// Create element function
function create(tagName, props) {
  return Object.assign(document.createElement(tagName), (props || {}));
}

function createElementOnDom (type, id) {
  var element = document.createElement(type);
  element.id = id;
  return element;
}

// Append child function
function ac(p, c) {
  if (c) p.appendChild(c);
  return p;
}

// Render the scene
function render() {
  if (danceDesigner.renderer) {
    danceDesigner.renderer.render(danceDesigner.scene, danceDesigner.camera);
    // danceDesigner.renderer1.render(danceDesigner.scene, danceDesigner.camera1);

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


// Update controls and stats
function update() {
  document.getElementById("Time").innerHTML = "Current Time: " + t;
  document.getElementById("keyFrames").innerHTML = "Total Keyframes: " + keyframes;
  gotoKeyFrame = document.getElementById("gotoKeyFrame").value;
  danceDesigner.controls.update();
}


// Set button controls and events for each button.
var buttons = document.getElementsByTagName("button");
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", onButtonClick, false);
};
var keyframes = 0;
var gotoKeyFrame = document.getElementById("gotoKeyFrame").value;
document.getElementById("Time").innerHTML = "Current Time: " + t;
document.getElementById("keyFrames").innerHTML = "Total Keyframes: " + keyframes;
var newPosThreeVector = null;

function addNewKeyFrame(t) {
  if (t > danceDesigner.maxT) {
    danceDesigner.maxT = t;
  }

  t = Math.round(t);

  for (i = 0; i < danceDesigner.s.dancers.length; i++) {
    var dancerMesh = danceDesigner.dancers[danceDesigner.s.dancers[i].name];
    var newPos = new Position(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z, t);
    danceDesigner.s.dancers[i].addPosition(newPos);
  }

  var i;
  danceDesigner.dancerPos = [];
  // Prepare for every single dancer, interpolate their path from a to b
  for (i = 0; i < danceDesigner.s.dancers.length; i++) {
    var d = danceDesigner.s.dancers[i];
    var newDancerPosObj = {Dancer: d}
    newDancerPosObj[0] =
    {
      x: d.positions[0].x,
      y: d.positions[0].y,
      z: d.positions[0].z,
    };
    var j;
    for (j = 0; j < d.positions.length - 1; j++) {
      var firstPosX = d.positions[j].x;
      var firstPosY = d.positions[j].y;
      var firstPosZ = d.positions[j].z;
      var firstTime = d.positions[j].time;
      var secondPosX = d.positions[j+1].x;
      var secondPosY = d.positions[j+1].y;
      var secondPosZ = d.positions[j+1].z;
      var secondTime = d.positions[j+1].time;
      var k;
      for (k = firstTime + 1; k <= secondTime; k++) {
        newDancerPosObj[k] =
        {
          x: ((secondPosX - firstPosX) * (k - firstTime) / (secondTime - firstTime)) + firstPosX,
          y: ((secondPosY - firstPosY) * (k - firstTime) / (secondTime - firstTime)) + firstPosY,
          z: ((secondPosZ - firstPosZ) * (k - firstTime) / (secondTime - firstTime)) + firstPosZ,
        };
      }
    }
    danceDesigner.dancerPos.push(newDancerPosObj);
  }
  console.log(danceDesigner.dancerPos);
  keyframes++;

  timeline.addTimeMark(t);
}

// Handle button clicking
function onButtonClick(event) {
  if (event.target.id === "setPosition") {
    if (gotoKeyFrame > danceDesigner.maxT / 50) {
      alert("Invalid Keyframe");
    }
    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      var potentialPose = danceDesigner.s.dancers[i].potentialPose;
      if (potentialPose) {
        danceDesigner.s.dancers[i].addPosition(potentialPose);
        console.log("ADDED POSITION");
        danceDesigner.s.dancers[i].potentialPose = null;
      }
    }
  } else if (event.target.id === "addKeyFrame") {
    if (t > danceDesigner.maxT) {
      danceDesigner.maxT = t;
    }

    t = Math.round(t);

    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      var dancerMesh = danceDesigner.dancers[danceDesigner.s.dancers[i].name];
      var newPos = new Position(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z, t);
      danceDesigner.s.dancers[i].addPosition(newPos);
    }

    var i;
    danceDesigner.dancerPos = [];
    // Prepare for every single dancer, interpolate their path from a to b
    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      var d = danceDesigner.s.dancers[i];
      var newDancerPosObj = {Dancer: d}
      newDancerPosObj[0] =
      {
        x: d.positions[0].x,
        y: d.positions[0].y,
        z: d.positions[0].z,
      };
      var j;
      for (j = 0; j < d.positions.length - 1; j++) {
        var firstPosX = d.positions[j].x;
        var firstPosY = d.positions[j].y;
        var firstPosZ = d.positions[j].z;
        var firstTime = d.positions[j].time;
        var secondPosX = d.positions[j+1].x;
        var secondPosY = d.positions[j+1].y;
        var secondPosZ = d.positions[j+1].z;
        var secondTime = d.positions[j+1].time;
        var k;
        for (k = firstTime + 1; k <= secondTime; k++) {
          newDancerPosObj[k] =
          {
            x: ((secondPosX - firstPosX) * (k - firstTime) / (secondTime - firstTime)) + firstPosX,
            y: ((secondPosY - firstPosY) * (k - firstTime) / (secondTime - firstTime)) + firstPosY,
            z: ((secondPosZ - firstPosZ) * (k - firstTime) / (secondTime - firstTime)) + firstPosZ,
          };
        }
      }
      danceDesigner.dancerPos.push(newDancerPosObj);
    }
    console.log(danceDesigner.dancerPos);
    keyframes++;

    timeline.addTimeMark(t);

    // var addNewCanvas = true;

    // for (let a = 0; a < danceDesigner.renderers.length; a++) {
    //   var thisRenderer = danceDesigner.renderers[a].renderer;
    //   var scene = danceDesigner.renderers[a].scene;
    //   var time = danceDesigner.renderers[a].time;
    //   if (t == time) {
    //     addNewCanvas = false;
    //   }
    // }

    // if (addNewCanvas) {
      // // Create the new renderer for the timeline
      // var width = window.innerWidth / 6;
      // var height = window.innerHeight / 6;
      // var viewAngle = 45;
      // var nearClipping = 0.1;
      // var farClipping = 9999;
      // var camera = new THREE.PerspectiveCamera( viewAngle, width / height, nearClipping, farClipping );

      // Create new canvas
      // var canvasID = t.toString();
      // console.log('T TO STRING: ', canvasID);
      // var canvas = createElementOnDom('canvas', canvasID);
      // document.getElementById('timelineSection').appendChild(canvas);
      //
      // var renderer = new THREE.WebGLRenderer( {canvas: canvas});
      // renderer.setSize( width, height );
      // // document.body.appendChild( renderer.domElement );
      // camera.position.z = -10;
      // camera.position.y = 30;
      // camera.lookAt(new THREE.Vector3(0, 0, -10));
      // var newScene = danceDesigner.scene.clone();

      // danceDesigner.renderers.push({renderer: renderer, scene: newScene, time: t});

      // document.getElementById(canvasID).addEventListener('click', function() {
      //   t = parseFloat(canvasID);
      //   timeline.updateTimeMark();
      //   console.log(canvasID);
      // }, false);
      // Add child as a child to div, add the result to timelineSection
      // ac(mainWrapper, ac(canvas, renderer.domElement));
    // }

  } else if (event.target.id === "clear") {
    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      danceDesigner.s.dancers[i].positions = [];
      var dancerMesh = danceDesigner.dancers[danceDesigner.s.dancers[i].name];
      var newPos = new Position(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z, 0);
      danceDesigner.s.dancers[i].addPosition(newPos);
      timeline.removeTimeMarks();
    }
    danceDesigner.maxT = 0;
    keyframes = 0;
  } else if (event.target.id === "play") {
    play = false;
    danceDesigner.dancerPos = [];
    var i;
    // Prepare for every single dancer, interpolate their path from a to b
    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      // TimelineEditor.updateTimeMark();
      var d = danceDesigner.s.dancers[i];
      var newDancerPosObj = {Dancer: d}
      newDancerPosObj[0] =
      {
        x: d.positions[0].x,
        y: d.positions[0].y,
        z: d.positions[0].z,
      };
      var j;
      for (j = 0; j < d.positions.length - 1; j++) {
        var firstPosX = d.positions[j].x;
        var firstPosY = d.positions[j].y;
        var firstPosZ = d.positions[j].z;
        var firstTime = d.positions[j].time;
        var secondPosX = d.positions[j+1].x;
        var secondPosY = d.positions[j+1].y;
        var secondPosZ = d.positions[j+1].z;
        var secondTime = d.positions[j+1].time;
        var k;
        for (k = firstTime + 1; k <= secondTime; k++) {
          newDancerPosObj[k] =
          {
            x: ((secondPosX - firstPosX) * (k - firstTime) / (secondTime - firstTime)) + firstPosX,
            y: ((secondPosY - firstPosY) * (k - firstTime) / (secondTime - firstTime)) + firstPosY,
            z: ((secondPosZ - firstPosZ) * (k - firstTime) / (secondTime - firstTime)) + firstPosZ,
          };
        }
      }
      danceDesigner.dancerPos.push(newDancerPosObj);
    }
    if (t > danceDesigner.maxT) {
      t = 0;
    }
    lightAngle = 0;
    play = true;
  }
}


// Initialize lesson on page load
function initializeLesson() {
  danceDesigner.init();
  animate(0, 0);
}
if (window.addEventListener)
  window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
