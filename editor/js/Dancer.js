class Position {
  constructor(x, y, z, t) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.time = t;
  }
}

class Dancer {

  constructor(name, mesh) {
    this.positions = [];
    this.name = name;
    this.potentialPose = null;
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

  clearPositions() {
    this.positions = [];
  }

  addPotentialPos(pos) {
    this.potentialPose = pos;
  }

  async getPotentialPose() {
    // while (this.potentialPose == null) {
    //
    // }
    return this.potentialPose;
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
  // removePosition(t) {
  //   this.positions = this.positions.filter(function(position, index, arr){
  //       return position.time !== t;
  //   });
  // }

  // Returns the position at time t if it exists
  getPosition(t) {
    return this.positions[t];
  }

  // Update the position when there is only one keyframe at t = 0
  async updateOnlyPosition() {
    this.positions[0] = await this.getPotentialPose();
    return;
  }

  // Update the first position
  async updateFirstPosition(nextKeyFrameT) {
    var newPos = await this.getPotentialPose();
    if (this.positions[0] == newPos) {
      return;
    }
    this.positions[0] = newPos;
    for (var i = 1; i < nextKeyFrameT; i++) {
      this.positions[i].x = ((this.positions[nextKeyFrameT].x - newPos.x) * i / (nextKeyFrameT)) + newPos.x;
      this.positions[i].y = ((this.positions[nextKeyFrameT].y - newPos.y) * i / (nextKeyFrameT)) + newPos.y;
      this.positions[i].z = ((this.positions[nextKeyFrameT].z - newPos.z) * i / (nextKeyFrameT)) + newPos.z;
    }
    return;
  }

  // Update the last position
  async updateLastPosition(secondToLastT, finalKeyFrameT) {
    var newPos = await this.getPotentialPose();
    if (this.positions[finalKeyFrameT] == newPos) {
      return;
    }
    this.positions[finalKeyFrameT] = newPos;
    var timeDiff = finalKeyFrameT - secondToLastT;
    for (var i = 1; i < timeDiff; i++) {
      this.positions[secondToLastT + i].x = ((newPos.x - this.positions[secondToLastT].x) * i / (timeDiff)) + this.positions[secondToLastT].x;
      this.positions[secondToLastT + i].y = ((newPos.y - this.positions[secondToLastT].y) * i / (timeDiff)) + this.positions[secondToLastT].y;
      this.positions[secondToLastT + i].z = ((newPos.z - this.positions[secondToLastT].z) * i / (timeDiff)) + this.positions[secondToLastT].z;
    }
    return;
  }

  // Update a position between the first and last positions (in the middle of the routine)
  async updateMiddlePosition(keyframeBeforeT, updatedKeyframeT, keyframeAfterT) {
    var newPos = await this.getPotentialPose();
    if (this.positions[updatedKeyframeT] == newPos) {
      return;
    }
    this.positions[updatedKeyframeT] = newPos;
    var timeDiff = updatedKeyframeT - keyframeBeforeT;
    for (var i = 1; i < timeDiff; i++) {
      this.positions[keyframeBeforeT + i].x = ((newPos.x - this.positions[keyframeBeforeT].x) * i / (timeDiff)) + this.positions[keyframeBeforeT].x;
      this.positions[keyframeBeforeT + i].y = ((newPos.y - this.positions[keyframeBeforeT].y) * i / (timeDiff)) + this.positions[keyframeBeforeT].y;
      this.positions[keyframeBeforeT + i].z = ((newPos.z - this.positions[keyframeBeforeT].z) * i / (timeDiff)) + this.positions[keyframeBeforeT].z;
    }
    timeDiff = keyframeAfterT - updatedKeyframeT;
    for (var i = 1; i < timeDiff; i++) {
      this.positions[updatedKeyframeT + i].x = ((this.positions[keyframeAfterT].x - newPos.x) * i / (timeDiff)) + newPos.x;
      this.positions[updatedKeyframeT + i].y = ((this.positions[keyframeAfterT].y - newPos.y) * i / (timeDiff)) + newPos.y;
      this.positions[updatedKeyframeT + i].z = ((this.positions[keyframeAfterT].z - newPos.z) * i / (timeDiff)) + newPos.z;
    }
    return;
  }

  async addNewLastPosition(oldLastKeyframeT, newLastKeyframeT) {
    var newPos = await this.getPotentialPose();
    var timeDiff = newLastKeyframeT - oldLastKeyframeT;
    for (var i = 1; i < timeDiff; i++) {
      var xVal = ((newPos.x - this.positions[oldLastKeyframeT].x) * i / (timeDiff)) + this.positions[oldLastKeyframeT].x;
      var yVal = ((newPos.y - this.positions[oldLastKeyframeT].y) * i / (timeDiff)) + this.positions[oldLastKeyframeT].y;
      var zVal = ((newPos.z - this.positions[oldLastKeyframeT].z) * i / (timeDiff)) + this.positions[oldLastKeyframeT].z;
      var newPosition = new THREE.Vector3(xVal, yVal, zVal);
      this.positions.push(newPosition);
    }
    this.positions.push(newPos);
  }

  async removeLastKeyframe(secondToLastT, lastKeyframeT) {
    this.positions.length = secondToLastT + 1;
  }

  async removeMiddleKeyframe(beforeT, afterT) {
    var timeDiff = afterT - beforeT;
    for (var i = 1; i < timeDiff; i++) {
      this.positions[beforeT + i].x = ((this.positions[afterT].x - this.positions[beforeT].x) * i / (timeDiff)) + this.positions[beforeT].x;
      this.positions[beforeT + i].y = ((this.positions[afterT].y - this.positions[beforeT].y) * i / (timeDiff)) + this.positions[beforeT].y;
      this.positions[beforeT + i].z = ((this.positions[afterT].z - this.positions[beforeT].z) * i / (timeDiff)) + this.positions[beforeT].z;
    }
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
  scene2: null, renderers: [], clock: null,
  // dancerPos: [], dancers: {},
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
    var geometry = new THREE.BoxGeometry(1, 2, 1);
    geometry.name = "Janet";
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.loader.load('files/janet.jpg')});
    var janetMesh = new THREE.Mesh(geometry, material);
    var janet = new Dancer("Janet", janetMesh);
    janet.updateColor(0x293fff);
    var j1 = new THREE.Vector3(-2, 0, -5);
    janet.addPotentialPos(j1);
    janet.updateOnlyPosition();
    janet.potentialPose = null;
    janet.mesh.position.x = j1.x;
    janet.mesh.position.y = j1.y;
    janet.mesh.position.z = j1.z;
    this.scene.add(janet.mesh);

    var geometry = new THREE.BoxGeometry(1, 2, 1);
    geometry.name = "Phillip";
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.loader.load('files/yoon.jpg')});
    var phillipMesh = new THREE.Mesh(geometry, material);
    var phillip = new Dancer("Phillip", phillipMesh);
    phillip.updateColor(0xf8f833);
    var p1 = new THREE.Vector3(2, 0, -3);
    phillip.addPotentialPos(p1);
    phillip.updateOnlyPosition();
    phillip.potentialPose = null;
    phillip.mesh.position.x = p1.x;
    phillip.mesh.position.y = p1.y;
    phillip.mesh.position.z = p1.z;
    this.scene.add(phillip.mesh);

    this.s = new Stage();
    this.s.addDancer(janet);
    this.s.addDancer(phillip);
    this.maxT = 0;
    //this.dancers = {[janet.name]: janetMesh, [phillip.name]: phillipMesh};
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
    this.controls.maxDistance = 30;

    // Prepare clock
    this.clock = new THREE.Clock();

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
    event.preventDefault();
    if (event.clientY > (window.innerHeight * 8 / 10) && event.clientY < ((window.innerHeight * 8 / 10) + 32)) {

  		function onMouseMove( event ) {

        t = ((event.offsetX + timeline.scroller.scrollLeft) / timeline.scale);
        var lessT = Math.round(t - 1);
        t = Math.round(t);
        var greaterT = Math.round(t + 1);
        if (danceDesigner.s.keyframes.includes(t) || danceDesigner.s.keyframes.includes(lessT) || danceDesigner.s.keyframes.includes(greaterT)) {
          // Determine where the current time is in the keyframes[] array if it exists
          for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
            if (danceDesigner.s.keyframes[i] == t || danceDesigner.s.keyframes[i] == lessT || danceDesigner.s.keyframes[i] == greaterT) {
              t = danceDesigner.s.keyframes[i];
            }
          }
        } else {
          // Set the dancers' position to the maximum position
          for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
            danceDesigner.s.dancers[i].mesh.position.x = danceDesigner.s.dancers[i].positions[danceDesigner.maxT].x;
            danceDesigner.s.dancers[i].mesh.position.y = danceDesigner.s.dancers[i].positions[danceDesigner.maxT].y;
            danceDesigner.s.dancers[i].mesh.position.z = danceDesigner.s.dancers[i].positions[danceDesigner.maxT].z;
          }
        }
        timeline.updateTimeMark();
  		}

  		function onMouseUp( event ) {

        t = ((event.offsetX + timeline.scroller.scrollLeft) / timeline.scale);
  			onMouseMove( event );
        timeline.updateTimeMark();
  			document.removeEventListener( 'mousemove', onMouseMove );
  			document.removeEventListener( 'mouseup', onMouseUp );

  		}

      t = ((event.offsetX + timeline.scroller.scrollLeft) / timeline.scale);
      var lessT = Math.round(t - 1);
      t = Math.round(t);
      var greaterT = Math.round(t + 1);
      if (danceDesigner.s.keyframes.includes(t) || danceDesigner.s.keyframes.includes(lessT) || danceDesigner.s.keyframes.includes(greaterT)) {
        // Determine where the current time is in the keyframes[] array if it exists
        for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
          if (danceDesigner.s.keyframes[i] == t || danceDesigner.s.keyframes[i] == lessT || danceDesigner.s.keyframes[i] == greaterT) {
            t = danceDesigner.s.keyframes[i];
          }
        }
      } else {
        // Set the dancers' position to the maximum position
        for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
          danceDesigner.s.dancers[i].mesh.position.x = danceDesigner.s.dancers[i].positions[danceDesigner.maxT].x;
          danceDesigner.s.dancers[i].mesh.position.y = danceDesigner.s.dancers[i].positions[danceDesigner.maxT].y;
          danceDesigner.s.dancers[i].mesh.position.z = danceDesigner.s.dancers[i].positions[danceDesigner.maxT].z;
        }
      }
      timeline.updateTimeMark();

  		document.addEventListener( 'mousemove', onMouseMove, false );
  		document.addEventListener( 'mouseup', onMouseUp, false );

    } else if (event.clientX > (window.innerWidth * 8 / 10) || event.clientY > ((window.innerHeight * 8 / 10) + 32)) {
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

        var found = false;
        for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
          var tempT = Math.round(t);
          if (tempT > danceDesigner.maxT) {
            tempT = Math.round(danceDesigner.maxT);
          }

          if ((Math.abs(danceDesigner.s.dancers[i].positions[tempT].x - intersects[0].object.position.x) < 1) &&
          (Math.abs(danceDesigner.s.dancers[i].positions[tempT].y - intersects[0].object.position.y) < 1) &&
          (Math.abs(danceDesigner.s.dancers[i].positions[tempT].z - intersects[0].object.position.z) < 1)) {
            danceDesigner.movingDancer = danceDesigner.s.dancers[i];
            found = true;
          }
        }
        // Calculate the offset
        var intersects = danceDesigner.raycaster.intersectObject(danceDesigner.plane);
        danceDesigner.offset.copy(intersects[0].point).sub(danceDesigner.plane.position);
      } else {
        console.log("on stage");
        //vector.project(danceDesigner.camera);
      }
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
          var newPos = new THREE.Vector3(newPosThreeVector.x, newPosThreeVector.y, newPosThreeVector.z);
          danceDesigner.movingDancer.addPotentialPos(newPos);
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
    if (event.clientX > (window.innerWidth * 8 / 10) || event.clientY > (window.innerHeight * 8 / 10)) {
      return;
    }
    if (danceDesigner.selection) {
      addNewKeyFrame(t);
    }
    for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
      danceDesigner.s.dancers[i].potentialPose = null;
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

    var lessT = Math.round(t - 1);
    var greaterT = Math.round(t + 1);
    for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
      if (danceDesigner.s.keyframes[i] == t || danceDesigner.s.keyframes[i] == lessT || danceDesigner.s.keyframes[i] == greaterT) {
        changeTimeMarkColor(danceDesigner.s.keyframes[i], true);
      } else {
        changeTimeMarkColor(danceDesigner.s.keyframes[i], false);
      }
    }
	}

  var timeMarks = [];

  function addTimeMark( t ) {

    var newTimeMark = document.createElement( 'div' );
    newTimeMark.style.position = 'absolute';
    newTimeMark.style.top = '0px';
    newTimeMark.style.left = '-8px';
    newTimeMark.style.width = '30px';
    newTimeMark.style.height = '100%';
    newTimeMark.style.background = 'linear-gradient(90deg, transparent 8px, #7f93ff 16px, #7f93ff 16px, transparent 9px) 0% 0% / 16px 16px repeat-y';
    newTimeMark.style.pointerEvents = 'none';

    timeMarks.push({mark: newTimeMark, time: t});
    newTimeMark.style.left = ( t * scale ) - scroller.scrollLeft - 12 + 'px';
    timeline.dom.appendChild( newTimeMark );

  }

  function removeTimeMark(t) {
    for (var i = 0; i < timeMarks.length; i++) {
      if (timeMarks[i].time == t) {
          timeline.dom.removeChild( timeMarks[i].mark);
          timeMarks.splice(i, 1);
          return;
      }
    }
  }

  function removeTimeMarks() {
    for (var i = 0; i < timeMarks.length; i++) {
      timeline.dom.removeChild( timeMarks[i].mark);
    }
    timeMarks = [];
  }

  function changeTimeMarkColor(t, editing) {
    for (var i = 0; i < timeMarks.length; i++) {
      if (timeMarks[i].time == t) {
        if (editing) {
          timeMarks[i].mark.style.background = 'linear-gradient(90deg, transparent 8px, #ffde00 16px, #ffde00 16px, transparent 9px) 0% 0% / 16px 16px repeat-y';
        } else {
          timeMarks[i].mark.style.background = 'linear-gradient(90deg, transparent 8px, #7f93ff 16px, #7f93ff 16px, transparent 9px) 0% 0% / 16px 16px repeat-y';
        }
        return;
      }
    }
  }

  return {
    container: container,
    updateTimeMark: updateTimeMark,
    addTimeMark: addTimeMark,
    removeTimeMark: removeTimeMark,
    removeTimeMarks: removeTimeMarks,
    changeTimeMarkColor: changeTimeMarkColor,
    scroller: scroller,
    scale: scale,
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
    timeline.changeTimeMarkColor(t, false);
    timeline.updateTimeMark();
    for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
      var d = danceDesigner.s.dancers[i];
      if (d.positions[t]) {
        d.mesh.position.x = d.positions[t].x;
        d.mesh.position.y = d.positions[t].y;
        d.mesh.position.z = d.positions[t].z;
      }
    }
    t += 1;
    lightAngle += 5;
    if (lightAngle > 360) { lightAngle = 0;};
    danceDesigner.light.position.x = 5 * Math.cos(lightAngle * Math.PI / 180);
    danceDesigner.light.position.z = 5 * Math.sin(lightAngle * Math.PI / 180);
  } else {
    var closestT = Math.round(t);
    if (closestT > danceDesigner.maxT) {
      closestT = danceDesigner.maxT - 1;
    }
    for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
      var d = danceDesigner.s.dancers[i];
      if (d.positions[t]) {
        d.mesh.position.x = d.positions[closestT].x;
        d.mesh.position.y = d.positions[closestT].y;
        d.mesh.position.z = d.positions[closestT].z;
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
  keyframes = danceDesigner.s.keyframes.length;
  danceDesigner.controls.update();
}


// Set button controls and events for each button.
var buttons = document.getElementsByTagName("button");
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", onButtonClick, false);
};
var keyframes = 1;
document.getElementById("Time").innerHTML = "Current Time: " + t;
document.getElementById("keyFrames").innerHTML = "Total Keyframes: " + keyframes;
var newPosThreeVector = null;

