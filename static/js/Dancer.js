import TimelinePlugin from './WaveSurferTimeline.js';

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
    this.keyframePositions = []; // [ { time: position } ] eg: [ {0: (0,0,0)}, { 20: (0, 1, 10)}]
    this.positions = []; // all positions where the index is the time
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

  clearPositions() {
    this.positions = [];
  }

  addInitPosition(pos) {
    this.positions.push(pos);
  }

  addKFPosition(time, pos) {
    // Filter existing positions to make sure each time has only one position
    this.keyframePositions = this.keyframePositions.filter(function(position, index, arr){
        return position.time !== time;
    });
    var keyframePosition = {time: time, position: pos}
    this.keyframePositions.push(keyframePosition);
    // Sort all positions in time order
    this.keyframePositions.sort(function(a, b) {return a.time - b.time});
  }

  async updatePositions() {
    this.positions[0].x = this.keyframePositions[0].position.x;
    this.positions[0].y = this.keyframePositions[0].position.y;
    this.positions[0].z = this.keyframePositions[0].position.z;
    if (this.keyframePositions.length == 2) {
      var firstTime = this.keyframePositions[0];
      var secondTime = this.keyframePositions[1];
      for (var i = 0; i < secondTime.time; i++) {
        if (this.positions[i]) {
          this.positions[i].x = ((secondTime.position.x - firstTime.position.x) * i / (secondTime.time)) + firstTime.position.x;
          this.positions[i].y = ((secondTime.position.y - firstTime.position.y) * i / (secondTime.time)) + firstTime.position.y;
          this.positions[i].z = ((secondTime.position.z - firstTime.position.z) * i / (secondTime.time)) + firstTime.position.z;
        } else {
          var newPos = new THREE.Vector3(
            ((secondTime.position.x - firstTime.position.x) * i / (secondTime.time)) + firstTime.position.x,
            ((secondTime.position.y - firstTime.position.y) * i / (secondTime.time)) + firstTime.position.y,
            ((secondTime.position.z - firstTime.position.z) * i / (secondTime.time)) + firstTime.position.z
          );
          this.positions[i] = newPos;
        }
      }
      if (this.positions[secondTime.time]) {
        this.positions[secondTime.time].x = secondTime.position.x;
        this.positions[secondTime.time].y = secondTime.position.y;
        this.positions[secondTime.time].z = secondTime.position.z;
      } else {
        var newPos = new THREE.Vector3(secondTime.position.x, secondTime.position.y, secondTime.position.z);
        this.positions[secondTime.time] = newPos;
      }
    } else {
      for (var j = 0; j < this.keyframePositions.length - 1; j++) {
        var firstTime = this.keyframePositions[j];
        var secondTime = this.keyframePositions[j+1];
        var timeDiff = secondTime.time - firstTime.time;
        for (var i = 0; i < timeDiff; i++) {
          if (this.positions[firstTime.time + i]) {
            this.positions[firstTime.time + i].x = ((secondTime.position.x - firstTime.position.x) * i / (timeDiff)) + firstTime.position.x;
            this.positions[firstTime.time + i].y = ((secondTime.position.y - firstTime.position.y) * i / (timeDiff)) + firstTime.position.y;
            this.positions[firstTime.time + i].z = ((secondTime.position.z - firstTime.position.z) * i / (timeDiff)) + firstTime.position.z;
          } else {
            var newPos = new THREE.Vector3(
              ((secondTime.position.x - firstTime.position.x) * i / (timeDiff)) + firstTime.position.x,
              ((secondTime.position.y - firstTime.position.y) * i / (timeDiff)) + firstTime.position.y,
              ((secondTime.position.z - firstTime.position.z) * i / (timeDiff)) + firstTime.position.z
            );
            this.positions[firstTime.time + i] = newPos;
          }
        }
        if (j == this.keyframePositions.length - 2) {
          if (this.positions[secondTime.time]) {
            this.positions[secondTime.time].x = secondTime.position.x;
            this.positions[secondTime.time].y = secondTime.position.y;
            this.positions[secondTime.time].z = secondTime.position.z;
          } else {
            var newPos = new THREE.Vector3(secondTime.position.x, secondTime.position.y, secondTime.position.z);
            this.positions[secondTime.time] = newPos;
          }
        }
      }
    }
    return;
  }

  removeKeyFrame(time) {
    // Filter existing positions to make sure each time has only one position
    this.keyframePositions = this.keyframePositions.filter(function(position, index, arr){
        return position.time !== time;
    });
    return;
  }

  updateKeyFrame(oldT, newT) {
    var pos;
    for (var i = 0; i < this.keyframePositions.length; i++) {
        if (this.keyframePositions[i].time === oldT) {
            pos = this.keyframePositions[i].position;
        }
    }
    this.removeKeyFrame(oldT);
    this.addKFPosition(newT, pos);
    return;
  }

  async clone() {
    var cloneDancer = new Dancer(this.name, this.mesh);
    cloneDancer.positions = await this.positions.slice(0);
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
  scene2: null, renderers: [], dragControls: null,
  // janet: null, phillip: null,
  init: function() {
    this.scene = new THREE.Scene();
    // this.rendererWidth = window.innerWidth * 8 / 10;
    // this.rendererHeight = window.innerHeight * 8 / 10;
    this.rendererWidth = 900;
    this.rendererHeight = 570;
    var viewAngle = 45;
    var nearClipping = 0.1;
    var farClipping = 9999;
    this.camera = new THREE.PerspectiveCamera( viewAngle, this.rendererWidth / this.rendererHeight, nearClipping, farClipping );
    this.renderer = new THREE.WebGLRenderer({canvas: document.getElementById("renderer")});
    this.renderer.setSize( this.rendererWidth, this.rendererHeight );

    // Create small renderer for aerial view
    // var width1 = window.innerWidth / 6;
    // var height1 = window.innerHeight / 6;
    var width1 = 300;
    var height1 = 190;
    var viewAngle1 = 45;
    this.camera1 = new THREE.PerspectiveCamera( viewAngle1, width1 / height1, nearClipping, farClipping );
    this.renderer1 = new THREE.WebGLRenderer({canvas: document.getElementById("0"), preserveDrawingBuffer: true});
    // document.getElementById("0").addEventListener('click', function() {
    //   t = 0;
    //   timeline.updateTimeMark();
    //   console.log(0);
    // }, false);
    this.renderer1.setSize( width1, height1 );
    this.camera1.position.z = -10;
    this.camera1.position.y = 30;
    this.camera1.lookAt(new THREE.Vector3(0, 0, -10));

    // Events
    document.addEventListener('mousedown', this.onDocumentMouseDown, true);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);

    this.loader = new THREE.TextureLoader();
    // var geometry = new THREE.BoxGeometry(1, 2, 1);
    // geometry.name = "Janet";
    // var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.loader.load('static/files/janet.jpg')});
    // var janetMesh = new THREE.Mesh(geometry, material);
    // var janet = new Dancer("Janet", janetMesh);
    // janet.updateColor(0x00c969);
    // var j1 = new THREE.Vector3(-2, 0, -5);
    // janet.addInitPosition(j1);
    // janet.addKFPosition(0, j1);
    // janet.updatePositions();
    // janet.mesh.position.x = j1.x;
    // janet.mesh.position.y = j1.y;
    // janet.mesh.position.z = j1.z;
    // this.scene.add(janet.mesh);

    // var geometry = new THREE.BoxGeometry(1, 2, 1);
    // geometry.name = "Phillip";
    // var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.loader.load('static/files/yoon.jpg')});
    // var phillipMesh = new THREE.Mesh(geometry, material);
    // var phillip = new Dancer("Phillip", phillipMesh);
    // phillip.updateColor(0xf8f833);
    // var p1 = new THREE.Vector3(2, 0, -3);
    // phillip.addInitPosition(p1);
    // phillip.addKFPosition(0, p1);
    // phillip.updatePositions();
    // phillip.mesh.position.x = p1.x;
    // phillip.mesh.position.y = p1.y;
    // phillip.mesh.position.z = p1.z;
    // this.scene.add(phillip.mesh);

    this.s = new Stage();
    // this.s.addDancer(janet);
    // this.s.addDancer(phillip);
    this.maxT = 0;
    this.dancersArr = [];
    // this.dancersArr = [janetMesh, phillipMesh];

    // var spotLight = new THREE.SpotLight( {color: 0xffffff, intensity: 0.1});
    // spotLight.position.set( -1, 60, 20 );
    // spotLight.castShadow = true;
    // spotLight.shadow.mapSize.width = 1024;
    // spotLight.shadow.mapSize.height = 1024;
    // spotLight.shadow.camera.near = 500;
    // spotLight.shadow.camera.far = 4000;
    // spotLight.shadow.camera.fov = 30;
    // spotLight.target = phillipMesh;
    // this.scene.add( spotLight );

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
    this.camera.position.z = 8;
    this.camera.position.y = 3;

    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls.target.set( 0, 0, -2 );
    this.controls.maxDistance = 50;

    this.dragControls = new THREE.DragControls(this.dancersArr, this.camera, this.renderer.domElement);
    this.dragControls.addEventListener( 'dragstart', function ( event ) {
    	event.object.material.emissive.set( 0xaaaaaa );
      console.log("moving object: ", event.object);
      console.log("new position: ", event.object.position);
      danceDesigner.controls.enabled = false;
    } );

    this.dragControls.addEventListener( 'dragend', function ( event ) {
    	event.object.material.emissive.set( 0x000000 );
      console.log("FINAL position: ", event.object.position);
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
        // console.log("adding initial move");
        // console.log("dancers: ", danceDesigner.s.dancers);
        addToUndoBuffer();
      }
      var isMovingAKeyFrame = false;
      var lastKeyframeT = 0;
      // console.log("dancers: ", danceDesigner.s.dancers);
  		function onMouseMove( event ) {

        if (isMovingAKeyFrame) {
          timeline.updateKeyframeTimeMark(lastKeyframeT);
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
  		}

  		async function onMouseUp( event ) {

        if (isMovingAKeyFrame) {

          t = Math.round(t);

          if (lastKeyframeT == 0) {
            // What do you do if the user is moving the first keyframe?
            // Automatically create a new keyframe at time = 0 to replace it
            alert("Cannot move first key frame.");
          }

          var lastKeyframeIndex = 0;
          var currentTimeLessIndex = 0;
          // console.log(danceDesigner.s.keyframes);
          // Determine where the current time is in the keyframes[] array if it exists
          for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
            if (danceDesigner.s.keyframes[i] == lastKeyframeT) {
              lastKeyframeIndex = i;
            }
            if (danceDesigner.s.keyframes[i] < t) {
              currentTimeLessIndex = i;
            }
          }
          var keyframeAdjust = null;
          var secondToLastT = danceDesigner.s.keyframes[danceDesigner.s.keyframes.length - 2];

          // Adjust all of the dancers' positions appropriately.
          for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
            danceDesigner.s.dancers[i].updateKeyFrame(lastKeyframeT, t);
            await danceDesigner.s.dancers[i].updatePositions();
            // Case where the keyframe moved was previously the last keyframe in the routine.
            if (lastKeyframeIndex == danceDesigner.s.keyframes.length - 1) {
              if (t > lastKeyframeT) {
                danceDesigner.maxT = t;
                keyframeAdjust = "Move Last Extend Routine";
              } else {
                // Case where old last position is moving between two other positions
                if (t < secondToLastT) {
                  danceDesigner.maxT = secondToLastT;
                  keyframeAdjust = "Move Last New Order";
                }
                // Case where the last position is still the last posiition
                else {
                  danceDesigner.maxT = t;
                  keyframeAdjust = "Move Last Keep Order";
                }
              }
            } else {
              // Case where the keyframe being moved was previously not the last keyframe in the routine.
              if (t > danceDesigner.s.keyframes[danceDesigner.s.keyframes.length - 1]) {
                danceDesigner.maxT = t;
                // Move the position to a new ending position in the routine
                keyframeAdjust = "Move Middle Position To New End";
              } else {
                keyframeAdjust = "Move Middle Position To New Middle";
              }
            }
          }

          // Adjust the stage's keyframes appropriately
          if (keyframeAdjust == "Move Last Keep Order" || keyframeAdjust == "Move Last Extend Routine") {
            danceDesigner.s.keyframes[lastKeyframeIndex] = t;
          } else {
            danceDesigner.s.keyframes[lastKeyframeIndex] = t;
            danceDesigner.s.keyframes.sort(function(a, b) {
              return a - b;
            });
          }

          isMovingAKeyFrame = false;

          // PUSH TO UNDO BUFFER
          await addToUndoBuffer();
          timeline.updateSetKeyframeTimeMark(lastKeyframeT, t);
          justHitUndo = false;
        }

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
            // Select the keyframe to move it
            isMovingAKeyFrame = true;
            lastKeyframeT = t;
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

    } else if (event.clientX > danceDesigner.rendererHeight || event.clientY > (danceDesigner.rendererHeight + 32)) {
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

          if ((Math.abs(danceDesigner.s.dancers[i].positions[tempT].x - intersects[0].object.position.x) < 1) &&
          (Math.abs(danceDesigner.s.dancers[i].positions[tempT].y - intersects[0].object.position.y) < 1) &&
          (Math.abs(danceDesigner.s.dancers[i].positions[tempT].z - intersects[0].object.position.z) < 1)) {
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
      console.log('updating position');
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
          danceDesigner.movingDancer.positions[t] = newPos;
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
      console.log("ADDING A NEW KEYFRAME");
      await addNewKeyFrame(t);

      // Push to Undo Buffer
      addToUndoBuffer();
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

// var sound = document.getElementById('sound');

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
  canvas.height = 32;
  canvas.style.width = '100%';
  canvas.style.background = 'rgba( 255, 255, 255, 0.3 )';
	canvas.style.position = 'absolute';
  canvasDiv.appendChild(canvas);
  timeline.dom.appendChild( canvasDiv );

  function updateMarks() {

    // canvas.width = scroller.clientWidth;
    //
    // var context = canvas.getContext( '2d', { alpha: false } );
    //
    // context.fillStyle = '#555';
    // context.fillRect( 0, 0, canvas.width, canvas.height );
    //
    // context.strokeStyle = '#888';
    // context.beginPath();
    //
    // context.translate( - scroller.scrollLeft, 0 );
    //
    // var duration = 500;
    // var width = duration * scale;
    // var scale4 = scale / 4;
    //
    // for ( var i = 0.5; i <= width; i += scale ) {
    //
    //   context.moveTo( i + ( scale4 * 0 ), 18 ); context.lineTo( i + ( scale4 * 0 ), 26 );
    //
    //   if ( scale > 16 ) context.moveTo( i + ( scale4 * 1 ), 22 ), context.lineTo( i + ( scale4 * 1 ), 26 );
    //   if ( scale >  8 ) context.moveTo( i + ( scale4 * 2 ), 22 ), context.lineTo( i + ( scale4 * 2 ), 26 );
    //   if ( scale > 16 ) context.moveTo( i + ( scale4 * 3 ), 22 ), context.lineTo( i + ( scale4 * 3 ), 26 );
    //
    // }
    //
    // context.stroke();
    //
    // context.font = '10px Arial';
    // context.fillStyle = '#888'
    // context.textAlign = 'center';
    //
    // var step = Math.max( 1, Math.floor( 64 / scale ) );
    //
    // for ( var i = 0; i < duration; i += step ) {
    //
    //   var minute = Math.floor( i / 60 );
    //   var second = Math.floor( i % 60 );
    //
    //   var text = ( minute > 0 ? minute + ':' : '' ) + ( '0' + second ).slice( - 2 );
    //
    //   context.fillText( text, i * scale, 13 );
    //
    // }

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

    if (!play) {
      wavesurfer.setCurrentTime(keyframeTimeToRealTime(t));
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
    newTimeMark.style.background = 'linear-gradient(90deg, transparent 8px, #1100c9 16px, #1100c9 16px, transparent 9px) 0% 0% / 16px 16px repeat-y';
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

  function updateKeyframeTimeMark(time) {
    for (var i = 0; i < timeMarks.length; i++) {
      if (timeMarks[i].time == time) {
          timeMarks[i].mark.style.left = ( t * scale ) - scroller.scrollLeft - 12 + 'px';
      }
    }
  }

  function updateSetKeyframeTimeMark(oldTime, newTime) {
    for (var i = 0; i < timeMarks.length; i++) {
      if (timeMarks[i].time == oldTime) {
          timeMarks[i].time = newTime;
      }
    }
  }

  function changeTimeMarkColor(t, editing) {
    for (var i = 0; i < timeMarks.length; i++) {
      if (timeMarks[i].time == t) {
        if (editing) {
          timeMarks[i].mark.style.background = 'linear-gradient(90deg, transparent 8px, #ffde00 16px, #ffde00 16px, transparent 9px) 0% 0% / 16px 16px repeat-y';
        } else {
          timeMarks[i].mark.style.background = 'linear-gradient(90deg, transparent 8px, #1100c9 16px, #1100c9 16px, transparent 9px) 0% 0% / 16px 16px repeat-y';
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
    updateKeyframeTimeMark: updateKeyframeTimeMark,
    updateSetKeyframeTimeMark: updateSetKeyframeTimeMark,
    changeTimeMarkColor: changeTimeMarkColor,
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
    plugins: [
      TimelinePlugin.create({
        container: "#waveform"
      })
    ]
});

// Set default silent audio
wavesurfer.load('/static/files/default.mp3');
var file = '/static/files/default.mp3';

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
    }
}, false);

wavesurfer.toggleInteraction();


function animate() {
  if (hasMusic) {
    currentTime = Math.round(wavesurfer.getCurrentTime());
    if (play) {
      t = realTimeToKeyframeTime(wavesurfer.getCurrentTime());
      timeline.changeTimeMarkColor(t, false);
      timeline.updateTimeMark();
    }
    var closestT = Math.round(t);
    if (closestT > danceDesigner.maxT) {
      closestT = danceDesigner.maxT;
      // closestT = danceDesigner.maxT - 1;
    }
    for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
      var d = danceDesigner.s.dancers[i];
      if (d.positions[closestT]) {
        d.mesh.position.x = d.positions[closestT].x;
        d.mesh.position.y = d.positions[closestT].y;
        d.mesh.position.z = d.positions[closestT].z;
      }
    }
  } else {
    if (play) {
      if (danceDesigner.maxT === 0 || t > danceDesigner.maxT) {
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
        if (d.positions[closestT]) {
          d.mesh.position.x = d.positions[closestT].x;
          d.mesh.position.y = d.positions[closestT].y;
          d.mesh.position.z = d.positions[closestT].z;
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

  // Copy over the dancers
  let oldDancers = [];
  for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
    if (danceDesigner.s.dancers[i].positions.length > 0) {
      const newDancer = await danceDesigner.s.dancers[i].clone();
      oldDancers.push(newDancer);
    }
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

  // console.log("undoBuffer: ", undoBuffer);
}

function retrieveUndo() {
  // console.log("Undo buffer length: ", undoBuffer.length);
  if (undoBuffer.length == 0) {
    return;
  }

  // console.log('undo buffer before shifting: ', undoBuffer);

  // Pop from the front of the undo buffer
  return undoBuffer.shift();
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

function keyframeTimeToRealTime(keyframeTime) {
  return keyframeTime / 4;
}

function realTimeToKeyframeTime(realTime) {
  return Math.round(realTime * 4);
}

function currentTimeFormatted(currentTime) {
  var minutes = Math.floor(currentTime / 60);
  var seconds = (currentTime % 60);
  var secondsString;
  if (seconds < 10) {
    secondsString = "0" + seconds;
  } else {
    secondsString = seconds.toString();
  }
  if (minutes == 0) {
    return "00:" + secondsString;
  } else if (minutes > 9) {
    return minutes + ":" + secondsString;
  } else return "0" + minutes + ":" + secondsString;
}

var currentTime = Math.round(wavesurfer.getCurrentTime());

// Update controls and stats
function update() {
  if (hasMusic) {
    document.getElementById("Time").innerHTML = "Current Time: " + currentTimeFormatted(currentTime);
    play = wavesurfer.isPlaying();
  } else {
    document.getElementById("Time").innerHTML = "Current Time: " + currentTimeFormatted(Math.round(keyframeTimeToRealTime(t)));
  }
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
document.getElementById("Time").innerHTML = "Current Time: " + currentTimeFormatted(t);
document.getElementById("keyFrames").innerHTML = "Total Keyframes: " + keyframes;
var newPosThreeVector = null;

async function addNewKeyFrame(t) {
  t = Math.round(t);

  for (var i = 0; i < danceDesigner.s.dancers.length; i++) {
    var dancer = danceDesigner.s.dancers[i];
    var dancerMesh = dancer.mesh;
    var newPos = new THREE.Vector3(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z);
    dancer.addKFPosition(t, newPos);
    await dancer.updatePositions();
  }

  if (!danceDesigner.s.keyframes.includes(t)) {
    // Adding a new keyframe
    danceDesigner.s.addKeyFrame(t);
    timeline.addTimeMark(t);
    timeline.changeTimeMarkColor(t, true);
    danceDesigner.maxT = t;
  }

  return;
}

var justHitUndo = false;
var newDancerNumber = 1;
var usersDances = [];
var dance_id = 0;
var next_available_id = 0;
var userData;

// Handle button clicking
async function onButtonClick(event) {
  if (event.target.id == "saveDance") {

    var image = saveAsImage();
    var theseDancers = JSON.stringify(danceDesigner.s.dancers);
    var theseKeyframes = {"keyframes": danceDesigner.s.keyframes}
    theseKeyframes = JSON.stringify(theseKeyframes);
    var audio = JSON.stringify(file);
    console.log("AUDIO: ", audio);
    var dance_name= document.getElementById("dance_name").value;

   const data = {
     "dance_id": dance_id,
     "dance_name": dance_name,
     "dancers": theseDancers,
     "keyframes": theseKeyframes,
     "number_of_keyframes": danceDesigner.s.keyframes.length,
     "image": image,
     "audio": audio,
    };

    console.log(data);

  fetch('/saveDance', {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then((response) => response.json())
  .then((data) => {
    console.log('Success:', data);
    return;
  })
  .catch((error) => {
    console.error('Error:', error);
  });
} else if (event.target.id === "launchModal") {
  loadInitModal();
// } else if (event.target.id === "createNewDance") {

} else if (event.target.id === "addDancer") {

    var loader = new THREE.TextureLoader();
    var geometry = new THREE.BoxGeometry(1, 2, 1);
    geometry.name = "Dancer" + newDancerNumber;
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: loader.load('static/files/janet.jpg')});
    var newMesh = new THREE.Mesh(geometry, material);
    var newDancer = new Dancer("Dancer" + newDancerNumber, newMesh);
    newDancer.updateColor('#'+(Math.random()*0xFFFFFF<<0).toString(16));
    var posDefault = new THREE.Vector3(-15, 0, -20);
    newDancer.addInitPosition(posDefault);
    newDancer.addKFPosition(0, posDefault);
    newDancer.addKFPosition(t, posDefault);
    newDancer.updatePositions();
    newDancer.mesh.position.x = posDefault.x;
    newDancer.mesh.position.y = posDefault.y;
    newDancer.mesh.position.z = posDefault.z;

    // Add the new dancer to the scene
    danceDesigner.scene.add(newDancer.mesh);
    danceDesigner.dancersArr.push(newMesh);
    danceDesigner.s.addDancer(newDancer);

    // Increment new dancer count
    newDancerNumber++;
  } else if (event.target.id === "undo") {

    if (!justHitUndo) {
      console.log('DID NOT JUST HIT UNDO');
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

    console.log("OLD STATE ", oldState);
    t = oldState.time;
    danceDesigner.maxT = oldState.maxT;
    danceDesigner.s.dancers = [];
    for (var i = 0; i < oldState.dancers.length; i++) {
      const oldDancer = await oldState.dancers[i].clone();
      danceDesigner.s.dancers.push(oldDancer);
      // danceDesigner.s.dancers[i].updatePositions();
      danceDesigner.s.dancers[i].computePositions(oldState.keyframes);
    }
    // danceDesigner.s.dancers = oldState.dancers;

    danceDesigner.s.keyframes = oldState.keyframes;

    // Clean up the timeline
    timeline.removeTimeMarks();
    for (var i = 0; i < danceDesigner.s.keyframes.length; i++) {
      timeline.addTimeMark(danceDesigner.s.keyframes[i]);
    }

    // Update the cursor time mark
    timeline.updateTimeMark();

    // Add the current state to the undo buffer
    if (undoBuffer.length == 0) {
      console.log("undo buffer length is 0");
      if (!undoBufferFilled) {
        await addToUndoBuffer();
      }
    }

    justHitUndo = true;

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
        danceDesigner.maxT = danceDesigner.s.keyframes[keyframeIndex - 1];
      }
      danceDesigner.s.dancers[i].removeKeyFrame(t);

    }

    // Filter existing keyframes to remove keyframe mark
    danceDesigner.s.keyframes = danceDesigner.s.keyframes.filter(function(time, index, arr){
        return time !== t;
    });

    // Update time mark in timeline
    timeline.removeTimeMark(t);

    await addToUndoBuffer();

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
    play = false;
    // init = true;
    if (!hasMusic && t > danceDesigner.maxT) {
      t = 0;
    }
    lightAngle = 0;
    play = true;
    if (hasMusic) {
      wavesurfer.playPause();
    }
  }
}

function initNewDance(numDancers) {
  // var loader = new THREE.TextureLoader();
  // var geometry = new THREE.BoxGeometry(1, 2, 1);

  var defaultZValue = -20;
  var offset = 2;

  for (var i = 0; i < numDancers; i++) {
    var loader = new THREE.TextureLoader();
    var geometry = new THREE.BoxGeometry(1, 2, 1);
    geometry.name = "Dancer" + newDancerNumber;
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: loader.load('static/files/janet.jpg')});
    var newMesh = new THREE.Mesh(geometry, material);
    var newDancer = new Dancer("Dancer" + newDancerNumber, newMesh);
    console.log("new Dancer: ", newDancer);
    newDancer.updateColor('#'+(Math.random()*0xFFFFFF<<0).toString(16));
    var posDefault = new THREE.Vector3(-15, 0, defaultZValue + (offset * i));
    newDancer.addInitPosition(posDefault);
    newDancer.addKFPosition(0, posDefault);
    newDancer.addKFPosition(t, posDefault);
    newDancer.updatePositions();
    newDancer.mesh.position.x = posDefault.x;
    newDancer.mesh.position.y = posDefault.y;
    newDancer.mesh.position.z = posDefault.z;

    // Add the new dancer to the scene
    danceDesigner.scene.add(newDancer.mesh);
    danceDesigner.dancersArr.push(newMesh);
    danceDesigner.s.addDancer(newDancer);

    // Increment new dancer count
    newDancerNumber++;
  }

}

$(document).on('click', '.createNewDance', function() {
  dance_id = next_available_id;

  // TODO: Guide to a new modal to specify the number of dancers in the routine*, stage dimensions(stretch goal), and audio.

  // TODO: Check modal scrollability

  var innerHTML =
  `<div class="container">
    <div class="row">
      <p style="color: black;">
        Number of Dancers:
        <input type="number" id="quantity" name="quantity" min="1" max="20" value="2" style="color: black; width: 100px;">
      </p>
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

  document.getElementById("createFinal").addEventListener("click", function() {
    var numDancers = document.getElementById("quantity").value;
    initNewDance(numDancers);
  });

  document.getElementById("goBack").addEventListener("click", function(userData) {
    console.log('GO BACK');
    var userDances = userData.dances;
    var innerHTML = '<div class="container"><div class="row">';
    if (usersDances.length == 0) {
      innerHTML +=
      `<div class="col">
        <p style="color: black;">You haven't created any dances yet.</p>
        </div>`;
    }
    else {
        for (var i = 0; i < usersDances.length; i++) {
        innerHTML +=
        `<div class="col-6 text-center" style="justify-content: center;">
          <img src=${usersDances[i].image} />
          <button type="button" id="${usersDances[i].id}" class="danceBtn btn btn-primary">
            ${usersDances[i].dance_name} ${usersDances[i].id}
          </button>
        </div>`;
      }
    }
    innerHTML += '</div></div>';
    document.getElementById("modal-body").innerHTML = innerHTML;

    var footerHTML =
    `<button type="button" id="createNewDance" class="createNewDance btn btn-primary">Create new dance</button>`;

    document.getElementById("modal-footer").innerHTML = footerHTML;

  });
});


$(document).on('click', '.danceBtn', function(){
    console.log('clicked');
    console.log(this.id);
    var selectedDance = usersDances[this.id];
    console.log(selectedDance);
    danceDesigner.s.dancers = [];

    var newDancers = JSON.parse(selectedDance.dancers);
    for (var j = 0; j < newDancers.length; j++) {
      var thisDancer = newDancers[j];
      console.log(thisDancer);
      var loader = new THREE.TextureLoader();
      var geometry = new THREE.BoxGeometry(1, 2, 1);
      geometry.name = thisDancer.name;
      var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: loader.load('static/files/janet.jpg')});

      var newMesh = new THREE.Mesh(geometry, material);
      var newDancer = new Dancer(thisDancer.name, newMesh);
      newDancer.updateColor(thisDancer.mesh.materials[0].color);
      var posDefault = thisDancer.positions[0];
      newDancer.addInitPosition(posDefault);
      newDancer.addKFPosition(0, posDefault);

      for (var k = 0; k < thisDancer.keyframePositions.length; k++) {
        newDancer.addKFPosition(thisDancer.keyframePositions[k].time, thisDancer.keyframePositions[k].position);
      }

      newDancer.updatePositions();
      newDancer.mesh.position.x = posDefault.x;
      newDancer.mesh.position.y = posDefault.y;
      newDancer.mesh.position.z = posDefault.z;

      // Add the new dancer to the scene
      danceDesigner.scene.add(newDancer.mesh);
      danceDesigner.dancersArr.push(newMesh);
      danceDesigner.s.addDancer(newDancer);

      // Increment new dancer count
      newDancerNumber++;
    }


    var newKeyframes = JSON.parse(selectedDance.keyframes);
    console.log("PINEAPPLE");
    // Unpack the object the keyframes is stored in
    newKeyframes = newKeyframes.keyframes;
    danceDesigner.s.keyframes = newKeyframes;
    console.log("new keyframes: ", newKeyframes);

    for (var i = 0; i < newKeyframes.length; i++) {
      timeline.addTimeMark(newKeyframes[i]);
    }
    danceDesigner.maxT = newKeyframes[newKeyframes.length - 1];

    // TODO: modify the audio, number of keyframes displayed
    // danceDesigner.s.audio;

    // Close the modal
    $('#dancesModal').modal('hide');

});

function saveAsImage() {
  var imgData, imgNode;

        try {
            var strMime = "image/jpeg";
            imgData = danceDesigner.renderer1.domElement.toDataURL(strMime);
            var strDownloadMime = "image/octet-stream";
            var danceImgName = dance_id + ".jpg";
            // saveFile(imgData.replace(strMime, strDownloadMime), danceImgName);
            return imgData.replace(strMime, strDownloadMime);
        } catch (e) {
            console.log(e);
            return;
        }
}

// var saveFile = function (strData, filename) {
//         var link = document.createElement('a');
//         if (typeof link.download === 'string') {
//             document.body.appendChild(link); //Firefox requires the link to be in the body
//             link.download = filename;
//             link.href = strData;
//             link.click();
//             document.body.removeChild(link); //remove the link when done
//         } else {
//             location.replace(uri);
//         }
//     }

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
        <p style="color: black;">You haven't created any dances yet.</p>
        </div>`;
    }
    else {
        for (var i = 0; i < usersDances.length; i++) {
        innerHTML +=
        `<div class="col-6 text-center" style="justify-content: center;">
          <button type="button" id="${usersDances[i].id}" class="danceBtn btn btn-light">
            ${usersDances[i].dance_name}
          </button>
          <img src=${usersDances[i].image} />
        </div>`;
      }
    }
    innerHTML += '</div></div>';
    document.getElementById("modal-body").innerHTML = innerHTML;

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
  timeline.addTimeMark(0);
  timeline.changeTimeMarkColor(0, true);
}
if (window.addEventListener)
  window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
