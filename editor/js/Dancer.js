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

}

class Stage {

  constructor() {
    this.dancers = [];
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

  getDancer(threeJSPose) {
    var i;
    for (i = 0; i < this.dancers.length; i++) {
      var len = this.dancers[i].positions.length;
      var j;
      for (j = 0; j < len; j++) {
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

    // Create small renderer for timeline
    var width1 = window.innerWidth / 6;
    var height1 = window.innerHeight / 6;
    var viewAngle1 = 45;
    this.camera1 = new THREE.PerspectiveCamera( viewAngle1, width1 / height1, nearClipping, farClipping );
    this.renderer1 = new THREE.WebGLRenderer({canvas: document.getElementById("renderer1")});
    this.renderer1.setSize( width1, height1 );
    document.body.appendChild( this.renderer1.domElement );
    this.camera1.position.z = -10;
    this.camera1.position.y = 30;
    this.camera1.lookAt(new THREE.Vector3(0, 0, -10));

    // Create small renderer for timeline
    var width2 = window.innerWidth / 6;
    var height2 = window.innerHeight / 6;
    var viewAngle2 = 45;
    this.camera2 = new THREE.PerspectiveCamera( viewAngle2, width2 / height2, nearClipping, farClipping );
    this.renderer2 = new THREE.WebGLRenderer();
    this.renderer2.setSize( width2, height2 );
    document.body.appendChild( this.renderer2.domElement );
    this.camera2.position.z = -10;
    this.camera2.position.y = 30;
    this.camera2.lookAt(new THREE.Vector3(0, 0, -10));

    this.renderers.push({renderer: this.renderer2, scene: this.scene.clone(), time: 0});

    // Prepare container
    // this.container = document.createElement('div');
    // document.body.appendChild(this.container);
    // this.container.appendChild(this.renderer.domElement);

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
    this.s.play();

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
  },
  onDocumentMouseDown: function (event) {
    // Get mouse position
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
      danceDesigner.movingDancer = danceDesigner.s.getDancer(intersects[0].object.position);
      // Calculate the offset
      var intersects = danceDesigner.raycaster.intersectObject(danceDesigner.plane);
      danceDesigner.offset.copy(intersects[0].point).sub(danceDesigner.plane.position);
    }
  },
  onDocumentMouseMove: function (event) {
    event.preventDefault();
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
          var newPos = new Position(newPosThreeVector.x, newPosThreeVector.y, newPosThreeVector.z, t);
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
    // Enable the controls
    danceDesigner.controls.enabled = true;
    danceDesigner.selection = null;
  }
};
var t = 0;
var lightAngle = 0;
var play = false;
var getPosition = false;
function animate() {
  if (play) {
    if (danceDesigner.maxT === 0) {
      play = false;
    }
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
  } else if (getPosition) {
    for (i = 0; i < danceDesigner.dancerPos.length; i++) {
      var d = danceDesigner.dancerPos[i].Dancer;
      if (danceDesigner.dancerPos[i][t] != null) {
        danceDesigner.dancers[d.name].position.x = danceDesigner.dancerPos[i][t].x;
        danceDesigner.dancers[d.name].position.y = danceDesigner.dancerPos[i][t].y;
        danceDesigner.dancers[d.name].position.z = danceDesigner.dancerPos[i][t].z;
      }
    }
    getPosition = false;
  }
  requestAnimationFrame( animate );
  render();
  update();
}

// Create element function
function create(tagName, props) {
  return Object.assign(document.createElement(tagName), (props || {}));
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

    for (let i = 0; i < danceDesigner.renderers.length; i++) {
      var renderer = danceDesigner.renderers[i].renderer;
      var scene = danceDesigner.renderers[i].scene;
      var t = danceDesigner.renderers[i].time;

      for (let i = 0; i < scene.children.length; i ++) {
        if (scene.children[i].type == "Mesh" && scene.children[i].geometry != "PlaneGeometry" && scene.children[i].geometry != "PlaneBufferGeometry") {
          console.log(scene.children[i].geometry);
          for (let j = 0; j < danceDesigner.dancerPos.length; j++) {
            var d = danceDesigner.dancerPos[i].Dancer;
            if (d.name == scene.children[i].geometry.name) {
              scene.children[i].position.x = danceDesigner.dancerPos[i][t].x;
              scene.children[i].position.y = danceDesigner.dancerPos[i][t].y;
              scene.children[i].position.z = danceDesigner.dancerPos[i][t].z;
            }
          }
        }
      }
      // for (i = 0; i < danceDesigner.dancerPos.length; i++) {
      //   var d = danceDesigner.dancerPos[i].Dancer;
      //   console.log(t);
      //   console.log(danceDesigner.dancerPos[i][t]);
      //   console.log(danceDesigner.dancers[d.name].potentialPose);
      //   if (danceDesigner.dancerPos[i][t] != null) {
      //     danceDesigner.dancers[d.name].position.x = danceDesigner.dancerPos[i][t].x;
      //     danceDesigner.dancers[d.name].position.y = danceDesigner.dancerPos[i][t].y;
      //     danceDesigner.dancers[d.name].position.z = danceDesigner.dancerPos[i][t].z;
      //   }
      // }

      renderer.render(scene, danceDesigner.camera1);
    }
  }
}
// Update controls and stats
function update() {
  document.getElementById("Time").innerHTML = "Current Time: " + t;
  document.getElementById("keyFrames").innerHTML = "Total Keyframes: " + keyframes;
  gotoKeyFrame = document.getElementById("gotoKeyFrame").value;
  document.getElementById("currentKeyFrame").innerHTML = "Current Keyframe: " + ((t / 50) | 0);
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
document.getElementById("currentKeyFrame").innerHTML = "Current Keyframe: " + ((t / 50) | 0);
var newPosThreeVector = null;

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
        danceDesigner.s.dancers[i].potentialPose = null;
      }
    }
  } else if (event.target.id === "getPosition") {
    if (gotoKeyFrame > danceDesigner.maxT / 50) {
      alert("Invalid Keyframe");
    }
    t = gotoKeyFrame * 50;
    getPosition = true;
  } else if (event.target.id === "addKeyFrame") {
    danceDesigner.maxT += 50;
    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      var dancerMesh = danceDesigner.dancers[danceDesigner.s.dancers[i].name];
      var newPos = new Position(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z, danceDesigner.maxT);
      danceDesigner.s.dancers[i].addPosition(newPos);
    }
    keyframes++;

    // Create the new renderer for the timeline
    var width = window.innerWidth / 6;
    var height = window.innerHeight / 6;
    var viewAngle = 45;
    var nearClipping = 0.1;
    var farClipping = 9999;
    var camera = new THREE.PerspectiveCamera( viewAngle, width / height, nearClipping, farClipping );
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.body.appendChild( renderer.domElement );
    camera.position.z = -10;
    camera.position.y = 30;
    camera.lookAt(new THREE.Vector3(0, 0, -10));
    var newScene = danceDesigner.scene.clone();

    danceDesigner.renderers.push({renderer: renderer, scene: newScene, time: danceDesigner.maxT});

    // Add this renderer to the HTML page
    let timelineSection = document.getElementById("timelineSection");
    // Create new canvas
    let canvas = create("canvas", {class: "timelineCanvas"});
    // Add child as a child to div, add the result to timelineSection
    ac(mainWrapper, ac(canvas, renderer.domElement));

  } else if (event.target.id === "clear") {
    for (i = 0; i < danceDesigner.s.dancers.length; i++) {
      danceDesigner.s.dancers[i].positions = [];
      var dancerMesh = danceDesigner.dancers[danceDesigner.s.dancers[i].name];
      var newPos = new Position(dancerMesh.position.x, dancerMesh.position.y, dancerMesh.position.z, 0);
      danceDesigner.s.dancers[i].addPosition(newPos);
    }
    danceDesigner.maxT = 0;
    keyframes = 0;
  } else if (event.target.id === "play") {
    play = false;
    danceDesigner.dancerPos = [];
    var i;
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
    t = 0;
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