async function addNewKeyFrame(t) {
  t = Math.round(t);

  for (i = 0; i < danceDesigner.s.dancers.length; i++) {
    var dancerMesh = danceDesigner.s.dancers[i].mesh;
    if (danceDesigner.s.dancers[i].potentialPose == null) {
      var newPos = new THREE.Vector3(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z);
      danceDesigner.s.dancers[i].addPotentialPos(newPos);
    }
  }

  if (danceDesigner.s.keyframes.includes(t)) {
    var keyframeIndex = 0;
    // Determine where the current time is in the keyframes[] array if it exists
    for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
      if (danceDesigner.s.keyframes[i] == t) {
        keyframeIndex = i;
      }
    }
    for (var j = 0; j < danceDesigner.s.dancers.length; j++) {
       var dancer = danceDesigner.s.dancers[j];
       if (keyframeIndex == 0) {
        // Case when we are updating the initial position at t = 0
        if (danceDesigner.s.keyframes.length == 1) {
          dancer.updateOnlyPosition();
        } else {
          dancer.updateFirstPosition(danceDesigner.s.keyframes[1]);
        }
      } else if (keyframeIndex == (danceDesigner.s.keyframes.length - 1)) {
        // Case when we are updating the last position
        dancer.updateLastPosition(danceDesigner.s.keyframes[keyframeIndex - 1], danceDesigner.s.keyframes[keyframeIndex]);
      } else {
        // Case when we are updating a middle position
        dancer.updateMiddlePosition(danceDesigner.s.keyframes[keyframeIndex - 1], danceDesigner.s.keyframes[keyframeIndex], danceDesigner.s.keyframes[keyframeIndex + 1]);
      }
    }
  } else {
    // Adding a new keyframe
    danceDesigner.s.addKeyFrame(t);
    timeline.addTimeMark(t);
    timeline.changeTimeMarkColor(t, true);
    if (t > danceDesigner.s.keyframes[danceDesigner.s.keyframes.length - 2]) {
      // Adding a new keyframe at the end of the routine
      danceDesigner.maxT = t;
      for (var j = 0; j < danceDesigner.s.dancers.length; j++) {
        danceDesigner.s.dancers[j].addNewLastPosition(
          danceDesigner.s.keyframes[danceDesigner.s.keyframes.length - 2], t);
      }
    } else {
      // Adding a new keyframe in the middle of the routine
      var keyframeIndex = 0;
      // Determine where the current time is in the keyframes[] array if it exists
      for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
        if (danceDesigner.s.keyframes[i] == t) {
          keyframeIndex = i;
        }
      }
      for (var j = 0; j < danceDesigner.s.dancers.length; j++) {
        danceDesigner.s.dancers[j].updateMiddlePosition(danceDesigner.s.keyframes[keyframeIndex- 1],
          danceDesigner.s.keyframes[keyframeIndex], danceDesigner.s.keyframes[keyframeIndex + 1]);
      }
    }
  }
  return;
}

// Handle button clicking
function onButtonClick(event) {
  // if (event.target.id === "setPosition") {
  //   if (gotoKeyFrame > danceDesigner.maxT / 50) {
  //     alert("Invalid Keyframe");
  //   }
  //   for (i = 0; i < danceDesigner.s.dancers.length; i++) {
  //     var potentialPose = danceDesigner.s.dancers[i].potentialPose;
  //     if (potentialPose) {
  //       danceDesigner.s.dancers[i].addPosition(potentialPose);
  //       danceDesigner.s.dancers[i].potentialPose = null;
  //     }
  //   }
  // } else
  if (event.target.id === "undo") {
    addNewKeyFrame(t);
  } else if (event.target.id === "delete") {
    var keyframeIndex = -1;

    var lessT = Math.round(t - 1);
    t = Math.round(t);
    var greaterT = Math.round(t + 1);
    if (danceDesigner.s.keyframes.includes(t) || danceDesigner.s.keyframes.includes(lessT) || danceDesigner.s.keyframes.includes(greaterT)) {
      // Determine where the current time is in the keyframes[] array if it exists
      for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
        if (danceDesigner.s.keyframes[i] == t || danceDesigner.s.keyframes[i] == lessT || danceDesigner.s.keyframes[i] == greaterT) {
          t = danceDesigner.s.keyframes[i];
          keyframeIndex = i;
        }
      }
    }

    if (keyframeIndex == -1) {
      return;
    }

    // Update the dancers' positions in the dance
    for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
      if (keyframeIndex == 0) {
        // Cannot remove the first keyframe
        return;
      } else if (keyframeIndex == (danceDesigner.s.keyframes.length - 1)) {
        danceDesigner.s.dancers[i].removeLastKeyframe(danceDesigner.s.keyframes[keyframeIndex - 1], danceDesigner.s.keyframes[keyframeIndex]);
        danceDesigner.maxT = danceDesigner.s.keyframes[keyframeIndex - 1];
      } else {
        danceDesigner.s.dancers[i].removeMiddleKeyframe(danceDesigner.s.keyframes[keyframeIndex - 1], danceDesigner.s.keyframes[keyframeIndex + 1]);
      }

    }

    // Filter existing keyframes to remove keyframe mark
    danceDesigner.s.keyframes = danceDesigner.s.keyframes.filter(function(time, index, arr){
        return time !== t;
    });

    // Update time mark in timeline
    timeline.removeTimeMark(t);

  } else if (event.target.id === "clear") {
    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      danceDesigner.s.dancers[i].positions = [];
      var dancerMesh = danceDesigner.s.dancers[i].mesh;
      danceDesigner.s.dancers[i].updateOnlyPosition();
      timeline.removeTimeMarks();
    }
    danceDesigner.maxT = 0;
    keyframes = 0;
  } else if (event.target.id === "play") {
    play = false;
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
  t = 0;
  timeline.addTimeMark(0);
  timeline.changeTimeMarkColor(0, true);
}
if (window.addEventListener)
  window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
